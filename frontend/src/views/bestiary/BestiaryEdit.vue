<script setup lang="ts">
import type { CreatureMetaData, CreatureWithStats, Statblock } from "~/shared";
import { refDebounced, useLocalStorage } from "@vueuse/core";
import { onMounted, reactive, ref, watch, watchEffect } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useRules } from "vuetify/labs/rules";
import CopyCreature from "@/components/Bestiary/CopyCreature.vue";
import CreatureListItem from "@/components/Bestiary/CreatureListItem.vue";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import { useCollection } from "@/components/Bestiary/useCollection";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import CRInput from "@/components/FormInputs/CRInput.vue";
import Markdown from "@/components/Global/Markdown.vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import SectionHeader from "@/components/VisualEditor/Nodes/shared/SectionHeader.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { creatureTypes } from "@/utils/constants";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { defaultStatblock } from "~/shared";

const {
	collection,
	items,
	editors,
	isOwner,
	isEditor,
	bookmarked,
	notices,
	getCollection,
	updateCollection,
	toggleBookmark,
	addEditor,
	removeEditor,
	getItem,
	getAllItems,
	createItem,
	createManyItems,
	deleteItem
} = useCollection("bestiary");

const { addToast, updateToast, removeToast } = useToast();
const rules = useRules();

const srdCreatures = ref<string[]>([]);
onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	await getCollection();
	removeToast(toastId);
	if (collection.value?.name)
		document.title = `${collection.value?.name.substring(0, 16)} | Bestiary Builder`;

	await useFetch<string[]>(`/api/srd-creatures/${store.user?.SRDVersion === "SRD_2024" ? "2024" : "2014"}/list`).then(({ success, data, error }) => {
		if (success)
			srdCreatures.value = data;

		if (error)
			addToast(error, { color: "error" });
	});
});

const searchText = ref("");
const searchTextDebounced = refDebounced(searchText, 500, { maxWait: 1000 });

const searchOptions = ref({
	tags: [] as string[],
	minCr: 0,
	maxCr: 30,
	env: "",
	faction: ""
});

const sortMode = useLocalStorage("sortModeForBestiaries", "Alphabetically");

const sortedCreatures = ref<CreatureMetaData[]>([]);
watchEffect(() => {
	if (!items.value) {
		sortedCreatures.value = [];
		return;
	}

	if (sortMode.value === "Custom") {
		// Do nothing, order as recieved
		sortedCreatures.value = items.value;
		return;
	}
	if (sortMode.value === "Alphabetically") {
		sortedCreatures.value = items.value.sort((a, b) => {
			const nameA = a.name.toLowerCase();
			const nameB = b.name.toLowerCase();
			if (nameA < nameB)
				return -1;
			if (nameA > nameB)
				return 1;
			return 0;
		});
		return;
	}
	else if (sortMode.value === "Creature Type") {
		sortedCreatures.value = items.value.sort((a, b) => {
			const nameA = a.race.toLowerCase();
			const nameB = b.race.toLowerCase();
			if (nameA < nameB)
				return -1;
			if (nameA > nameB)
				return 1;
			return 0;
		});
		return;
	}
	else if (sortMode.value === "CR Descending") {
		sortedCreatures.value = items.value.sort((a, b) => {
			return b.cr - a.cr;
		});
		return;
	}
	else if (sortMode.value === "CR Ascending") {
		sortedCreatures.value = items.value.sort((a, b) => {
			return a.cr - b.cr;
		});
		return;
	}
	sortedCreatures.value = items.value;
});

