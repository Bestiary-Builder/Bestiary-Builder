<script setup lang="ts">
import type { Bestiary, CreatureMetaData } from "~/shared";
import { refDebounced, useLocalStorage } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";
import { useDraggable } from "vue-draggable-plus";
import { useFetch } from "@/utils/utils";

const { pinnedCreature = null, collection, canEdit } = defineProps<{ pinnedCreature?: CreatureMetaData["id"] | null; collection: Bestiary; canEdit: boolean }>();
const emit = defineEmits<{
	(e: "hoveredCreature", id: CreatureMetaData["id"]): void;
	(e: "pinCreature", id: CreatureMetaData["id"]): void;
	(e: "deleteCreature", id: CreatureMetaData["id"]): void;
	(e: "copyCreature", id: CreatureMetaData["id"]): void;
}>();
const model = defineModel<CreatureMetaData[]>();
const hoveredCreature = ref<CreatureMetaData["id"] | null>(null);
const debouncedHoveredCreature = refDebounced(hoveredCreature, 200);
const copyButtonOnBestiaryPage = useLocalStorage("copyButtonOnBestiaryPage", false);

watch(debouncedHoveredCreature, () => {
	if (debouncedHoveredCreature.value)
		emit("hoveredCreature", debouncedHoveredCreature.value);
});

// Searching and filtering
const searchText = ref("");
const creatureTypesText = ref("");
const tagText = ref("");
const envText = ref("");
const factionText = ref("");
const sizeText = ref("");
const crSearch = ref([0, 31]);

const filter = (item: CreatureMetaData) => {
	const searchQuery = searchText.value.trim().toLowerCase();
	const creatureQuery = creatureTypesText.value.trim().toLowerCase();
	const tagQuery = tagText.value.trim().toLowerCase();
	const envQuery = envText.value.trim().toLowerCase();
	const factionQuery = factionText.value.trim().toLowerCase();
	const sizeQuery = sizeText.value.trim().toLowerCase();
	const min = crSearch.value[0];
	const max = crSearch.value[1] >= 31 ? Number.POSITIVE_INFINITY : crSearch.value[1];

	if (item.cr < min || (max !== null && item.cr > max))
		return false;

	if (searchQuery && !item.name.toLowerCase().includes(searchQuery))
		return false;

	if (creatureQuery && !item.race.toLowerCase().includes(creatureQuery))
		return false;

	if (tagQuery && !item.tag?.toLowerCase().includes(tagQuery))
		return false;

	if (envQuery && !item.environment?.toLowerCase().includes(envQuery))
		return false;

	if (factionQuery && !item.faction?.toLowerCase().includes(factionQuery))
		return false;

	if (sizeQuery && !item.size?.toLowerCase().includes(sizeQuery))
		return false;
	return true;
};
// --- Grouping ---

type SortMode = "Custom" | "Alphabetical" | "race" | "size" | "tag" | "cr-asc" | "cr-desc";
const sortMode = canEdit ? useLocalStorage<SortMode>("sortModeForBestiaries", "Alphabetical") : ref<SortMode>("Alphabetical");

const sortModeOptions: { title: string; value: SortMode }[] = [
	{ title: "Alphabetically", value: "Alphabetical" },
	{ title: "Custom order", value: "Custom" },
	{ title: "Creature Type", value: "race" },
	{ title: "Size", value: "size" },
	{ title: "Tag", value: "tag" },

	{ title: "CR Ascending", value: "cr-asc" },
	{ title: "CR Descending", value: "cr-desc" },
];

type FlatEntry
	= | { type: "header"; key: string; label: string; groupKey: string; collapsed: boolean; numItems: number }
		| { type: "item"; key: string; data: CreatureMetaData };

const collapsedGroups = ref(new Set<string>());

const toggleGroup = (groupKey: string) => {
	if (collapsedGroups.value.has(groupKey))
		collapsedGroups.value.delete(groupKey);
	else collapsedGroups.value.add(groupKey);
};

// Fresh groups on a new grouping mode shouldn't inherit collapse state from the last one
watch(sortMode, () => {
	collapsedGroups.value = new Set();
});

