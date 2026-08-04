<script setup lang="ts">
import type { Bestiary, BestiaryExtended, CreatureWithStats, Statblock, User } from "~/shared";
import { refDebounced, useLocalStorage } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Draggable from "vuedraggable";
import { useRules } from "vuetify/labs/rules";
import CopyCreature from "@/components/Bestiary/CopyCreature.vue";
import CreatureListItem from "@/components/Bestiary/CreatureListItem.vue";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import CRInput from "@/components/FormInputs/CRInput.vue";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import Markdown from "@/components/Global/Markdown.vue";
import Modal from "@/components/Global/Modal.vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import { getUmami } from "@/utils/app/analytics";
import { $loading } from "@/utils/app/loading";
import { $toast } from "@/utils/app/toast";
import { creatureTypes } from "@/utils/constants";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { defaultStatblock } from "~/shared";

const rules = useRules();
const $route = useRoute();
const $router = useRouter();
const searchText = ref("");
const debouncedSearch = refDebounced(searchText, 500);

const searchEnv = ref("");
const debouncedEnv = refDebounced(searchEnv, 500);
const searchFaction = ref("");
const debouncedFaction = refDebounced(searchFaction, 500);

const bestiary = ref<BestiaryExtended | null>(null);
const savedBestiary = ref<BestiaryExtended | null>(null);
const creatures = ref<CreatureWithStats[] | null>(null);
const editors = ref<User[]>([]);
const lastHoveredCreature = ref<Statblock | null>(null);
const lastClickedCreature = ref<Statblock | null>(null);
const hasPinnedBefore = ref(false);
const bookmarked = ref(false);
const isOwner = ref(false);
const isEditor = ref(false);
const editorToAdd = ref("");
const showWarning = ref(false);
const critterDbId = ref("");
const bestiaryBuilderJson = ref("");
const notices = ref<Record<string, string>>({});
const searchOptions = ref({
	text: "",
	tags: [] as string[],
	minCr: 0,
	maxCr: 30,
	env: "",
	faction: ""
});

const sortMode = useLocalStorage("sortModeForBestiaries", "Alphabetically");
const isExpanded = ref(false);
const showImportModal = ref(false);
const srdCreatures = ref<string[]>([]);

const sortCreatures = () => {
	if (!creatures.value)
		return;
	if (sortMode.value === "Custom") {
		// Do nothing, order as recieved
		return creatures.value;
	}
	if (sortMode.value === "Alphabetically") {
		creatures.value.sort((a, b) => {
			const nameA = a.stats.description.name.toLowerCase();
			const nameB = b.stats.description.name.toLowerCase();
			if (nameA < nameB)
				return -1;
			if (nameA > nameB)
				return 1;
			return 0;
		});
	}
	else if (sortMode.value === "Creature Type") {
		creatures.value.sort((a, b) => {
			const nameA = a.stats.core.race.toLowerCase();
			const nameB = b.stats.core.race.toLowerCase();
			if (nameA < nameB)
				return -1;
			if (nameA > nameB)
				return 1;
			return 0;
		});
	}
	else if (sortMode.value === "CR Descending") {
		creatures.value.sort((a, b) => {
			return b.stats.description.cr - a.stats.description.cr;
		});
	}
	else if (sortMode.value === "CR Ascending") {
		creatures.value.sort((a, b) => {
			return a.stats.description.cr - b.stats.description.cr;
		});
	}

	return creatures.value;
};

const saveOrder = async () => {
	if (creatures.value && bestiary.value) {
		const orderIds = creatures.value.map(creature => creature.id);
		await useFetch(`/api/bestiary/${bestiary.value.id}/creatures/order`, "POST", orderIds);
	}
};

watch(lastClickedCreature, (): void => {
	if (hasPinnedBefore.value)
		return;
	if (!hasPinnedBefore.value)
		hasPinnedBefore.value = true;

	$toast.info("Pinned creature to the view. Click unpin there to go back to hover behaviour.");
	void getUmami()?.track("Pinned creature");
});

watch(() => bestiary.value?.status, (newValue): void => {
	if (newValue === "private")
		showWarning.value = false;
	if (newValue === "public")
		showWarning.value = true;
});