function filterCreature(data: CreatureMetaData) {
	const filterChecks: boolean[] = [];
	if (searchTextDebounced.value !== "")
		filterChecks.push(data.name.toLowerCase().includes(searchTextDebounced.value.toLowerCase().trim()));

	if (searchOptions.value.env !== "")
		filterChecks.push(data.environment.toLowerCase().includes(searchOptions.value.env.toLowerCase().trim()));

	if (searchOptions.value.faction !== "")
		filterChecks.push(data.faction.toLowerCase().includes(searchOptions.value.faction.toLowerCase().trim()));

	if (searchOptions.value.tags.length > 0)
		filterChecks.push(searchOptions.value.tags.some(item => data.race.toLowerCase().includes(item.toLowerCase())));

	if (searchOptions.value.minCr !== 0 || searchOptions.value.maxCr !== 30)
		filterChecks.push(searchOptions.value.minCr <= data.cr && data.cr <= searchOptions.value.maxCr);

	return filterChecks.every(_ => _);
}

const saveOrder = async () => {
	if (items.value && collection.value) {
		const orderIds = sortedCreatures.value.map(creature => creature.id);
		await useFetch(`/api/bestiary/${collection.value.id}/creatures/order`, "POST", orderIds);
	}
};

async function exportHomebrewery() {
	const toastId = addToast("Exporting...", { loading: true });

	try {
		const { success, data: resultData, error } = await useFetch<{ metadata: string }>(
			`/api/homebrewery/export/bestiary/${collection.value?.id.toString()}`,
			"GET"
		);

		if (success) {
			await navigator.clipboard.writeText(resultData.metadata);
			updateToast(toastId, { text: "Exported this bestiary markdown to your clipboard", prependIcon: "mdi:check", timeout: 2000 });
			void getUmami()?.track("Export bestiary to homebrewery");
		}
		else {
			updateToast(toastId, { text: error, color: "error", timeout: 2000 });
		}
	}
	catch (err) {
		updateToast(toastId, { text: err as string, color: "error", timeout: 2000 });
	}
}

async function exportBestiary(asFile: boolean) {
	const creatures = await getAllFullCreatures();
	if (!creatures) {
		addToast("Failed to export bestiary: no creatures found.", { color: "error" });
		return;
	}

	if (asFile) {
		const file = new File(
			[
				JSON.stringify(
					creatures.map(obj => obj.stats),
					null,
					2
				)
			],
			`${collection.value?.name || ""} from Bestiary Builder.txt`,
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
				creatures.map(obj => obj.stats),
				null,
				2
			)
		);
		addToast("Exported this bestiary to your clipboard.");
		void getUmami()?.track("Export bestiary to clipboard");
	}
}

const importFields = reactive({
	critterDbId: "",
	bestiaryBuilderJson: null
});

async function importBestiaryFromCritterDB() {
	let link = importFields.critterDbId.trim();
	if (link.length === 0) {
		addToast("No CritterDB link given", { color: "error" });
	}

	const isPublic = link.includes("publishedbestiary");
	try {
		const url = new URL(link);
		if (url.hostname !== "critterdb.com" && !url.hostname.endsWith(".critterdb.com")) {
			addToast("Could not recognize link as a link to a CritterDB bestiary", { color: "error" });
			return;
		}
	}
	catch {
		addToast("Something went wrong...", { color: "error" });
		return;
	}

	const linkEls = link.split("/");
	link = linkEls[linkEls.length - 1];

	const toastId = addToast("Fetching bestiary data has started. This may take a while.");

	const { success, data, error } = await useFetch<{
		data: {
			creatures: Statblock[];
			name: string;
			description: string;
		};
		failedCreatures: string[];
	}>(`/api/critterdb/${link}/${isPublic}`);
	if (success) {
		if (data.failedCreatures.length > 0)
			addToast(`Failed to parse ${data.failedCreatures.length} creatures, due to invalid data recieved.`, { color: "error" });
		for (const creature of data.failedCreatures)
			notices.value[creature] = "Failed to parse, due to unrecognized data.";
	}
	else {
		updateToast(toastId, { text: error, color: "error", timeout: 2500 });
		return;
	}
	updateToast(toastId, { text: "Saving creatures has started. This may take a while." });
	const { success: cSuccess, data: creatureData, error: cError } = await useFetch<{ error?: string; ignoredCreatures: { creature: string; error: string }[] }>(`/api/bestiary/${collection.value?.id.toString()}/addcreatures`, "POST", data.data.creatures);
	if (!cSuccess) {
		notices.value = {};
		addToast(cError, { color: "error" });
	}
	else if (creatureData.error) {
		updateToast(toastId, { text: "The import was completed with errors.", color: "warn" });
		notices.value.Errors = creatureData.error;
		for (const error of creatureData.ignoredCreatures)
			notices.value[error.creature] = error.error;
	}
	await getCollection();
	addToast("Importing has finished!", { color: "success" });
	void getUmami()?.track("Import bestiary from CritterDB");
}

