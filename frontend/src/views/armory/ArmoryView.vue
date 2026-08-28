<script setup lang="ts">
import type { AttackModel, AutomationWithType } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";
import { useRules } from "vuetify/labs/rules";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import { useCollection } from "@/components/Bestiary/useCollection";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import ImportToCharacter from "@/components/Characters/ImportToCharacter.vue";
import Markdown from "@/components/Global/Markdown.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { creatureTypes } from "@/utils/constants";
import { ACTION_TYPE_MAP, getActionTypeLabel } from "./utils";

const {
	collection,
	items,
	isOwner,
	isEditor,
	getCollection,

} = useCollection("automations");

const { addToast, removeToast } = useToast();
const rules = useRules();

onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	await getCollection();
	removeToast(toastId);
	if (collection.value?.name)
		document.title = `${collection.value?.name.substring(0, 16)} | Bestiary Builder`;
});

const searchText = ref("");

const searchOptions = ref({
	tags: [] as string[],
	minCr: 0,
	maxCr: 30,
	env: "",
	faction: ""
});

const sortMode = useLocalStorage("sortModeForAutomations", "Alphabetically");

async function exportCollection(asFile: boolean) {
	if (asFile) {
		const file = new File(
			[
				JSON.stringify(
					items.value?.map(obj => obj.automation),
					null,
					2
				)
			],
			"items.txt",
			{
				type: "text/plain"
			}
		);

		// https://javascript.plainenglish.io/javascript-create-file-c36f8bccb3be
		const link = document.createElement("a");
		const url = URL.createObjectURL(file);

		link.href = url;
		link.download = file.name;
		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	}
	else {
		await navigator.clipboard.writeText(
			JSON.stringify(
				items.value?.map(obj => obj.automation),
				null,
				2
			)
		);
		addToast("Exported this collection to your clipboard.");
		void getUmami()?.track("Export collection to clipboard");
	}
}

// misc
const editorToAdd = ref("");
const showWarning = ref(false);

watch(() => collection.value?.status, (newValue): void => {
	if (newValue === "private" || newValue === "public")
		showWarning.value = false;
	if (newValue === "public")
		showWarning.value = true;
});

watch(() => collection.value?.name, (): void => {
	if (collection.value?.name)
		document.title = `${collection.value?.name.substring(0, 16)} | Bestiary Builder`;
});

const getActivationType = (automation: AttackModel | AttackModel[] | null): number => {
	if (automation === null)
		return 0;
	const attack = Array.isArray(automation) ? automation[0] : automation;
	return attack?.activation_type ?? 0;
};

const groupByActivationType = (items: AutomationWithType[]): Record<number, AutomationWithType[]> => {
	return items.reduce((groups, item) => {
		const key = getActivationType(item.automation);
		if (!groups[key])
			groups[key] = [];
		groups[key].push(item);
		return groups;
	}, {} as Record<number, AutomationWithType[]>);
};

const groupedItems = computed(() => {
	const grouped = groupByActivationType(items.value || []);

	return Object.entries(grouped)
		.map(([type, items]) => ({
			type: Number(type),
			label: getActionTypeLabel(Number(type)),
			items,
		}))
		.sort((a, b) => a.type - b.type);
});

const openedGroups = ref<number[]>(Object.keys(ACTION_TYPE_MAP).map(x => parseInt(x)));
</script>

<template>
	<div>
		<Breadcrumbs v-if="collection" :routes="[
			{
				path: isOwner || isEditor ? '/armories/personal' : '/armories/public',
				text: isOwner || isEditor ? 'My Automations' : 'Automations',
				isCurrent: false
			},
			{
				path: '',
				text: collection?.name,
				isCurrent: true
			}
		]">

			<DropdownMenu>
				<template #activator="{ props }">
					<v-icon-btn v-tooltip="'Search automations'" text="Search automations" icon="mdi:tag" size="24"
						v-bind="props" />
				</template>
				<v-card min-width="400" class="pa-4" title="Search collection">
					<v-row>
						<v-col cols="12">
							<v-select v-model="sortMode"
								:items="['Custom', 'Alphabetically', 'CR Ascending', 'CR Descending', 'Creature Type']"
								label="Collection sort type" width="100%" />
						</v-col>
						<v-col cols="6">
							<v-text-field v-model="searchText" label="Name" />
						</v-col>
						<v-col cols="6">
							<v-select v-model="searchOptions.tags" :items="creatureTypes" label="Creature type" multiple
								chips closable-chips />
						</v-col>
					</v-row>
				</v-card>
			</DropdownMenu>

			<DropdownMenu>
				<template #activator="{ props }">
					<v-icon-btn text="Export collection" icon="mdi:export" size="24" v-bind="props" />
				</template>
				<v-card min-width="300" class="text-center pb-2 pa-4" title="Export collection">
					<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
						<v-btn class="w-100" color="success" size="large" @click="exportCollection(false)">
							Clipboard
						</v-btn>
						<v-btn class="w-100" color="success" size="large" @click="exportCollection(true)">
							File
						</v-btn>
					</v-card-actions>
				</v-card>
			</DropdownMenu>
		</Breadcrumbs>
		<div class="content">
			<div v-if="collection">
				<v-card class="pa-2" color="surface" elevation="0">
					<v-card-title class="pb-0">
						{{ collection.name }}
					</v-card-title>
					<v-card-text>
						<v-row density="compact">
							<v-col cols="4">
								<v-row>
									<v-col class="d-flex justify-start align-center">
										<UserBanner :id="collection.ownerId" class="mt-2 mb-4" />
									</v-col>
									<v-col class="d-flex justify-center align-center">
										<div>
											{{ items?.length }}
											<v-icon icon="material-symbols:automation" size="20" />
										</div>
									</v-col>
									<v-col class="d-flex justify-end align-center">
										<StatusIcon :icon="collection.status" />
									</v-col>
								</v-row>

								<v-col cols="12">
									<v-chip-group v-if="collection.tags.length">
										<v-chip v-for="tag in [...collection.tags].sort()" :key="tag" size="small"
											variant="tonal">
											{{ tag }}
										</v-chip>
									</v-chip-group>
								</v-col>

								<v-col cols="12">
									<Markdown class="description "
										:text="collection.description || 'No description set.'" tag="p" />
								</v-col>
							</v-col>
							<v-col cols="8">
								<v-img :src="collection.image" max-height="200" />
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>

				<v-divider class="my-4" />
				<v-skeleton-loader v-if="items === null" type="heading, text, text" />
				<v-list v-else v-model:opened="openedGroups">
					<v-list-group v-for="group in groupedItems" :key="group.type" :value="group.type">
						<template #activator="{ props }">
							<v-list-item v-bind="props" :title="group.label"
								:subtitle="`${group.items.length} action${group.items.length > 1 ? 's' : ''}`" />
						</template>

						<v-list-item v-for="item in group.items" :key="item.id">
							<template #default>
								<v-list-item-title>
									{{ item.name }}
								</v-list-item-title>
								<v-list-item-subtitle>
									{{ item.description }}
								</v-list-item-subtitle>
							</template>

							<template #append>
								<v-icon-btn icon="mdi:eye" variant="text"
									@click="$router.push(`/automation/view/${item.id}`)" />
								<ImportToCharacter :automation="item.automation" />
							</template>
						</v-list-item>
					</v-list-group>
				</v-list>
				<span v-if="items?.length === 0"> No automations in this collection.</span>
			</div>
		</div>
	</div>

</template>

<style lang="less" scoped>
@media screen and (width >=1200px) {
	.content {
		padding-left: 10vw;
		padding-right: 10vw;
	}
}
</style>