watch(() => bestiary.value?.name, (): void => {
	if (bestiary.value?.name)
		document.title = `${bestiary.value?.name.substring(0, 16)} | Bestiary Builder`;
});

watch(debouncedSearch, () => {
	searchOptions.value.text = searchText.value;
});
watch(debouncedEnv, () => {
	searchOptions.value.env = searchEnv.value;
});
watch(debouncedFaction, () => {
	searchOptions.value.faction = searchFaction.value;
});
const initialLoading = ref(true);
onMounted(async () => {
	await getBestiary().then(() => {
	});
	if (bestiary.value?.name)
		document.title = `${bestiary.value?.name.substring(0, 16)} | Bestiary Builder`;

	await useFetch<string[]>(`/api/srd-creatures/${store.user?.SRDVersion === "SRD_2024" ? "2024" : "2014"}/list`).then(({ success, data, error }) => {
		if (success)
			srdCreatures.value = data;

		if (error)
			$toast.error(error);
	});
});

function filterCreature(data: CreatureWithStats) {
	const filterChecks: boolean[] = [];
	if (searchOptions.value.text !== "")
		filterChecks.push(data.stats.description.name.toLowerCase().includes(searchOptions.value.text.toLowerCase().trim()));

	if (searchOptions.value.env !== "")
		filterChecks.push(data.stats.description.environment.toLowerCase().includes(searchOptions.value.env.toLowerCase().trim()));

	if (searchOptions.value.faction !== "")
		filterChecks.push(data.stats.description.faction.toLowerCase().includes(searchOptions.value.faction.toLowerCase().trim()));

	if (searchOptions.value.tags.length > 0)
		filterChecks.push(searchOptions.value.tags.some(item => data.stats.core.race.toLowerCase().includes(item.toLowerCase())));

	if (searchOptions.value.minCr !== 0 || searchOptions.value.maxCr !== 30)
		filterChecks.push(searchOptions.value.minCr <= data.stats.description.cr && data.stats.description.cr <= searchOptions.value.maxCr);

	return filterChecks.every(_ => _);
}

async function exportHomebrewery() {
	const loader = $loading.show();

	try {
		const { success, data: resultData, error } = await useFetch<{ metadata: string }>(
			`/api/homebrewery/export/bestiary/${bestiary.value?.id.toString()}`,
			"GET"
		);

		if (success) {
			await navigator.clipboard.writeText(resultData.metadata);
			$toast.info("Exported this bestiary markdown to your clipboard");
			void getUmami()?.track("Export bestiary to homebrewery");
		}
		else {
			$toast.error(error);
		}
	}
	catch (err) {
		$toast.error(err as string);
	}
	finally {
		loader.hide();
	}
}

async function exportBestiary(asFile: boolean) {
	if (asFile) {
		const file = new File(
			[
				JSON.stringify(
					creatures.value?.map(obj => obj.stats),
					null,
					2
				)
			],
			"Creatures.txt",
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
				creatures.value?.map(obj => obj.stats),
				null,
				2
			)
		);
		$toast.info("Exported this bestiary to your clipboard.");
		void getUmami()?.track("Export bestiary to clipboard");
	}
}

async function importBestiaryFromCritterDB() {
	let link = critterDbId.value.trim();
	if (link.length === 0) {
		$toast.error("No critterDB link given.");
	}
	const isPublic = link.includes("publishedbestiary");
	try {
		const url = new URL(link);
		if (url.hostname !== "critterdb.com" && !url.hostname.endsWith(".critterdb.com")) {
			$toast.error("Could not recognize link as a link to a CritterDB bestiary");
			return;
		}
	}
	catch (e) {
		$toast.error("Something went wrong...");
		return;
	}

	const linkEls = link.split("/");
	link = linkEls[linkEls.length - 1];

	$toast.info("Fetching bestiary data has started. This may take a while.");
	const loader = $loading.show();
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
			$toast.error(`Failed to parse ${data.failedCreatures.length} creatures, due to invalid data recieved.`);
		for (const creature of data.failedCreatures)
			notices.value[creature] = "Failed to parse, due to unrecognized data.";
	}
	else {
		$toast.error(error);
		loader.hide();
		return;
	}
	$toast.info("Saving creatures has started. This may take a while.");
	const { success: cSuccess, data: creatureData, error: cError } = await useFetch<{ error?: string; ignoredCreatures: { creature: string; error: string }[] }>(`/api/bestiary/${bestiary.value?.id.toString()}/addcreatures`, "POST", data.data.creatures);
	if (!cSuccess) {
		notices.value = {};
		$toast.error(cError);
	}
	else if (creatureData.error) {
		$toast.error("The import was completed with errors.");
		notices.value.Errors = creatureData.error;
		for (const error of creatureData.ignoredCreatures)
			notices.value[error.creature] = error.error;
	}
	await getBestiary();
	loader.hide();
	$toast.success("Importing has finished!");
	void getUmami()?.track("Import bestiary from CritterDB");
	if (cSuccess && !creatureData.error)
		showImportModal.value = false;
}