async function importCreaturesFromBestiaryBuilder() {
	let creaturesToImport;
	if (!importFields.bestiaryBuilderJson) {
		addToast("No JSON given", { color: "error" });
		return;
	}
	try {
		const reader = new FileReader();
		reader.onload = async () => {
			creaturesToImport = JSON.parse(reader.result as string || "");

			if (!Array.isArray(creaturesToImport))
				creaturesToImport = [creaturesToImport];

			addToast("Importing creatures has started. This may take a while.");
			const { success, data, error } = await useFetch<{ error?: string; ignoredCreatures: { creature: string; error: string }[] }>(`/api/bestiary/${collection.value?.id.toString()}/addcreatures`, "POST", creaturesToImport);

			if (!success) {
				notices.value = {};
				addToast(error, { color: "error" });
			}
			else if (data.error) {
				addToast("The import was completed with errors.", { color: "error" });
				notices.value.Errors = data.error;
				for (const error of data.ignoredCreatures)
					notices.value[error.creature] = error.error;
			}
			else {
				addToast("Importing has finished!", { color: "success" });
				void getUmami()?.track("Import bestiary from BestiaryBuilder");
			}

			await getCollection();
		};
		reader.readAsText(importFields.bestiaryBuilderJson);
	}
	catch {
		addToast("Something is wrong with the format of your JSON", { color: "error" });
	}
}

async function importSrdCreature(creature: string | null) {
	if (!creature)
		return;
	const { success, data, error } = await useFetch<Statblock>(`/api/srd-creatures/${store.user?.SRDVersion === "SRD_2024" ? "2024" : "2014"}/${encodeURIComponent(creature)}`);

	if (success) {
		await createItem(data);
		void getUmami()?.track("Import SRD creature");
		return data;
	}
	else {
		addToast(error, { color: "error" });
	}
}

type CopiedCreature = CreatureWithStats & { bestiaryName: string };
const copiedCreatures = useLocalStorage<CopiedCreature[]>("copiedCreatures", []);

const copyCurrentBestiary = async () => {
	if (!items.value || !collection.value)
		return;

	const creatures = await getAllFullCreatures();
	if (!creatures) {
		addToast("Failed to copy bestiary: no creatures found.", { color: "error" });
		return;
	}

	const toAdd: CopiedCreature[] = [];
	for (const creature of creatures)
		toAdd.push({ ...creature, bestiaryName: collection.value.name });

	copiedCreatures.value = copiedCreatures.value.concat(toAdd);
	addToast("Copied current Bestiary");
	void getUmami()?.track("Copy bestiary");
};

// misc
const fullCreatureCache = new Map<string, CreatureWithStats>();
const getFullCreature = async (creatureId: string) => {
	const cachedCreature = fullCreatureCache.get(creatureId);
	if (cachedCreature)
		return cachedCreature;

	const creatureRequest = getItem(creatureId);
	void creatureRequest.then((creature) => {
		if (!creature)
			fullCreatureCache.delete(creatureId);
		else
			fullCreatureCache.set(creatureId, creature);
	}, () => fullCreatureCache.delete(creatureId));
	return creatureRequest;
};

const getAllFullCreatures = async () => {
	if (!items.value)
		return undefined;

	let creatures = [];
	if (fullCreatureCache.size === items.value.length) {
		for (const creature of fullCreatureCache.values())
			creatures.push(creature);
	}
	else {
		creatures = await getAllItems() ?? [];
		for (const creature of creatures)
			fullCreatureCache.set(creature.id, creature);
	}

	return creatures;
};

