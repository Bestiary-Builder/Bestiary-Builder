<script setup lang="ts">
import type { BestiaryExtended, CreatureWithStats, Statblock, User } from "~/shared";
import { refDebounced, useLocalStorage } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Draggable from "vuedraggable";
import CopyCreature from "@/components/Bestiary/CopyCreature.vue";
import CreatureListItem from "@/components/Bestiary/CreatureListItem.vue";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import CRInput from "@/components/FormInputs/CRInput.vue";
import Markdown from "@/components/Global/Markdown.vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import { getUmami } from "@/utils/app/analytics";
import { $loading } from "@/utils/app/loading";
import { $toast } from "@/utils/app/toast";
import { creatureTypes } from "@/utils/constants";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { defaultStatblock } from "~/shared";

const route = useRoute();

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
const showWarning = ref(false);

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
const loading = ref(true);
onMounted(async () => {
	// const loader = $loading.show();
	await getBestiary().then(() => {
		// loader.hide();
	});
	loading.value = false;
	if (bestiary.value?.name)
		document.title = `${bestiary.value?.name.substring(0, 16)} | Bestiary Builder`;
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

async function getBestiary() {
	// Get id
	const id = route.params.id;
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
				path: isOwner || isEditor ? '/bestiaries/personal' : '/bestiaries',
				text: isOwner || isEditor ? 'My Bestiaries' : 'Bestiaries',
				isCurrent: false
			},
			{
				path: '',
				text: bestiary?.name,
				isCurrent: true
			}
		]">
			<CopyCreature :may-import="false" :current-creatures="creatures || []" can-copy-current-bestiary
				@copy-current-bestiary="copyCurrentBestiary" />
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
						<div class="footer">
							<UserBanner :id="bestiary.ownerId" />
							<div v-tooltip="bestiary.status">
								<StatusIcon :icon="bestiary.status" />
							</div>
							<div>{{ bestiary.creatures.length }}<v-icon icon="mdi:paw" size="20" /></div>
							<div role="button" aria-label="Toggle bookmark status" class="bookmark"
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
								:can-edit="false" @mouseover="lastHoveredCreature = element.stats"
								@pin-creature="lastClickedCreature = element.stats"
								@copy-creature="copiedCreatures.push({ ...element, bestiaryName: bestiary.name }); $toast.info('Copied Successfully!')"" />
						</template>
			</Draggable>
		</div>
		<div v-if="creatures && lastHoveredCreature" class="statblock-container">
								<span v-if="false && lastClickedCreature" class="pin-notice">
									<span class="unpin-button" role="button"
										aria-label="unpin currently pinned creature"
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
</style>