async function importCreaturesFromBestiaryBuilder() {
	let creaturesToImport;
	const loader = $loading.show();
	if (bestiaryBuilderJson.value.length === 0) {
		$toast.error("No JSON given.");
		loader.hide();
		return;
	}
	try {
		creaturesToImport = JSON.parse(bestiaryBuilderJson.value);
	}
	catch (e) {
		$toast.error("Something is wrong with the format of your JSON");
		loader.hide();
		return;
	}

	if (!Array.isArray(creaturesToImport))
		creaturesToImport = [creaturesToImport];

	$toast.info("Importing creatures has started. This may take a while.");
	const { success, data, error } = await useFetch<{ error?: string; ignoredCreatures: { creature: string; error: string }[] }>(`/api/bestiary/${bestiary.value?.id.toString()}/addcreatures`, "POST", creaturesToImport);

	if (!success) {
		notices.value = {};
		$toast.error(error);
	}
	else if (data.error) {
		$toast.error("The import was completed with errors.");
		notices.value.Errors = data.error;
		for (const error of data.ignoredCreatures)
			notices.value[error.creature] = error.error;
	}
	else {
		$toast.success("Importing has finished!");
		void getUmami()?.track("Import bestiary from BestiaryBuilder");
	}

	await getBestiary();
	loader.hide();
	if (success && !data.error)
		showImportModal.value = false;
}

async function createCreature(stats = defaultStatblock, shouldHaveLoader = true, openPage = true) {
	let loader;
	if (shouldHaveLoader)
		loader = $loading.show();

	// Replace for actual creation data:
	const data = {
		stats,
		bestiaryId: bestiary.value?.id
	} as CreatureWithStats;
	// Send data to server
	const { success, data: resultData, error } = await useFetch<CreatureWithStats>("/api/creature/add", "POST", data);
	if (success) {
		const data = resultData;
		void getUmami()?.track("Create creature");
		if (openPage)
			await $router.push(`/creature/edit/${data.id.toString()}`);
		else
			await getBestiary();
	}
	else {
		$toast.error(error);
	}

	if (shouldHaveLoader && loader)
		loader.hide();
}

async function createManyCreatures() {
	const creatures = [];
	for (const creature of copiedCreatures.value)
		creatures.push(creature.stats);

	const loader = $loading.show();

	$toast.info("Importing creatures has started. This may take a while.");
	const { success, data, error } = await useFetch<{ error?: string; ignoredCreatures: { creature: string; error: string }[] }>(`/api/bestiary/${bestiary.value?.id.toString()}/addcreatures`, "POST", creatures);

	if (!success) {
		notices.value = {};
		$toast.error(error);
	}
	else if (data.error) {
		$toast.error("The import was completed with errors.");
		notices.value.Errors = data.error;
		for (const error of data.ignoredCreatures)
			notices.value[error.creature] = error.error;
	}
	else {
		$toast.success("Importing has finished!");
		void getUmami()?.track("Imported creatures from BestiaryBuilder", { count: creatures.length });
	}

	await getBestiary();
	loader.hide();
}