const lastHoveredCreature = ref<CreatureWithStats | null>(null);
const lastClickedCreature = ref<CreatureWithStats | null>(null);
const hasPinnedBefore = ref(false);
const editorToAdd = ref("");
const showWarning = ref(false);
const isExpanded = ref(false);
const newCreatureIsOpen = ref(false);

watch(lastClickedCreature, (): void => {
	if (hasPinnedBefore.value)
		return;
	if (!hasPinnedBefore.value)
		hasPinnedBefore.value = true;

	addToast("Pinned creature to the view. Click unpin there to go back to hover behaviour.");
	void getUmami()?.track("Pinned creature");
});

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

const pinCreature = async (creature: CreatureMetaData) => {
	if (lastClickedCreature.value?.id === creature.id) {
		lastClickedCreature.value = null;
		return;
	}

	const fullCreature = await getFullCreature(creature.id);
	if (!fullCreature) {
		addToast("Failed to pin creature: creature not found.", { color: "error" });
		return;
	}

	lastClickedCreature.value = fullCreature;
};

const copyCreature = async (creature: CreatureMetaData) => {
	if (!collection.value)
		return;

	const fullCreature = await getFullCreature(creature.id);
	if (!fullCreature) {
		addToast("Failed to copy creature: creature not found.", { color: "error" });
		return;
	}

	copiedCreatures.value.push({ ...fullCreature, bestiaryName: collection.value.name });
	addToast("Copied Successfully!");
};

const hoverCreature = async (creature: CreatureMetaData) => {
	lastHoveredCreature.value = await getFullCreature(creature.id) ?? null;
};
</script>

