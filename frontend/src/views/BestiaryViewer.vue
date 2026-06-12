<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { refDebounced } from "@vueuse/core";
import { createPopper } from "@popperjs/core";
import UserBanner from "@/components/UserBanner.vue";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import StatusIcon from "@/components/StatusIcon.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import Modal from "@/components/Modal.vue";
import StatblockRenderer from "@/components/StatblockRenderer.vue";
import Markdown from "@/components/Markdown.vue";

import { crAsString, defaultStatblock } from "~/shared";
import type { Bestiary, BestiaryExtended, CreatureWithStats, Statblock, User } from "~/shared";
import { useFetch } from "@/utils/utils";
import { toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { creatureTypes } from "@/utils/constants";
import { $loading } from "@/utils/app/loading";

const route = useRoute();
const router = useRouter();

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
const sortMode = ref("Alphabetically");
const isExpanded = ref(false);
const showEditorModal = ref(false);
const showImportModal = ref(false);
const srdCreatures = ref<string[]>([]);

const searchCreatures = computed<CreatureWithStats[] | null>(() => {
	if (creatures.value == null)
		return null;
	const loader = $loading.show();

	const response = creatures.value?.filter((creature: CreatureWithStats) => filterCreature(creature)) || null;

	if (sortMode.value === "Alphabetically") {
		response.sort((a, b) => {
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
		response.sort((a, b) => {
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
		response.sort((a, b) => {
			return b.stats.description.cr - a.stats.description.cr;
		});
	}
	else if (sortMode.value === "CR Ascending") {
		response.sort((a, b) => {
			return a.stats.description.cr - b.stats.description.cr;
		});
	}
	loader.hide();

	return response;
});

watch(lastClickedCreature, (): void => {
	if (hasPinnedBefore.value)
		return;
	if (!hasPinnedBefore.value)
		hasPinnedBefore.value = true;

	toast.info("Pinned creature to the view. Click unpin there to go back to hover behaviour.");
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

onMounted(async () => {
	const loader = $loading.show();
	await getBestiary().then(() => {
		loader.hide();
	});

	if (bestiary.value?.name)
		document.title = `${bestiary.value?.name.substring(0, 16)} | Bestiary Builder`;

	await useFetch<string[]>(`/api/srd-creatures/list`).then(({ success, data, error }) => {
		if (success)
			srdCreatures.value = data;

		if (error)
			toast.error(error);
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
			toast.info("Exported this bestiary markdown to your clipboard");
		}
		else {
			toast.error(error);
		}
	}
	catch (err) {
		toast.error(err as string);
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
		toast.info("Exported this bestiary to your clipboard.");
	}
}

async function importBestiaryFromCritterDB() {
	let link = critterDbId.value.trim();
	const isPublic = link.includes("publishedbestiary");
	try {
		const url = new URL(link);
		if (url.hostname !== "critterdb.com" && !url.hostname.endsWith(".critterdb.com")) {
			toast.error("Could not recognize link as a link to a CritterDB bestiary");
			return;
		}
	}
	catch {
		return;
	}

	const linkEls = link.split("/");
	link = linkEls[linkEls.length - 1];

	toast.info("Fetching bestiary data has started. This may take a while.");
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
			toast.error(`Failed to parse ${data.failedCreatures.length} creatures, due to invalid data recieved.`);
		for (const creature of data.failedCreatures)
			notices.value[creature] = "Failed to parse, due to unrecognized data.";
	}
	else {
		toast.error(error);
		loader.hide();
		return;
	}
	toast.info("Saving creatures has started. This may take a while.");
	const { success: cSuccess, data: creatureData, error: cError } = await useFetch<{ error?: string; ignoredCreatures: { creature: string; error: string }[] }>(`/api/bestiary/${bestiary.value?.id.toString()}/addcreatures`, "POST", data.data.creatures);
	if (!cSuccess) {
		notices.value = {};
		toast.error(cError);
	}
	else if (creatureData.error) {
		toast.error("The import was completed with errors.");
		notices.value.Errors = creatureData.error;
		for (const error of creatureData.ignoredCreatures)
			notices.value[error.creature] = error.error;
	}
	await getBestiary();
	loader.hide();
	toast.success("Importing has finished!");
	if (cSuccess && !creatureData.error)
		showImportModal.value = false;
}

async function importCreaturesFromBestiaryBuilder() {
	let creaturesToImport;
	const loader = $loading.show();
	try {
		creaturesToImport = JSON.parse(bestiaryBuilderJson.value);
	}
	catch (e) {
		console.error(e);
		toast.error("Something is wrong with the format of your JSON");
		loader.hide();
		return;
	}
	toast.info("Importing creatures has started. This may take a while.");
	const { success, data, error } = await useFetch<{ error?: string; ignoredCreatures: { creature: string; error: string }[] }>(`/api/bestiary/${bestiary.value?.id.toString()}/addcreatures`, "POST", creaturesToImport);
	if (!success) {
		notices.value = {};
		toast.error(error);
	}
	else if (data.error) {
		toast.error("The import was completed with errors.");
		notices.value.Errors = data.error;
		for (const error of data.ignoredCreatures)
			notices.value[error.creature] = error.error;
	}
	else {
		toast.success("Importing has finished!");
	}

	await getBestiary();
	loader.hide();
	if (success && !data.error)
		showImportModal.value = false;
}

async function createCreature(stats = defaultStatblock, shouldHaveLoader = true) {
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
		await router.push(`../statblock-editor/${data.id.toString()}`);
	}
	else {
		toast.error(error);
	}

	if (shouldHaveLoader && loader)
		loader.hide();
}

async function deleteCreature(creature: CreatureWithStats) {
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/creature/${creature.id.toString()}/delete`);
	if (success) {
		toast.success("Deleted creature succesfully");
		if (!bestiary.value)
			return;
		bestiary.value.creatures = bestiary.value.creatures.filter(c => c.id !== creature.id);
		creatures.value = creatures.value?.filter(c => c.id !== creature.id) ?? [];
	}
	else {
		toast.error(error);
	}
	loader.hide();
}

async function importSrdCreature(creature: string) {
	const { success, data, error } = await useFetch<Statblock>(`/api/srd-creature/${encodeURIComponent(creature)}`);
	if (success) {
		await createCreature(data);
		return data;
	}
	else {
		toast.error(error);
	}
}

function withPopper(dropdownList: any, component: any, { width }: { width: any }) {
	/**
	 * We need to explicitly define the dropdown width since
	 * it is usually inherited from the parent with CSS.
	 */
	dropdownList.style.width = width;

	/**
	 * Here we position the dropdownList relative to the $refs.toggle Element.
	 *
	 * The 'offset' modifier aligns the dropdown so that the $refs.toggle and
	 * the dropdownList overlap by 1 pixel.
	 *
	 * The 'toggleClass' modifier adds a 'drop-up' class to the Vue Select
	 * wrapper so that we can set some styles for when the dropdown is placed
	 * above.
	 */
	const popper = createPopper(component.$refs.toggle, dropdownList, {
		placement: "top",
		modifiers: [
			{
				name: "offset",
				options: {
					offset: [0, -1],
				},
			},
			{
				name: "toggleClass",
				enabled: true,
				phase: "write",
				fn({ state }) {
					component.$el.classList.toggle(
						"drop-up",
						state.placement === "top"
					);
				},
			},
		],
	});

	/**
	 * To prevent memory leaks Popper needs to be destroyed.
	 * If you return function, it will be called just before dropdown is removed from DOM.
	 */
	return () => popper.destroy();
}

async function addEditor() {
	if (!bestiary.value)
		return;
	const id = editorToAdd.value;
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/bestiary/${bestiary.value.id.toString()}/editors/add/${id}`);
	if (success)
		toast.success("Added editor succesfully");
	else
		toast.error(error);

	await getBestiary();
	loader.hide();
}

async function removeEditor(id: string) {
	if (!bestiary.value)
		return;
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/bestiary/${bestiary.value.id.toString()}/editors/remove/${id}`);
	if (success)
		toast.success("Removed editor succesfully");
	else
		toast.error(error);

	await getBestiary();
	loader.hide();
}

async function getBestiary() {
	// Get id
	const id = route.params.id;
	// Request bestiary info
	const { success, data, error } = await useFetch<BestiaryExtended>(`/api/bestiary/${id.toString()}`);
	if (!success) {
		bestiary.value = null;
		toast.error(error);
		return;
	}
	bestiary.value = data;
	savedBestiary.value = bestiary.value;
	isOwner.value = store.user?.id === bestiary.value.ownerId;
	isEditor.value = (bestiary.value?.editors ?? []).map(e => e.userId).includes(store.user?.id ?? "");
	// Fetch creatures
	await useFetch<CreatureWithStats[]>(`/api/bestiary/${bestiary.value.id.toString()}/creatures`).then(async (creatureResult) => {
		if (creatureResult.success) {
			creatures.value = creatureResult.data;
		}
		else {
			creatures.value = null;
			toast.error(creatureResult.error);
		}
	});
	// Fetch editors
	editors.value = [] as User[];
	for (const { userId: editorId } of bestiary.value?.editors ?? []) {
		await useFetch(`/api/user/${editorId}`).then((editorResult) => {
			if (editorResult.success)
				editors.value.push(editorResult.data as User);
			else
				toast.error(editorResult.error);
		});
	}
	// Bookmark state
	if (store.user) {
		await useFetch<{ state: boolean }>(`/api/bestiary/${bestiary.value.id.toString()}/bookmark/get`).then(async (bookmarkResult) => {
			if (bookmarkResult.success) {
				bookmarked.value = (bookmarkResult.data as { state: boolean }).state;
			}
			else {
				bookmarked.value = false;
				toast.error(bookmarkResult.error);
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
		toast.success("Saved bestiary");
		savedBestiary.value = bestiary.value;
		showEditorModal.value = false;
	}
	else {
		toast.error(error);
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
		if (bookmarked.value)
			toast.success("Successfully bookmarked this bestiary!");
		else toast.success("Successfully unbookmarked this bestiary!");
	}
	else {
		bookmarked.value = false;
		toast.error(error);
	}
	loader.hide();
}

function changeCR(isIncrease: boolean, isMinimumOption: boolean): void {
	let cr;
	if (isMinimumOption)
		cr = searchOptions.value.minCr;
	else cr = searchOptions.value.maxCr;
	if (cr === 0 && isIncrease) {
		cr = 0.125;
	}
	else if (cr === 0.125 && isIncrease) {
		cr = 0.25;
	}
	else if (cr === 0.25 && isIncrease) {
		cr = 0.5;
	}
	else if (cr === 0.5 && isIncrease) {
		cr = 1;
	}
	else if (cr === 0.125 && !isIncrease) {
		cr = 0;
	}
	else if (cr === 0.25 && !isIncrease) {
		cr = 0.125;
	}
	else if (cr === 0.5 && !isIncrease) {
		cr = 0.25;
	}
	else if (cr === 1 && !isIncrease) {
		cr = 0.5;
	}
	else {
		if (isIncrease)
			cr = Math.min(30, cr + 1);
		else
			cr = Math.max(0, cr - 1);
	}
	if (isMinimumOption)
		searchOptions.value.minCr = cr;
	else searchOptions.value.maxCr = cr;
}
</script>

<template>
	<p>Test</p>
	<div>
		<Breadcrumbs
			v-if="bestiary"
			:routes="[
				{
					path: isOwner || isEditor ? '../my-bestiaries/' : '../bestiaries',
					text: isOwner || isEditor ? 'My Bestiaries' : 'Bestiaries',
					isCurrent: false
				},
				{
					path: '',
					text: bestiary?.name,
					isCurrent: true
				}
			]"
		>
			<VDropdown v-if="isOwner || isEditor" :distance="6" placement="top" :positioning-disabled="store.isMobile">
				<button v-tooltip="'Create creature!'" class="inverted" aria-label="Create creature">
					<font-awesome-icon :icon="['fas', 'plus']" />
				</button>
				<template #popper>
					<div class="v-popper__custom-menu">
						<LabelledComponent title="From Scratch" for="fromScratch">
							<button id="fromScratch" v-close-popper class="btn" @click.stop="createCreature()">
								From scratch
							</button>
						</LabelledComponent>
						<LabelledComponent title="From SRD Creature" for="fromSrd">
							<v-select ref="toggle" :options="srdCreatures" input-id="fromSrd" placeholder="Select SRD creature" style="min-width: 300px" append-to-body :calculate-position="withPopper" @option:selected="(selected : string) => (importSrdCreature(selected))" />
						</LabelledComponent>
					</div>
				</template>
			</VDropdown>

			<button v-if="lastClickedCreature" v-tooltip="'Unpin currently pinned creature!'" style="rotate: 45deg" aria-label="Unpin currently pinned creature" @click="lastClickedCreature = null">
				<font-awesome-icon :icon="['fas', 'thumbtack']" />
			</button>
			<button v-if="isOwner" v-tooltip="'Edit bestiary!'" aria-label="Edit bestiary" @click="showEditorModal = true">
				<font-awesome-icon :icon="['fas', 'pen-to-square']" />
			</button>
			<VDropdown :distance="6" :positioning-disabled="store.isMobile">
				<button v-tooltip="'Filter bestiary'" aria-label="Filter bestiary">
					<font-awesome-icon :icon="['fas', 'tag']" />
				</button>
				<template #popper>
					<div class="v-popper__custom-menu">
						<LabelledComponent title="Sort creatures" for="sortcreatures">
							<select id="sortcreatures" v-model="sortMode" name="Sort bestiary by attribute">
								<option>Alphabetically</option>
								<option>CR Ascending</option>
								<option>CR Descending</option>
								<option>Creature Type</option>
							</select>
						</LabelledComponent>
						<LabelledComponent title="Filter" for="searchtext">
							<input id="searchtext" v-model="searchText" type="text" placeholder="Search by name...">
						</LabelledComponent>
						<LabelledComponent title="Creature type" for="creatureType">
							<div style="min-width: 300px">
								<v-select v-model="searchOptions.tags" placeholder="Search by creature type" multiple :options="creatureTypes" input-id="creaturetype" :taggable="true" />
							</div>
						</LabelledComponent>
						<div class="two-wide">
							<div class="flow-vertically">
								<label class="editor-field__title" for="challengerating"><span class="text"> Minimum CR</span></label>
								<div class="quantity">
									<input id="minimumcr" v-model="searchOptions.minCr" type="number" min="0" max="30" inputmode="numeric">
									<div class="quantity-nav">
										<div class="quantity-button quantity-up" aria-label="Increase minimum CR" @click="changeCR(true, true)">
											+
										</div>
										<div class="quantity-button quantity-down" aria-label="Decrease maximum CR" @click="changeCR(false, true)">
											-
										</div>
									</div>
								</div>
							</div>
							<div class="flow-vertically">
								<label class="editor-field__title" for="challengerating"><span class="text"> Maximum CR</span></label>
								<div class="quantity">
									<input id="maximumcr" v-model="searchOptions.maxCr" type="number" min="0" max="30" inputmode="numeric">
									<div class="quantity-nav">
										<div class="quantity-button quantity-up" aria-label="Increase minimum CR" @click="changeCR(true, false)">
											+
										</div>
										<div class="quantity-button quantity-down" aria-label="Decrease maximum CR" @click="changeCR(false, false)">
											-
										</div>
									</div>
								</div>
							</div>
						</div>
						<span v-if="searchOptions.minCr > searchOptions.maxCr" class="warning" style="text-align: center"> Min is bigger than max </span>
						<LabelledComponent title="Environment" for="environment">
							<input id="environment" v-model="searchEnv" type="text" placeholder="Search by name...">
						</LabelledComponent>
						<LabelledComponent title="Faction" for="faction">
							<input id="faction" v-model="searchFaction" type="text" placeholder="Search by name...">
						</LabelledComponent>
					</div>
				</template>
			</VDropdown>

			<button v-if="isOwner" v-tooltip="'Import bestiary'" aria-label="Import bestiary" @click="showImportModal = true">
				<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
			</button>

			<VDropdown :distance="6" :positioning-disabled="store.isMobile">
				<button v-tooltip="'Export bestiary'" aria-label="Export bestiary">
					<font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
				</button>
				<template #popper>
					<div class="v-popper__custom-menu">
						<span>
							Export this Bestiary
						</span>
						<button v-close-popper class="btn confirm" @click="exportBestiary(false)">
							Clipboard
						</button>
						<button v-close-popper class="btn confirm" @click="exportBestiary(true)">
							File
						</button>
						<button v-close-popper class="btn confirm" @click="exportHomebrewery()">
							Homebrewery
						</button>
					</div>
				</template>
			</VDropdown>
		</Breadcrumbs>
		<div class="content">
			<div v-if="bestiary" class="bestiary">
				<div class="left-side-container">
					<div class="content-tile header-tile">
						<h2>{{ bestiary.name ? bestiary.name : "..." }}</h2>
						<Markdown class="description" :class="{ expanded: isExpanded }" :text="bestiary.description || 'No description set.'" tag="p" />
						<button v-if="bestiary.description.length > 0" v-tooltip="'Expand description'" class="expand-btn" aria-label="Expand description" @click="isExpanded = !isExpanded">
							{{ isExpanded ? "▲" : "▼" }}
						</button>
						<hr>
						<div class="footer" :class="{ 'three-wide': isOwner }">
							<UserBanner :id="bestiary.ownerId" />
							<div v-tooltip.left="bestiary.status">
								<StatusIcon :icon="bestiary.status" />
							</div>
							<div>{{ bestiary.creatures.length }}<font-awesome-icon :icon="['fas', 'skull']" /></div>
							<div v-if="!isOwner" role="button" aria-label="Toggle bookmark status" class="bookmark" @click.prevent="toggleBookmark">
								<span v-if="bookmarked" v-tooltip="'Unbookmark this bestiary'" class="bookmark-enabled"><font-awesome-icon :icon="['fas', 'star']" /></span>
								<span v-else v-tooltip="'Bookmark this bestiary'" class="bookmark-disabled"><font-awesome-icon :icon="['fas', 'star']" /></span>
							</div>
						</div>
					</div>
					<div class="tile-container list-tiles">
						<TransitionGroup name="slide-fade">
							<div v-for="creature in searchCreatures" :key="creature.id.toString()" class="content-tile creature-tile" @mouseover="lastHoveredCreature = creature.stats" @click="lastClickedCreature = creature.stats">
								<div class="left-side">
									<h3>{{ creature.stats?.description?.name }}</h3>
									<span>{{ creature.stats?.core?.size }} {{ creature.stats?.core?.race }}{{ creature.stats?.description?.alignment ? `, ${creature.stats?.description?.alignment}` : "" }}</span>
								</div>
								<div class="right-side">
									<VDropdown v-if="isOwner || isEditor" :distance="6" :positioning-disabled="store.isMobile">
										<button v-tooltip="'Delete creature'" :aria-label="`Delete ${creature.stats.description.name}`" @click.stop.prevent="">
											<font-awesome-icon :icon="['fas', 'trash']" />
										</button>
										<template #popper>
											<div class="v-popper__custom-menu">
												<span> Are you sure you want to delete this creature? </span>
												<button v-close-popper class="btn danger" @click.stop="deleteCreature(creature)">
													Confirm
												</button>
											</div>
										</template>
									</VDropdown>
									<button v-tooltip="`${isOwner || isEditor ? 'Edit' : 'View'} creature`" :aria-label="`${isOwner || isEditor ? 'Edit' : 'View'} ${creature.stats.description.name}`" class="edit-creature" @click.stop="() => {}">
										<RouterLink class="creature" :to="`/statblock-editor/${creature.id}`" :aria-label="`${isOwner || isEditor ? 'Edit' : 'View'} creature`">
											<font-awesome-icon v-if="isOwner || isEditor" :icon="['fas', 'pen-to-square']" />
											<font-awesome-icon v-else :icon="['fas', 'eye']" />
										</RouterLink>
									</button>
									<span class="cr"> CR {{ crAsString(creature.stats.description.cr) }}</span>
								</div>
							</div>
						</TransitionGroup>
						<div v-if="isOwner || isEditor" class="create-tile">
							<VDropdown v-if="isOwner || isEditor" :distance="6" placement="top" :positioning-disabled="store.isMobile">
								<span role="button" class="create-text">Add Creature</span>
								<template #popper>
									<div class="v-popper__custom-menu">
										<LabelledComponent title="From Scratch" for="fromScratch">
											<button id="fromScratch" v-close-popper class="btn" @click.stop="createCreature()">
												From scratch
											</button>
										</LabelledComponent>
										<LabelledComponent title="From SRD Creature" for="fromSrd">
											<v-select :options="srdCreatures" input-id="fromSrd" placeholder="Select SRD creature" style="min-width: 300px" append-to-body :calculate-position="withPopper" @option:selected="(selected : string) => (importSrdCreature(selected))" />
										</LabelledComponent>
									</div>
								</template>
							</VDropdown>
						</div>
					</div>
				</div>
				<div v-if="creatures && lastHoveredCreature" class="statblock-container">
					<span v-if="lastClickedCreature" class="pin-notice">
						<span class="unpin-button" role="button" aria-label="unpin currently pinned creature" @click="lastClickedCreature = null"><b>unpin</b></span>📌
					</span>
					<Transition name="fade" mode="out-in">
						<StatblockRenderer :key="lastClickedCreature?.description.name || lastHoveredCreature.description.name" :data="lastClickedCreature || lastHoveredCreature" />
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
					<p>Insert the JSON as text gotten from clicking export on another bestiary within Bestiary Builder.</p>
					<div class="flow-horizontally">
						<input id="bestiaryjson" v-model="bestiaryBuilderJson" type="text" placeholder="Bestiary builder JSON">
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

		<Modal v-if="bestiary && isOwner" :show="showEditorModal" @close="showEditorModal = false">
			<template #header>
				Edit Bestiary
			</template>
			<template #body>
				<LabelledComponent title="Bestiary name" for="bestiaryname">
					<input id="bestiaryname" v-model="bestiary.name" type="text" :minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength">
				</LabelledComponent>
				<LabelledComponent title="Description" for="description">
					<p>Supports markdown</p>
					<textarea id="description" v-model="bestiary.description" :maxlength="store.limits?.descriptionLength" />
				</LabelledComponent>
				<div v-if="isOwner" class="two-wide">
					<LabelledComponent title="Status" for="status">
						<v-select v-model="bestiary.status" :options="['public', 'unlisted', 'private']" input-id="status" />
					</LabelledComponent>
					<LabelledComponent title="Tags" for="tags">
						<v-select v-model="bestiary.tags" placeholder="Select Tags" multiple :options="store.tags" input-id="tags" />
					</LabelledComponent>
				</div>
				<div class="editor-block">
					<h3>Editors</h3>
					<p v-if="isOwner">
						Editors can add, edit, and remove creatures. They can edit the name of the bestiary and its description. Editors cannot change the status of the bestiary or delete the bestiary. Editors cannot add other editors. The owner can remove editors at any time.
					</p>
					<div class="editor-container">
						<div v-for="editor in editors" :key="editor.id" class="editor-list">
							<p>
								<UserBanner :id="editor.id" />
								<span v-if="isOwner" role="button" class="delete-creature" @click="removeEditor(editor.id)"> <span>🗑️</span> </span>
							</p>
						</div>
					</div>
					<LabelledComponent title="Add editor" for="addeditor">
						<div class="button-container">
							<input id="addeditor" v-model="editorToAdd" type="text" inputmode="numeric" placeholder="Discord user ID">
							<button class="btn" @click="addEditor()">
								Add
							</button>
						</div>
					</LabelledComponent>
				</div>
				<p v-if="showWarning" class="warning">
					By changing the bestiary status to public I confirm that I am the copyright holder of the content within, or that I have permission from the copyright holder to share this content. I hereby agree to the <RouterLink to="../content-policy">
						Content Policy
					</RouterLink> and agree to
					be fully liable for the content within. I affirm that the content does not include any official non-free D&D content. Bestiaries that breach these terms may have their status changed to private or be outright removed, and may result in a ban if the content breaches our content
					policy.
				</p>
			</template>
			<template #footer>
				<button class="btn confirm" @click.prevent="updateBestiary">
					Save changes
				</button>
			</template>
		</Modal>
	</div>
</template>

<style scoped lang="less">
@import url("@/assets/styles/number-input.less");
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

		h3 {
			font-size: 1.5rem;
		}
		&.creature-tile {
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			justify-content: space-between;

			.left-side span {
				font-style: italic;
				font-size: 0.85rem;
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

					&.cr {
						width: 5rem;
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

	.create-tile {
		text-align: center;
		text-decoration: underline;
		span {
			cursor: pointer;
		}
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

	h3 {
		font-size: 1.5rem;
		border-bottom: 1px solid orangered;
	}

	.editor-list p {
		display: flex;
		gap: 1rem;
		margin: 1rem 0;
	}

	.button-container {
		display: flex;
		gap: 1rem;
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