const flattenedItems = computed<FlatEntry[]>(() => {
	const items = (model.value ?? []).filter(filter);

	if (sortMode.value === "Custom") {
		return items.map(item => ({ type: "item" as const, key: String(item.id), data: item }));
	}

	if (sortMode.value === "Alphabetical") {
		return [...items]
			.sort((a, b) => a.name.localeCompare(b.name))
			.map(item => ({ type: "item" as const, key: String(item.id), data: item }));
	}

	const groupKeyProp: "race" | "size" | "tag" | "cr"
		= sortMode.value === "cr-asc" || sortMode.value === "cr-desc" ? "cr" : sortMode.value;
	const isCr = groupKeyProp === "cr";

	const groups = new Map<string, CreatureMetaData[]>();

	for (const item of items) {
		const groupKey = String(item[groupKeyProp] ?? "Unknown");
		if (groupKeyProp !== "tag")
			groupKey.replace(/ .*/, "");
		if (!groups.has(groupKey))
			groups.set(groupKey, []);
		groups.get(groupKey)!.push(item);
	}

	const sortedGroupKeys = [...groups.keys()].sort((a, b) => {
		if (isCr) {
			const diff = Number(a) - Number(b);
			return sortMode.value === "cr-desc" ? -diff : diff;
		}
		return a.localeCompare(b);
	});

	return sortedGroupKeys.flatMap((groupKey) => {
		const isCollapsed = collapsedGroups.value.has(groupKey);
		const groupItems = isCollapsed
			? []
			: [...groups.get(groupKey)!].sort((a, b) => a.name.localeCompare(b.name));

		return [
			{
				type: "header" as const,
				key: `header-${groupKey}`,
				label: isCr ? `CR ${groupKey}` : (groupKey || `No ${sortMode.value}`),
				groupKey,
				collapsed: isCollapsed,
				numItems: groups.get(groupKey)?.length ?? 0,
			},
			...groupItems.map(item => ({ type: "item" as const, key: String(item.id), data: item })),
		];
	});
});

const displayCR =(cr: number) => {
	if (cr === 0)
		return "0";
	if (cr === 0.125)
		return "1/8";
	if (cr === 0.25)
		return "1/4";
	if (cr === 0.5)
		return "1/2";
	return String(cr);
};
// --- Drag-to-reorder (Custom/flat mode only) ---

const virtualScrollRef = useTemplateRef("virtualScroll");
const draggableControls = ref<ReturnType<typeof useDraggable> | null>(null);

const canDrag = computed(() => sortMode.value === "Custom" && searchText.value.trim() === "");

watch(canDrag, (enabled) => {
	if (enabled)
		draggableControls.value?.resume();
	else draggableControls.value?.pause();
});

const initDraggable = async () => {
	await nextTick();

	const outerScrollEl = virtualScrollRef.value?.$el as HTMLElement | undefined;
	const innerContainerEl = outerScrollEl?.querySelector(".v-virtual-scroll__container") as HTMLElement | null;

	if (!outerScrollEl || !innerContainerEl)
		return;

	draggableControls.value = useDraggable(ref(innerContainerEl), model, {
		animation: 250,
		handle: ".drag-handle",
		disabled: !canEdit,
		scroll: outerScrollEl,
		bubbleScroll: false,
		scrollSensitivity: 500,
		scrollSpeed: 5,
	});

	if (!canDrag.value)
		draggableControls.value.pause();
};

onMounted(initDraggable);

const saveOrder = async () => {
	if (model.value && collection) {
		const orderIds = model.value.map(creature => creature.id);
		await useFetch(`/api/bestiary/${collection.id}/creatures/order`, "POST", orderIds);
	}
};
watch(model, saveOrder);
</script>