<template>
	<div>
		<Breadcrumbs
			v-if="collection" :routes="[
				{
					path: isOwner || isEditor ? '/bestiaries/personal' : '/bestiaries/public',
					text: isOwner || isEditor ? 'My Bestiaries' : 'Bestiaries',
					isCurrent: false
				},
				{
					path: '',
					text: collection?.name,
					isCurrent: true
				}
			]"
		>
			<v-icon-btn
				v-tooltip="'Create creature'" text="Create creature" icon="mdi:plus" size="24" class="inverted"
				@click="newCreatureIsOpen = !newCreatureIsOpen"
			/>

			<CopyCreature
				:may-import="isOwner || isEditor" :current-creatures="items || []" can-copy-current-bestiary
				@import-creature="(creature) => createItem(creature, false)"
				@import-all-creatures="createManyItems(copiedCreatures.map(x => x.stats))"
				@copy-current-bestiary="copyCurrentBestiary"
			/>

			<v-dialog v-if="isOwner" max-width="950">
				<template #activator="{ props }">
					<v-icon-btn
						v-tooltip="'Settings'" text="Collection Settings" icon="mdi:cog" size="24"
						v-bind="props"
					/>
				</template>

				<template #default="{ isActive }">
					<v-card title="Bestiary Settings" class="pa-4">
						<v-row>
							<v-col cols="6">
								<v-text-field
									v-model="collection.name" label="Name"
									:maxlength="store.limits?.nameLength" :min-length="store.limits?.nameMin"
									:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]"
									class="mb-4"
								/>
							</v-col>
							<v-col cols="6">
								<v-text-field v-model="collection.image" label="Image" class="mb-4" />
							</v-col>

							<v-col cols="12">
								<v-textarea
									v-model="collection.description"
									:max-length="store.limits?.descriptionLength"
									:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]"
									label="Description" class="mb-4" hint="Supports Markdown" persistent-hint counter
								/>
							</v-col>

							<v-col cols="6">
								<v-select
									v-model="collection.status" label="Status"
									:items="[{ value: 'private', title: 'Private' }, { value: 'unlisted', title: 'Unlisted' }, { value: 'public', title: 'Public' }]"
								/>
							</v-col>
							<v-col cols="6">
								<v-select
									v-model="collection.tags" multiple :items="store.tags || []" label="Tags"
									chips closable-chips
								/>
							</v-col>

							<v-col cols="12" class="px-4">
								<div>
									<SectionHeader title="Editors" />
									<p>
										Editors can add, edit, and remove items. <br>
										Editors cannot edit the Collection itself. <br>
										Editors cannot add other editors. The owner can remove editors at any time.
									</p>
								</div>
							</v-col>
							<v-col v-for="editor in editors" :key="editor.id" cols="4">
								<p>
									<UserBanner :id="editor.id" />
									<v-icon-btn v-if="isOwner" icon="mdi:delete" @click="removeEditor(editor.id)" />
								</p>
							</v-col>
							<v-col cols="6">
								<v-text-field
									v-model="editorToAdd" inputmode="numeric" label="Discord user ID"
									:rules="[rules.integer('This must be a numeric Discord User ID.')]"
									pattern="[0-9]*"
								/>
							</v-col>
							<v-col cols="6">
								<v-btn class="w-100" size="large" @click="addEditor(editorToAdd)">
									Add
								</v-btn>
							</v-col>

							<p v-if="showWarning" style="color: rgb(var(--v-theme-error))">
								By changing the Collection status to public I confirm that I am the copyright holder
								of the content
								within, or that I have permission from the copyright holder to share this content. I
								hereby agree to
								the <RouterLink to="../content-policy">
									Content Policy
								</RouterLink> and agree to
								be fully liable for the content within. I affirm that the content does not include
								any official
								non-free D&D content. Collections that breach these terms may have their status
								changed to private or
								be outright removed, and may result in a ban if the content breaches our content
								policy.
							</p>
						</v-row>
						<v-card-actions>
							<v-spacer />
							<v-btn text="Save changes" color="success" size="large" @click="updateCollection" />
							<v-btn text="Cancel" size="large" @click="isActive.value = false" />
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>
			<DropdownMenu>
				<template #activator="{ props }">
					<v-icon-btn
						v-tooltip="'Search creatures'" text="Search creatures" icon="mdi:tag" size="24"
						v-bind="props"
					/>
				</template>
				<v-card max-width="400" class="pa-4" title="Search bestiary">
					<v-row>
						<v-col cols="12">
							<v-select
								v-model="sortMode"
								:items="['Custom', 'Alphabetically', 'CR Ascending', 'CR Descending', 'Creature Type']"
								label="Bestiary sort type" hide-details
							/>
						</v-col>
						<v-col cols="6">
							<v-text-field v-model="searchText" label="Name" />
						</v-col>
						<v-col cols="6">
							<v-select
								v-model="searchOptions.tags" :items="creatureTypes" label="Creature type" multiple
								chips closable-chips
							/>
						</v-col>
						<v-col cols="6">
							<CRInput v-model="searchOptions.minCr" label="Minimum CR" />
						</v-col>
						<v-col cols="6">
							<CRInput v-model="searchOptions.maxCr" label="Maximum CR" />
						</v-col>
						<v-col cols="6">
							<v-text-field v-model="searchOptions.faction" label="Faction" />
						</v-col>
						<v-col cols="6">
							<v-text-field v-model="searchOptions.env" label="Environment" />
						</v-col>
					</v-row>
				</v-card>
			</DropdownMenu>

			<v-dialog v-if="isOwner" max-width="750">
				<template #activator="{ props }">
					<v-icon-btn
						v-tooltip="'Import creatures'" text="Import creatures" icon="mdi:import" size="24"
						v-bind="props"
					/>
				</template>

				<template #default="{ isActive }">
					<v-card title="Import bestiary" max-width="800" class="pa-4">
						<v-row>
							<v-col cols="6">
								<v-text-field
									v-model="importFields.critterDbId" label="CritterDB Bestiary link"
									hint="Make sure the Bestiary is public or has link-sharing enabled"
									persistent-hint
								/>
								<v-btn size="large" class="w-100 mt-4" @click="importBestiaryFromCritterDB()">
									Import CritterDB
								</v-btn>
							</v-col>
							<v-col>
								<v-file-input
									v-model="importFields.bestiaryBuilderJson" label="Bestiary Builder JSON"
									hint="JSON (.json/.txt) describing a bestiary gotten from clicking export elsewhere on BB"
									persistent-hint accept=".txt,.json"
								/>

								<v-btn size="large" class="w-100 mt-4" @click="importCreaturesFromBestiaryBuilder()">
									Import BB
								</v-btn>
							</v-col>
						</v-row>
						<v-card-actions class="mt-4">
							<v-btn text="Cancel" size="large" @click="isActive.value = false" />
						</v-card-actions>
						<v-sheet v-if="JSON.stringify(notices) !== '{}'">
							<p class="warning">
								<b>Please note the following for this import:</b>
							</p>
							<div v-for="(notice, creature) in notices" :key="creature">
								<h3>
									{{ creature }}
								</h3>
								<p>
									{{ notice }}
								</p>
							</div>
						</v-sheet>
					</v-card>
				</template>
			</v-dialog>

			<DropdownMenu>
				<template #activator="{ props }">
					<v-icon-btn text="Export Bestiary" icon="mdi:export" size="24" v-bind="props" />
				</template>
				<v-card min-width="300" class="text-center pb-2 pa-4" title="Export bestiary">
					<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
						<v-btn class="w-100" color="success" size="large" @click="exportBestiary(false)">
							Clipboard
						</v-btn>
						<v-btn class="w-100" color="success" size="large" @click="exportBestiary(true)">
							File
						</v-btn>
						<v-btn class="w-100" color="success" size="large" @click="exportHomebrewery()">
							Homebrewery
						</v-btn>
					</v-card-actions>
				</v-card>
			</DropdownMenu>
		</Breadcrumbs>
		<div class="content">
			<div v-if="collection" class="bestiary">
				<div class="left-side-container">
					<div class="content-tile header-tile">
						<h2>{{ collection.name ? collection.name : "..." }}</h2>
						<Markdown
							class="description" :class="{ expanded: isExpanded }"
							:text="collection.description || 'No description set.'" tag="p"
						/>
						<button
							v-if="collection.description.length > 0" v-tooltip="'Expand description'"
							class="expand-btn" aria-label="Expand description" @click="isExpanded = !isExpanded"
						>
							{{ isExpanded ? "▲" : "▼" }}
						</button>
						<hr>
						<div class="footer" :class="{ 'three-wide': isOwner }">
							<UserBanner :id="collection.ownerId" />
							<div v-tooltip.left="collection.status">
								<StatusIcon :icon="collection.status" />
							</div>
							<div>{{ items?.length }}<v-icon icon="mdi:paw" size="20" /></div>
							<div
								v-if="!isOwner" role="button" aria-label="Toggle bookmark status" class="bookmark"
								@click.prevent="toggleBookmark"
							>
								<span
									v-if="bookmarked" v-tooltip="'Unbookmark this bestiary'"
									class="bookmark-enabled"
								><v-icon size="20" icon="mdi-star" /></span>
								<span v-else v-tooltip="'Bookmark this bestiary'" class="bookmark-disabled"><v-icon
									size="20" icon="mdi-star"
								/></span>
							</div>
						</div>
					</div>
					<v-skeleton-loader v-if="items === null" type="heading, text, text" />
					<VueDraggable
						v-else v-model="sortedCreatures" :animation="500" class="tile-container list-tiles"
						:disabled="sortMode !== 'Custom'" @update="saveOrder"
					>
						<template v-for="element in sortedCreatures">
							<CreatureListItem
								v-if="filterCreature(element)" :id="element.id" :key="element.id" :data="element"
								:can-edit="isOwner || isEditor" :is-pinned="lastClickedCreature?.id === element.id"
								@mouseover="hoverCreature(element)"
								@delete-creature="(id) => deleteItem(id)" @pin-creature="pinCreature(element)"
								@copy-creature="copyCreature(element)"
							/>
						</template>
					</VueDraggable>

					<div v-if="isOwner || isEditor" class="create-tile">
						<v-btn variant="plain" :ripple="false" @click="newCreatureIsOpen = !newCreatureIsOpen">
							Add creature
						</v-btn>
					</div>
				</div>
				<div v-if="items && lastHoveredCreature" class="statblock-container">
					<span v-if="lastClickedCreature" class="pin-notice">
						<v-btn
							class="unpin-button" variant="text" density="compact" append-icon="mdi:pin-off"
							@click="lastClickedCreature = null"
						><b>unpin</b></v-btn>
					</span>
					<Transition name="fade" mode="out-in">
						<StatblockRenderer
							:key="lastClickedCreature?.stats.description.name || lastHoveredCreature.stats.description.name"
							:data="lastClickedCreature?.stats || lastHoveredCreature.stats"
						/>
					</Transition>
				</div>
				<div v-else class="statblock-container">
					<div class="no-creature-text">
						<p>Hover or click on a creature to see its statblock</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<v-dialog v-model="newCreatureIsOpen" max-width="500">
		<v-card min-width="400" class="text-center pa-4" title="Create creature">
			<v-card-actions>
				<v-row>
					<v-col cols="12">
						<v-btn size="x-large" class="w-100" @click="createItem(defaultStatblock)">
							From scratch
						</v-btn>
					</v-col>
					<v-col cols="12">
						<div class="d-flex align-center my-4 w-100">
							<v-divider class="flex-grow-1" />
							<span class="mx-4 text-medium-emphasis">OR</span>
							<v-divider class="flex-grow-1" />
						</div>
					</v-col>
					<v-col cols="12">
						<v-autocomplete
							:items="srdCreatures" label="Select SRD creature"
							@update:model-value="item => importSrdCreature(item)"
						>
							<template #item="{ props, item }">
								<v-list-item v-bind="props" density="compact" style="min-height: 28px">
									{{ (item as any).title }}
								</v-list-item>
							</template>
						</v-autocomplete>
					</v-col>
				</v-row>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<v-fab icon="mdi:plus" location="bottom end" app color="primary" size="large" @click="newCreatureIsOpen = true" />