async function deleteCreature(id: string) {
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/creature/${id.toString()}/delete`);
	if (success) {
		$toast.success("Deleted creature succesfully");
		void getUmami()?.track("Delete creature");
		if (!bestiary.value)
			return;
		bestiary.value.creatures = bestiary.value.creatures.filter(c => c.id !== id);
		creatures.value = creatures.value?.filter(c => c.id !== id) ?? [];
	}
	else {
		$toast.error(error);
	}
	loader.hide();
}

async function importSrdCreature(creature: string | null) {
	if (!creature)
		return;
	const { success, data, error } = await useFetch<Statblock>(`/api/srd-creatures/${store.user?.SRDVersion === "SRD_2024" ? "2024" : "2014"}/${encodeURIComponent(creature)}`);

	if (success) {
		await createCreature(data);
		void getUmami()?.track("Import SRD creature");
		return data;
	}
	else {
		$toast.error(error || "");
	}
}

async function addEditor() {
	if (!bestiary.value)
		return;
	const id = editorToAdd.value;
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/bestiary/${bestiary.value.id.toString()}/editors/add/${id}`);
	if (success) {
		$toast.success("Added editor succesfully");
		void getUmami()?.track("Add bestiary editor");
	}
	else {
		$toast.error(error);
	}

	await getBestiary();
	loader.hide();
}

