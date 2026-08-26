<script setup lang="ts">
import type { CreatureWithStats, Statblock } from "~/shared";
import { refDebounced, useLocalStorage } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import CopyCreature from "@/components/Bestiary/CopyCreature.vue";
import CreatureListItem from "@/components/Bestiary/CreatureListItem.vue";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import { useCollection } from "@/components/Bestiary/useCollection";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import CRInput from "@/components/FormInputs/CRInput.vue";
import Markdown from "@/components/Global/Markdown.vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { creatureTypes } from "@/utils/constants";
import { useFetch } from "@/utils/utils";

const {
	collection,
	items,
	isOwner,
	isEditor,
	bookmarked,
	getCollection,
	toggleBookmark,
	createItem,
	createManyItems,
	deleteItem
} = useCollection("bestiary");

const { addToast, updateToast, removeToast } = useToast();
const $router = useRouter();

onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	await getCollection();
	if (collection.value && (isOwner.value || isEditor.value))
		$router.push(`/bestiary/edit/${collection.value.id}`);
	removeToast(toastId);

	if (collection.value?.name)
		document.title = `${collection.value?.name.substring(0, 16)} | Bestiary Builder`;
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

const sortCreatures = () => {
	if (!items.value)
		return;
	if (sortMode.value === "Custom") {
		// Do nothing, order as recieved
		return items.value;
	}
	if (sortMode.value === "Alphabetically") {
		items.value.sort((a, b) => {
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
		items.value.sort((a, b) => {
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
		items.value.sort((a, b) => {
			return b.stats.description.cr - a.stats.description.cr;
		});
	}
	else if (sortMode.value === "CR Ascending") {
		items.value.sort((a, b) => {
			return a.stats.description.cr - b.stats.description.cr;
		});
	}

	return items.value;
};

function filterCreature(data: CreatureWithStats) {
	const filterChecks: boolean[] = [];
	if (searchTextDebounced.value !== "")
		filterChecks.push(data.stats.description.name.toLowerCase().includes(searchTextDebounced.value.toLowerCase().trim()));

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
	if (asFile) {
		const file = new File(
			[
				JSON.stringify(
					items.value?.map(obj => obj.stats),
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
				items.value?.map(obj => obj.stats),
				null,
				2
			)
		);
		addToast("Exported this bestiary to your clipboard.");
		void getUmami()?.track("Export bestiary to clipboard");
	}
}

type CopiedCreature = CreatureWithStats & { bestiaryName: string };
const copiedCreatures = useLocalStorage<CopiedCreature[]>("copiedCreatures", []);

const copyCurrentBestiary = () => {
	if (!items.value || !collection.value)
		return;
	const toAdd: CopiedCreature[] = [];
	for (const creature of items.value)
		toAdd.push({ ...creature, bestiaryName: collection.value.name });

	copiedCreatures.value = copiedCreatures.value.concat(toAdd);
	addToast("Copied current Bestiary");
	void getUmami()?.track("Copy bestiary");
};

// misc
const lastHoveredCreature = ref<Statblock | null>(null);
const lastClickedCreature = ref<Statblock | null>(null);
const hasPinnedBefore = ref(false);
const isExpanded = ref(false);

watch(lastClickedCreature, (): void => {
	if (hasPinnedBefore.value)
		return;
	if (!hasPinnedBefore.value)
		hasPinnedBefore.value = true;

	addToast("Pinned creature to the view. Click unpin there to go back to hover behaviour.");
	void getUmami()?.track("Pinned creature");
});

const pinCreature = (creature: Statblock) => {
	if (creature === lastClickedCreature.value) {
		lastClickedCreature.value = null;
	}
	else {
		lastClickedCreature.value = creature;
	}
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
			<CopyCreature
				:may-import="false" :current-creatures="items || []" can-copy-current-bestiary
				@import-creature="(creature) => createItem(creature, false)"
				@import-all-creatures="createManyItems(copiedCreatures.map(x => x.stats))"
				@copy-current-bestiary="copyCurrentBestiary"
			/>

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

			<DropdownMenu>
				<template #activator="{ props }">
					<v-icon-btn
						v-tooltip="'Export bestiary'" text="Export Bestiary" icon="mdi:export" size="24"
						v-bind="props"
					/>
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
					<div class="tile-container list-tiles">
						<template v-for="element in sortCreatures()">
							<CreatureListItem
								v-if="filterCreature(element)" :id="element.id" :data="element.stats"
								:can-edit="isOwner || isEditor" :is-pinned="lastClickedCreature === element.stats"
								@mouseover="lastHoveredCreature = element.stats" @delete-creature="(id) => deleteItem(id)"
								@pin-creature="pinCreature(element.stats)"
								@copy-creature="copiedCreatures.push({ ...element, bestiaryName: collection.name }); addToast('Copied Successfully!')"
							/>
						</template>
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
							:key="lastClickedCreature?.description.name || lastHoveredCreature.description.name"
							:data="lastClickedCreature || lastHoveredCreature" is2024
							statblock-design="BestiaryBuilder"
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
		color: rgb(--v-theme-primary);
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