</template>

<style lang="less">
.flow-vertically {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
	margin: 0.5rem 0;

	label {
		font-weight: bold;
		text-decoration: underline;
	}
}

.flow-horizontally {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}

.two-wide {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}

.list-tiles {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	position: relative;
	overflow: scroll;
	max-height: 80vh;
	overflow-x: clip;
	padding: 0;
	margin-top: 1rem;

	.content-tile {
		height: fit-content !important;
		background: var(--color-surface-1);
		color: white;
		padding: 1rem;
		box-shadow:
			rgb(0 0 0 / 19%) 0 10px 20px,
			rgb(0 0 0 / 23%) 0 6px 6px;
		cursor: pointer;
		transition: all 1s;
		transition-timing-function: cubic-bezier(0.06, 0.975, 0.195, 0.985);
		border-radius: 3px;

		h3 {
			font-size: 1.5rem;
		}

		&.creature-tile {
			display: flex;
			flex-flow: row nowrap;
			justify-content: space-between;

			.left-side {
				span,
				p {
					font-style: italic;
					font-size: 0.85rem;
				}

				.cr {
					color: rgb(var(--v-theme-primary));
					width: 3rem;
					display: inline-block;
				}
			}

			.right-side {
				display: flex;
				flex-direction: row;
				gap: 0.5rem;

				a {
					text-decoration: none;
				}

				span,
				button {
					background: none;
					border: none;
					color: rgb(var(--v-theme-primary));
					font-size: 1.2rem;
					display: flex;
					align-items: center;
					height: 100%;
					cursor: pointer;

					svg {
						color: rgb(var(--v-theme-primary));
					}
				}
			}

			&:hover {
				background-color: #484544;
			}
		}
	}
}