async function removeEditor(id: string) {
	if (!bestiary.value)
		return;
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/bestiary/${bestiary.value.id.toString()}/editors/remove/${id}`);
	if (success) {
		$toast.success("Removed editor succesfully");
		void getUmami()?.track("Remove bestiary editor");
	}
	else {
		$toast.error(error);
	}

	await getBestiary();
	loader.hide();
}

async function getBestiary() {
	// Get id
	const id = $route.params.id;
	// Request bestiary info
	const { success, data, error } = await useFetch<BestiaryExtended>(`/api/bestiary/${id.toString()}`);
	if (!success) {
		bestiary.value = null;
		$toast.error(error);
		return;
	}
	bestiary.value = data;
	savedBestiary.value = bestiary.value;
	isOwner.value = store.user?.id === bestiary.value.ownerId;
	isEditor.value = (bestiary.value?.editors ?? []).map(e => e.userId).includes(store.user?.id ?? "");

	if (!isOwner.value && !isEditor.value)
		await $router.push(`/bestiary/view/${bestiary.value.id}`);

	initialLoading.value = false;
	// Fetch creatures
	await useFetch<CreatureWithStats[]>(`/api/bestiary/${bestiary.value.id.toString()}/creatures`).then(async (creatureResult) => {
		if (creatureResult.success) {
			creatures.value = creatureResult.data;
		}
		else {
			creatures.value = null;
			$toast.error(creatureResult.error);
		}
	});
	// Fetch editors
	editors.value = [] as User[];
	for (const { userId: editorId } of bestiary.value?.editors ?? []) {
		await useFetch(`/api/user/${editorId}`).then((editorResult) => {
			if (editorResult.success)
				editors.value.push(editorResult.data as User);
			else
				$toast.error(editorResult.error);
		});
	}
	// Bookmark state
	if (store.user) {
		await useFetch<{ state: boolean }>(`/api/bestiary/${bestiary.value.id.toString()}/bookmark/get`).then(async (bookmarkResult) => {
			if (bookmarkResult.success) {
				bookmarked.value = (bookmarkResult.data).state;
			}
			else {
				bookmarked.value = false;
				$toast.error(bookmarkResult.error);
			}
		});
	}
	else {
		bookmarked.value = false;
	}
}

async function updateBestiary() {
	if (!bestiary.value)
		return;
	const loader = $loading.show();
	// Send to backend
	const { success, error } = await useFetch<Bestiary>(`/api/bestiary/${bestiary.value.id.toString()}/update`, "POST", bestiary.value);
	if (success) {
		$toast.success("Saved bestiary");
		savedBestiary.value = bestiary.value;
	}
	else {
		$toast.error(error);
		if (error.includes("includes blocked words or phrases"))
			void getUmami()?.track("Blocked words", { error });
	}
	loader.hide();
}

async function toggleBookmark() {
	if (!bestiary.value)
		return;
	const loader = $loading.show();
	const { success, data, error } = await useFetch<{ state: boolean }>(`/api/bestiary/${bestiary.value.id.toString()}/bookmark/toggle`);
	if (success) {
		bookmarked.value = data.state;
		if (bookmarked.value) {
			$toast.success("Successfully bookmarked this bestiary!");
			void getUmami()?.track("Bookmark bestiary");
		}
		else {
			$toast.success("Successfully unbookmarked this bestiary!");
			void getUmami()?.track("Unbookmark bestiary");
		}
	}
	else {
		bookmarked.value = false;
		$toast.error(error);
	}
	loader.hide();
}

type CopiedCreature = CreatureWithStats & { bestiaryName: string };
const copiedCreatures = useLocalStorage<CopiedCreature[]>("copiedCreatures", []);

const copyCurrentBestiary = () => {
	if (!creatures.value || !bestiary.value)
		return;
	const toAdd: CopiedCreature[] = [];
	for (const creature of creatures.value)
		toAdd.push({ ...creature, bestiaryName: bestiary.value.name });

	copiedCreatures.value = copiedCreatures.value.concat(toAdd);
	$toast.success("Successfully copied current Bestiary");
	void getUmami()?.track("Copy bestiary");
};

// draggable stuff
const getDraggableKey = (item: any) => {
	return item;
};
</script>

<template>
	<div>
		<Breadcrumbs v-if="bestiary" :routes="[
			{
				path: isOwner || isEditor ? '/bestiaries/personal' : '/bestiaries/public',
				text: isOwner || isEditor ? 'My Bestiaries' : 'Bestiaries',
				isCurrent: false
			},
			{
				path: '',
				text: bestiary?.name,
				isCurrent: true
			}
		]">
			<DropdownMenu v-if="isEditor || isOwner">
				<template #activator="{ props }">
					<v-icon-btn text="Create creature" icon="mdi:plus" size="24" v-bind="props" class="inverted" />
				</template>
				<v-card min-width="300" class="text-center pa-4" title="Create creature">
					<v-card-actions class="d-flex flex-column align-center justify-center">
						<v-btn size="x-large" @click="createCreature()">
							From scratch
						</v-btn>
						<div class="d-flex align-center my-4 w-100">
							<v-divider class="flex-grow-1" />
							<span class="mx-4 text-medium-emphasis">OR</span>
							<v-divider class="flex-grow-1" />
						</div>

						<v-autocomplete :items="srdCreatures" label="Select SRD creature" width="400"
							@update:model-value="item => importSrdCreature(item)">
							<template #item="{ props, item }">
								<v-list-item v-bind="props" density="compact" style="min-height: 28px">
									{{ (item as any).title }}
								</v-list-item>
							</template>
						</v-autocomplete>
					</v-card-actions>
				</v-card>
			</DropdownMenu>

			<CopyCreature :may-import="isOwner || isEditor" :current-creatures="creatures || []"
				can-copy-current-bestiary @import-creature="(creature) => createCreature(creature, true, false)"
				@import-all-creatures="createManyCreatures" @copy-current-bestiary="copyCurrentBestiary" />

			<v-dialog v-if="isOwner" max-width="950">
				<template #activator="{ props }">
					<v-icon-btn text="Edit bestiary" icon="mdi:cog" size="24" v-bind="props" />
				</template>

				<template #default="{ isActive }">
					<v-card title="Edit bestiary">
						<v-sheet class="pa-4" max-width="1800" rounded="lg" width="100%">
							<v-form>
								<div class="grid-two">
									<v-text-field v-model="bestiary.name" label="Name"
										:maxlength="store.limits?.nameLength" :min-length="store.limits?.nameMin"
										:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]"
										class="mb-4" />
									<v-text-field v-model="bestiary.image" label="Image" class="mb-4" />
								</div>

								<v-textarea v-model="bestiary.description" :max-length="store.limits?.descriptionLength"
									:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]"
									label="Description" class="mb-4" hint="Supports Markdown" persistent-hint counter />
								<div class="grid-two">
									<div>
										<v-select v-model="bestiary.status" label="Status"
											:items="[{ value: 'private', title: 'Private' }, { value: 'unlisted', title: 'Unlisted' }, { value: 'public', title: 'Public' }]" />
									</div>
									<v-select v-model="bestiary.tags" multiple :items="store.tags || []" label="Tags"
										chips closable-chips />
								</div>

								<div class="editor-block">
									<h3 style="margin-bottom: .5rem">
										Editors
									</h3>
									<small>
										Editors can add, edit, and remove creatures. <br>
										Editors cannot edit the Bestiary itself. <br>
										Editors cannot add other editors. The owner can remove editors at any time.
									</small>
									<div class="editor-container" style="margin-top: .5rem">
										<div v-for="editor in editors" :key="editor.id" class="editor-list">
											<p>
												<UserBanner :id="editor.id" />
												<span v-if="isOwner" role="button" class="delete-creature"
													@click="removeEditor(editor.id)"> <span>🗑️</span> </span>
											</p>
										</div>
									</div>
									<LabelledComponent title="Add editor" for="addeditor" style="margin-top: .5rem">
										<div class="grid-two">
											<v-text-field v-model="editorToAdd" inputmode="numeric"
												label="Discord user ID"
												:rules="[rules.integer('This must be a numeric Discord User ID.')]"
												pattern="[0-9]*" />
											<v-btn class="mz-auto" @click="addEditor()">
												Add
											</v-btn>
										</div>
									</LabelledComponent>
								</div>
								<p v-if="showWarning" class="warning">
									By changing the bestiary status to public I confirm that I am the copyright holder
									of the content
									within, or that I have permission from the copyright holder to share this content. I
									hereby agree to
									the <RouterLink to="../content-policy">
										Content Policy
									</RouterLink> and agree to
									be fully liable for the content within. I affirm that the content does not include
									any official
									non-free D&D content. Bestiaries that breach these terms may have their status
									changed to private or
									be outright removed, and may result in a ban if the content breaches our content
									policy.
								</p>
							</v-form>
						</v-sheet>
						<v-card-actions>
							<v-spacer />
							<v-btn text="Save changes" color="green" size="large" @click="updateBestiary" />
							<v-btn text="Cancel" size="large" @click="isActive.value = false" />
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>
			<DropdownMenu>
				<template #activator="{ props }">
					<v-icon-btn text="Search creatures" icon="mdi:tag" size="24" v-bind="props" />
				</template>
				<v-card min-width="300" class="text-center pb-2 pa-4" title="Search bestiary">
					<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
						<v-select v-model="sortMode"
							:items="['Custom', 'Alphabetically', 'CR Ascending', 'CR Descending', 'Creature Type']"
							label="Bestiary sort type" width="100%" />
						<div class="grid-two">
							<v-text-field v-model="searchText" label="Name" width="200" />
							<v-select v-model="searchOptions.tags" :items="creatureTypes" label="Creature type" multiple
								chips closable-chips width="200" />
							<CRInput v-model="searchOptions.minCr" label="Minimum CR" />
							<CRInput v-model="searchOptions.maxCr" label="Maximum CR" />
							<v-text-field v-model="searchFaction" label="Faction" width="200" />
							<v-text-field v-model="searchEnv" label="Environment" width="200" />
						</div>
					</v-card-actions>
				</v-card>
			</DropdownMenu>

			<v-dialog v-if="isOwner" max-width="750">
				<template #activator="{ props }">
					<v-icon-btn text="Import automation" icon="mdi:import" size="24" v-bind="props" />
				</template>

				<template #default="{ isActive }">
					<v-card title="Import bestiary">
						<v-sheet class="pa-4" max-width="1800" rounded="lg" width="100%">
							<div class="grid-two">
								<v-text-field v-model="critterDbId" label="CritterDB Bestiary link"
									hint="Make sure the Bestiary is public or has link-sharing enabled"
									persistent-hint />
								<v-text-field v-model="bestiaryBuilderJson" label="Bestiary Builder JSON"
									hint="JSON as text gotten from clicking export elsewhere on BB" persistent-hint />
								<v-btn size="large" @click="importBestiaryFromCritterDB()">
									Import CritterDB
								</v-btn>
								<v-btn size="large" @click="importCreaturesFromBestiaryBuilder()">
									Import BB
								</v-btn>
							</div>
						</v-sheet>
						<v-card-actions>
							<v-spacer />
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
						<v-btn class="w-100" color="green" size="large" @click="exportBestiary(false)">
							Clipboard
						</v-btn>
						<v-btn class="w-100" color="green" size="large" @click="exportBestiary(true)">
							File
						</v-btn>
						<v-btn class="w-100" color="green" size="large" @click="exportHomebrewery()">
							Homebrewery
						</v-btn>
					</v-card-actions>
				</v-card>
			</DropdownMenu>
		</Breadcrumbs>
		<div class="content">
			<div v-if="bestiary" class="bestiary">
				<div class="left-side-container">
					<div class="content-tile header-tile">
						<h2>{{ bestiary.name ? bestiary.name : "..." }}</h2>
						<Markdown class="description" :class="{ expanded: isExpanded }"
							:text="bestiary.description || 'No description set.'" tag="p" />
						<button v-if="bestiary.description.length > 0" v-tooltip="'Expand description'"
							class="expand-btn" aria-label="Expand description" @click="isExpanded = !isExpanded">
							{{ isExpanded ? "▲" : "▼" }}
						</button>
						<hr>
						<div class="footer" :class="{ 'three-wide': isOwner }">
							<UserBanner :id="bestiary.ownerId" />
							<div v-tooltip.left="bestiary.status">
								<StatusIcon :icon="bestiary.status" />
							</div>
							<div>{{ bestiary.creatures.length }}<v-icon icon="mdi:paw" size="20" /></div>
							<div v-if="!isOwner" role="button" aria-label="Toggle bookmark status" class="bookmark"
								@click.prevent="toggleBookmark">
								<span v-if="bookmarked" v-tooltip="'Unbookmark this bestiary'"
									class="bookmark-enabled"><v-icon size="20" icon="mdi-star" /></span>
								<span v-else v-tooltip="'Bookmark this bestiary'" class="bookmark-disabled"><v-icon
										size="20" icon="mdi-star" /></span>
							</div>
						</div>
					</div>
					<v-skeleton-loader type="heading, text, text" v-if="creatures === null" />
					<Draggable v-else :list="sortCreatures() || Array(0).fill({ stats: defaultStatblock })"
						:animation="500" class="tile-container list-tiles" :item-key="getDraggableKey"
						:disabled="sortMode !== 'Custom'" @change="saveOrder">
						<template #item="{ element }">
							<CreatureListItem v-if="filterCreature(element)" :id="element.id" :data="element.stats"
								:can-edit="isOwner || isEditor" @mouseover="lastHoveredCreature = element.stats"
								@delete-creature="(id) => deleteCreature(id)"
								@pin-creature="lastClickedCreature = element.stats"
								@copy-creature="copiedCreatures.push({ ...element, bestiaryName: bestiary.name }); $toast.info('Copied Successfully!')" />
						</template>
					</Draggable>

					<div v-if="isOwner || isEditor" class="create-tile">
						<DropdownMenu>
							<template #activator="{ props }">
								<v-btn v-bind="props" variant="plain" :ripple="false">
									Add creature
								</v-btn>
							</template>
							<v-card min-width="300" class="text-center pa-4" title="Create creature">
								<v-card-actions class="d-flex flex-column align-center justify-center">
									<v-btn size="x-large" @click="createCreature()">
										From scratch
									</v-btn>
									<div class="d-flex align-center my-4 w-100">
										<v-divider class="flex-grow-1" />
										<span class="mx-4 text-medium-emphasis">OR</span>
										<v-divider class="flex-grow-1" />
									</div>

									<v-autocomplete :items="srdCreatures" label="Select SRD creature" width="400"
										@update:model-value="item => importSrdCreature(item)">
										<template #item="{ props, item }">
											<v-list-item v-bind="props" density="compact" style="min-height: 28px">
												{{ (item as any).title }}
											</v-list-item>
										</template>
									</v-autocomplete>
								</v-card-actions>
							</v-card>
						</DropdownMenu>
					</div>
				</div>
				<div v-if="creatures && lastHoveredCreature" class="statblock-container">
					<span v-if="false && lastClickedCreature" class="pin-notice">
						<span class="unpin-button" role="button" aria-label="unpin currently pinned creature"
							@click="lastClickedCreature = null"><b>unpin</b></span>📌
					</span>
					<Transition name="fade" mode="out-in">
						<StatblockRenderer
							:key="lastClickedCreature?.description.name || lastHoveredCreature.description.name"
							:data="lastClickedCreature || lastHoveredCreature" />
					</Transition>
				</div>
				<div v-else class="statblock-container">
					<div class="no-creature-text">
						<p>Hover or click on a creature to see its statblock</p>
					</div>
				</div>
			</div>
		</div>
		<Modal v-if="bestiary && isOwner" :show="showImportModal" @close="showImportModal = false">
			<template #header>
				Import Creatures
			</template>
			<template #body>
				<LabelledComponent title="CritterDB bestiary link" for="critterlink">
					<p>Insert a link to a critterDB bestiary to import all its creatures.</p>
					<p>Make sure the bestiary is public or has link sharing enabled.</p>
					<div class="flow-horizontally">
						<input id="critterlink" v-model="critterDbId" type="text" placeholder="CritterDB bestiary link">
						<button class="btn confirm" @click.prevent="importBestiaryFromCritterDB">
							Import
						</button>
					</div>
				</LabelledComponent>

				<hr>

				<LabelledComponent title="Bestiary Builder JSON" for="bestiaryjson">
					<p>
						Insert the JSON as text gotten from clicking export on another bestiary within Bestiary Builder.
					</p>
					<div class="flow-horizontally">
						<input id="bestiaryjson" v-model="bestiaryBuilderJson" type="text"
							placeholder="Bestiary builder JSON">
						<button class="btn confirm" @click.prevent="importCreaturesFromBestiaryBuilder">
							Import
						</button>
					</div>
				</LabelledComponent>

				<hr>

				<div v-if="JSON.stringify(notices) !== '{}'">
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
				</div>
			</template>
		</Modal>
	</div>
</template>

<style lang="less">
@import url("@/components/FormInputs/styles/number-input.less");
@import url("@/assets/styles/mixins.less");

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
	padding: 0rem;
	margin-top: 1rem;

	.content-tile {
		height: fit-content !important;
		background: var(--color-surface-1);
		color: white;
		padding: 1rem;
		box-shadow:
			rgba(0, 0, 0, 0.19) 0px 10px 20px,
			rgba(0, 0, 0, 0.23) 0px 6px 6px;
		cursor: pointer;
		transition: all 1s;
		transition-timing-function: cubic-bezier(0.06, 0.975, 0.195, 0.985);
		border-radius: 2px;
		border-radius: 3px;

		h3 {
			font-size: 1.5rem;
		}

		&.creature-tile {
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			justify-content: space-between;

			.left-side {

				span,
				p {
					font-style: italic;
					font-size: 0.85rem;
				}

				.cr {
					color: orangered;
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
					color: orangered;
					font-size: 1.2rem;
					display: flex;
					align-items: center;
					height: 100%;
					cursor: pointer;

					svg {
						color: #536d8c;
					}
				}

				button {
					.scale-on-hover(1.2);

					&:hover {
						overflow: visible;
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

@media screen and (max-width: 842px) {
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
	background-color: var(--color-surface-2);
	cursor: unset;
	margin: 0 0rem 1rem;
	padding: 1rem;
	border-radius: 2px;

	h2 {
		text-align: center;
		text-wrap: nowrap;
		overflow: hidden;
		color: white;
		max-width: 90vw;
	}

	.description {
		max-height: 8rem;
		font-size: small;
		color: rgb(205, 205, 205);
		overflow-y: hidden;
		overflow-wrap: anywhere;

		&.expanded {
			max-height: unset;
		}
	}

	.description:not(.expanded) {
		-webkit-mask-image: linear-gradient(180deg, #000 80%, transparent);
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

@media screen and (max-width: 842px) {
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

@media screen and (max-width: 1080px) {
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
	color: orangered;
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
		filter: grayscale(100%);
		transition: filter 0.3s ease;

		&:hover {
			filter: grayscale(0%);
		}
	}

	.bookmark-enabled {
		filter: grayscale(0%);
		transition: filter 0.3s ease;

		&:hover {
			filter: grayscale(100%);
		}
	}
}

.slide-fade-enter-active {
	transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
	transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
	transform: translateX(-50px);
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
	color: var(--color-destructive);
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