<template>
	<div>
		<v-row class="mb-6 pt-2">
			<v-col>
				<v-text-field
					v-model="searchText" label="Search by name" prepend-inner-icon="mdi:magnify" clearable
					density="compact" hide-details @click:clear="searchText = ''"
				/>
			</v-col>
			<v-col>
				<v-select
					v-model="sortMode" :items="sortModeOptions" label="Sort by" density="compact" hide-details
					prepend-inner-icon="mdi:sort"
				/>
			</v-col>
			<v-col cols="1">
				<DropdownMenu>
					<template #activator="{ props }">
						<v-icon-btn icon="mdi:magnify-expand" color="surface-light" v-bind="props" />
					</template>
					<v-card
						max-width="600" class="text-center pa-4" title="Advanced search options"
						:subtitle="`Current options match ${flattenedItems.length} creatures`"
					>
						<v-card-text>
							<v-row>
								<v-col cols="12" class="my-4 px-4">
									<v-range-slider
										v-model="crSearch" :min="0" :max="31" density="compact" hide-details
										strict thumb-label="always" :step="1" class="mt-6" show-ticks="always" :ticks="{ 0: 'Min CR', 31: 'Max CR' }" tick-size="0" color="primary" :track-color="crSearch[0] === 0 && crSearch[1] === 31 ? 'primary' : 'grey'"
									>
										<template #thumb-label="{ modelValue }">
											<span v-if="modelValue === 31">30+</span>
											<span v-else>{{ modelValue }}</span>
										</template>
									</v-range-slider>
								</v-col>
								<v-col cols="6">
									<v-text-field
										v-model="searchText" label="Name" prepend-inner-icon="mdi:magnify" clearable
										hide-details @click:clear="searchText = ''"
									/>
								</v-col>
								<v-col cols="6">
									<v-text-field
										v-model="creatureTypesText" label="Creature type"
										prepend-inner-icon="game-icons:spiked-dragon-head" clearable hide-details @click:clear="creatureTypesText = ''"
									/>
								</v-col>
								<v-col cols="6">
									<v-text-field
										v-model="tagText" label="Tag" prepend-inner-icon="mdi:tag"
										clearable hide-details @click:clear="tagText = ''"
									/>
								</v-col>
								<v-col cols="6">
									<v-text-field
										v-model="envText" label="Environment"
										prepend-inner-icon="mingcute:mountain-2-fill" clearable
										hide-details @click:clear="envText = ''"
									/>
								</v-col>
								<v-col cols="6">
									<v-text-field
										v-model="factionText" label="Faction"
										prepend-inner-icon="mdi:flag" clearable hide-details @click:clear="factionText = ''"
									/>
								</v-col>
								<v-col cols="6">
									<v-text-field
										v-model="sizeText" label="Size"
										prepend-inner-icon="mdi:ruler" clearable hide-details @click:clear="sizeText = ''"
									/>
								</v-col>
							</v-row>
						</v-card-text>
					</v-card>
				</DropdownMenu>
			</v-col>
		</v-row>
		<v-list v-if="flattenedItems.length > 0" density="compact">
			<v-virtual-scroll
				ref="virtualScroll" max-height="500" :items="flattenedItems" item-height="65"
				item-key="key"
			>
				<template #default="{ item }">
					<v-list-item
						v-if="item.type === 'header'" :title="item.label" class="group-header"
						:subtitle="`${item.numItems} creatures`" @click="toggleGroup(item.groupKey)"
					>
						<template #append>
							<v-icon :icon="item.collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" />
						</template>
					</v-list-item>

					<v-list-item
						v-else :title="item.data.name"
						:subtitle="`${item.data.size} ${item.data.race}\nCR ${displayCR(item.data.cr)}`" lines="two"
						class="multiline-subtitle creature-item" @mouseover="hoveredCreature = item.data.id"
					>
						<template v-if="sortMode === 'Custom' && canEdit" #prepend>
							<v-icon
								icon="$drag" class="drag-handle" :class="{ 'drag-handle--disabled': !canDrag }"
								color="primary"
							/>
						</template>

						<template #append>
							<RouterLink
								class="creature" :to="`/creature/${canEdit ? 'edit' : 'view'}/${item.data.id}`"
								:aria-label="`${canEdit ? 'Edit' : 'View'} creature`" size="24"
							>
								<v-icon-btn v-if="canEdit" icon="mdi:pencil" size="24" />
								<v-icon-btn v-else icon="mdi:eye" size="24" style="scale: 0.9;" />
							</RouterLink>
							<v-icon-btn
								text="Pin creature"
								:icon="pinnedCreature === item.data.id ? 'mdi:pin-off' : 'mdi:pin'" size="24"
								@click="emit('pinCreature', item.data.id)"
							/>
							<v-icon-btn
								v-if="copyButtonOnBestiaryPage" text="Copy Creature"
								icon="material-symbols:content-copy" size="24"
								@click="emit('copyCreature', item.data.id)"
							/>
							<DropdownMenu v-if="canEdit">
								<template #activator="{ props }">
									<v-icon-btn text="Delete creature" icon="mdi:delete" v-bind="props" size="24" />
								</template>
								<v-card min-width="300" class="text-center pb-2">
									<v-card-text>
										Are you sure you want to delete <br> <b>{{ item.data.name }}</b>?
									</v-card-text>
									<v-card-actions>
										<v-btn
											size="large" color="error" class="mx-auto"
											@click.stop="emit('deleteCreature', item.data.id);"
										>
											Confirm
										</v-btn>
									</v-card-actions>
								</v-card>
							</DropdownMenu>
						</template>
					</v-list-item>
					<v-divider />
				</template>
			</v-virtual-scroll>
		</v-list>
		<p v-else class="text-center">
			No creatures found
		</p>
	</div>
</template>

<style scoped>
.creature-item,
.group-header {
	transition: background-color 0.1s ease;

	&:hover {
		background-color: rgba(var(--v-theme-on-surface), 0.06);
	}
}

.group-header:deep(.v-list-item-title) {
	font-weight: bold;
	font-size: 0.9rem;
	text-transform: uppercase;
	letter-spacing: 0.03em;
}

.multiline-subtitle :deep(.v-list-item-subtitle) {
	white-space: pre-line;
}

.drag-handle {
	cursor: grab;

	&.drag-handle--disabled {
		cursor: not-allowed;
		opacity: 0.35;
	}

	&:active {
		cursor: grabbing;
	}
}
</style>