.create-tile {
	padding-top: 1rem;
	text-align: center;
	text-decoration: underline;

	span {
		cursor: pointer;
	}
}

@media screen and (width <=842px) {
	.list-tiles {
		max-height: 40vh;

		.content-tile {
			padding: 0.5rem;

			h3 {
				font-size: 1rem;
			}

			&.creature-tile {
				.left-side span {
					font-size: 0.6rem;
				}

				.right-side {
					width: 30%;
					gap: 0.3rem;
					justify-content: space-evenly;

					span {
						font-size: 0.9rem;

						&.cr {
							width: 4rem;
							justify-content: right;
						}
					}
				}
			}
		}
	}
}

.header-tile {
	background-color: rgb(var(--v-theme-surface));
	cursor: unset;
	margin: 0 0 1rem;
	padding: 1rem;
	border-radius: 2px;

	h2 {
		text-align: center;
		text-wrap: nowrap;
		overflow: hidden;
		max-width: 90vw;
		color: rgb(var(--v-theme-primary));
		font-weight: bold;
	}

	.description {
		max-height: 8rem;
		font-size: small;
		overflow-y: hidden;
		overflow-wrap: anywhere;

		&.expanded {
			max-height: unset;
		}
	}

	.description:not(.expanded) {
		mask-image: linear-gradient(180deg, #000 80%, transparent);
	}

	.footer {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		font-size: 1rem;
		margin-top: 0.5rem;

		&.three-wide {
			grid-template-columns: 1fr 1fr 1fr;
		}

		div {
			text-align: center;
		}

		div:first-of-type {
			text-align: left;
		}

		div:last-of-type {
			text-align: right;
		}
	}
}

@media screen and (width <=842px) {
	.header-tile {
		padding: 0.5rem;

		.description {
			font-size: xx-small;
		}

		.footer {
			font-size: 0.7rem;
			grid-template-columns: 2fr 1fr 1fr 1fr;

			&.three-wide {
				grid-template-columns: 2fr 1fr 1fr;
			}
		}
	}
}

.bestiary {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;
}

@media screen and (width <=1080px) {
	.list-tiles {
		padding: 0;

		.content-tile.creature-tile:hover {
			background-color: #464343;
			scale: 1;
		}
	}

	.bestiary {
		grid-template-columns: 1fr;
	}
}

.pin-notice,
.expand-btn {
	float: right;
	cursor: pointer;
}

.unpin-button {
	text-decoration: underline;
	cursor: pointer;
}

.expand-btn {
	border: none;
	background: none;
	color: rgb(var(--v-theme-primary));
	font-size: 1.6rem;
	translate: 0 -20px;
	transition: background-color 0.3s ease-in-out;

	&:hover {
		background-color: var(--color-surface-0);
	}
}

.no-creature-text {
	font-size: 1.3rem;
	text-align: center;
	margin-top: 1rem;
}

.bookmark {
	cursor: pointer;
	font-size: 1.2rem;
	color: goldenrod;

	.bookmark-disabled {
		filter: rgb(var(--v-theme-surface-bright)) scale(100%);
		transition: filter 0.3s ease;

		&:hover {
			filter: rgb(var(--v-theme-surface-bright)) scale(0%);
		}
	}

	.bookmark-enabled {
		filter: rgb(var(--v-theme-surface-bright)) scale(0%);
		transition: filter 0.3s ease;

		&:hover {
			filter: rgb(var(--v-theme-surface-bright)) scale(100%);
		}
	}
}

.slide-fade-enter-active {
	transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
	transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.fade-enter-from,
.fade-leave-to {
	transform: translateY(-10px);
	opacity: 0;
}

.fade-enter-active {
	transition: all 0.2s ease-out;
}

.fade-leave-active {
	transition: all 0.2s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
	opacity: 0;
}

.editor-block {
	margin-top: 1rem;

	.editor-list p {
		display: flex;
		gap: 1rem;
		margin: 1rem 0;
	}
}

.warning {
	color: rgb(var(--v-theme-error));
	margin-top: 0.5rem;
}

.editor-container {
	display: grid;
	grid-template-columns: 1fr 1fr;
}

.v-select.drop-up.vs--open {
	border-radius: 0 0 4px 4px;
	border-top-color: transparent;
	border-bottom: 1px solid var(--vs-border-color);
}
</style>
