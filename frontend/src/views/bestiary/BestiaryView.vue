<script setup lang="ts">
import type { CreatureMetaData, CreatureWithStats } from "~/shared";
import { onMounted, reactive, ref, watch, useTemplateRef } from "vue";
import { useRules } from "vuetify/labs/rules";
import CopyCreature from "@/components/Bestiary/CopyCreature.vue";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import { useCollection } from "@/components/Bestiary/useCollection";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import Markdown from "@/components/Global/Markdown.vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { capitalizeFirstLetter } from "~/shared";
import CreatureList from "@/components/Bestiary/CreatureList.vue";

const {
	collection,
	items,
	isOwner,
	isEditor,
	bookmarked,
	toggleBookmark,
	getItem,
	getAllItems,
	createItem,
	createManyItems,
	deleteItem
} = useCollection("bestiary");

const { addToast, updateToast } = useToast();



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


const copyManager = useTemplateRef("copyManager")

const copyCurrentBestiary = async () => {
	if (!items.value || !collection.value)
		return;

	const creatures = await getAllFullCreatures();
	if (!creatures) {
		addToast("Failed to copy bestiary: no creatures found.", { color: "error" });
		return;
	}

	copyManager.value?.addManyCreatures(creatures, collection.value.name)
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
const isExpanded = ref(false);

watch(lastClickedCreature, (): void => {
	if (hasPinnedBefore.value)
		return;
	if (!hasPinnedBefore.value)
		hasPinnedBefore.value = true;

	addToast("Pinned creature to the view. Click unpin there to go back to hover behaviour.");
	void getUmami()?.track("Pinned creature");
});


const pinCreature = async (id: CreatureMetaData["id"]) => {
	if (lastClickedCreature.value?.id === id) {
		lastClickedCreature.value = null;
		return;
	}

	const fullCreature = await getFullCreature(id);
	if (!fullCreature) {
		addToast("Failed to pin creature: creature not found.", { color: "error" });
		return;
	}

	lastClickedCreature.value = fullCreature;
};

const hoverCreature = async (id: CreatureMetaData["id"]) => {
	lastHoveredCreature.value = await getFullCreature(id) ?? null;
};
</script>

<template>
	<div>
		<Breadcrumbs v-if="collection" :routes="[
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
		]">
			<CopyCreature :may-import="isOwner || isEditor" :current-creatures="items || []" can-copy-current-bestiary
				@import-creature="(creature) => createItem(creature, false)"
				@import-all-creatures="createManyItems(copyManager!.copiedCreatures.map(x => x.stats))"
				@copy-current-bestiary="copyCurrentBestiary" ref="copyManager" />


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
			<div v-if="collection">
				<v-row gap="72">
					<v-col cols="6">
						<v-sheet class="content-tile header-tile">
							<h2>{{ collection.name ? collection.name : "..." }}</h2>
							<Markdown class="description" :class="{ expanded: isExpanded }"
								:text="collection.description || 'No description set.'" tag="p" />
							<button v-if="collection.description.length > 0" v-tooltip="'Expand description'"
								class="expand-btn" aria-label="Expand description" @click="isExpanded = !isExpanded">
								{{ isExpanded ? "▲" : "▼" }}
							</button>
							<hr>
							<div class="footer" :class="{ 'three-wide': isOwner }">
								<UserBanner :id="collection.ownerId" />
								<div v-tooltip="collection.status">
									<span v-if="!store.isMobile" class="pr-2">{{
										capitalizeFirstLetter(collection.status) }}
									</span>
									<StatusIcon :icon="collection.status" />
								</div>
								<div>{{ items?.length }}<v-icon icon="$creature" size="20" /></div>
								<v-icon-btn v-if="!isOwner" @click="toggleBookmark" icon="mdi:star" size="20"
									:icon-color="bookmarked ? 'primary' : 'grey'" />
							</div>
						</v-sheet>
						<v-skeleton-loader v-if="items === null" type="heading, text, text" />
						<CreatureList v-else v-model="items" @hovered-creature="id => hoverCreature(id)"
							:pinned-creature="lastClickedCreature?.id || null" @pin-creature="id => pinCreature(id)"
							:collection="collection" :can-edit="false" @delete-creature="id => deleteItem(id)" />
					</v-col>
					<v-col cols="6">
						<div v-if="items && lastHoveredCreature" class="statblock-container">
							<span v-if="lastClickedCreature" class="pin-notice">
								<v-btn class="unpin-button" variant="text" density="compact" append-icon="mdi:pin-off"
									@click="lastClickedCreature = null"><b>unpin</b></v-btn>
							</span>
							<Transition name="fade" mode="out-in">
								<StatblockRenderer
									:key="lastClickedCreature?.stats.description.name || lastHoveredCreature.stats.description.name"
									:data="lastClickedCreature?.stats || lastHoveredCreature.stats" />
							</Transition>
						</div>
						<div v-else class="statblock-container">
							<div class="no-creature-text">
								<p>Hover or click on a creature to see its statblock</p>
							</div>
						</div>
					</v-col>
				</v-row>

			</div>
		</div>
	</div>
</template>

<style lang="less">
.create-tile {
	padding-top: 1rem;
	text-align: center;
	text-decoration: underline;

	span {
		cursor: pointer;
	}
}

.header-tile {
	background-color: rgb(var(--v-theme-surface-light));
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


.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.fade-enter-active {
	transition: all 0.1s ease-out;
}

.fade-leave-active {
	transition: all 0.1s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
	opacity: 0;
}

.warning {
	color: rgb(var(--v-theme-error));
	margin-top: 0.5rem;
}
</style>
