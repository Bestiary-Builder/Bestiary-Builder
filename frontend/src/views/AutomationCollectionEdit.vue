<script setup lang="ts">
import type { AutomationWithType } from "~/shared";
import { refDebounced, useLocalStorage } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import Draggable from "vuedraggable";
import { useRules } from "vuetify/labs/rules";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import CRInput from "@/components/FormInputs/CRInput.vue";
import Markdown from "@/components/Global/Markdown.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { creatureTypes } from "@/utils/constants";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { useCollection } from "@/components/Bestiary/useCollection";

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
	createItem,
	createManyItems,
	deleteItem
} = useCollection("automations")

const { addToast, updateToast, removeToast } = useToast()
const rules = useRules();

const srdCreatures = ref<string[]>([]);
onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true })
	await getCollection()
	removeToast(toastId)
	if (collection.value?.name)
		document.title = `${collection.value?.name.substring(0, 16)} | Bestiary Builder`;

	await useFetch<string[]>(`/api/srd-creatures/${store.user?.SRDVersion === "SRD_2024" ? "2024" : "2014"}/list`).then(({ success, data, error }) => {
		if (success)
			srdCreatures.value = data;

		if (error)
			addToast(error, { color: "error" })
	});
});

const searchText = ref("")
const searchTextDebounced = refDebounced(searchText, 500, { maxWait: 1000 })


const searchOptions = ref({
	tags: [] as string[],
	minCr: 0,
	maxCr: 30,
	env: "",
	faction: ""
});


const sortMode = useLocalStorage("sortModeForAutomations", "Alphabetically");

const sortCreatures = () => {
	if (!items.value)
		return;
	if (sortMode.value === "Custom") {
		// Do nothing, order as recieved
		return items.value;
	}
	if (sortMode.value === "Alphabetically") {
		items.value.sort((a, b) => {
			const nameA = a.name.toLowerCase();
			const nameB = b.name.toLowerCase();
			if (nameA < nameB)
				return -1;
			if (nameA > nameB)
				return 1;
			return 0;
		});
	}
	else if (sortMode.value === "Creature Type") {
		items.value.sort((a, b) => {
			const nameA = (Array.isArray(a.automation) ? a.automation[0]?.activation_type : a.automation?.activation_type) ?? 0;
			const nameB = (Array.isArray(b.automation) ? b.automation[0]?.activation_type : b.automation?.activation_type) ?? 0;
			if (nameA < nameB)
				return -1;
			if (nameA > nameB)
				return 1;
			return 0;
		});
	}


	return items.value;
};

function filterCreature(data: AutomationWithType) {
	const filterChecks: boolean[] = [];
	if (searchTextDebounced.value !== "")
		filterChecks.push(data.name.toLowerCase().includes(searchTextDebounced.value.toLowerCase().trim()));

	return filterChecks.every(_ => _);
}


const saveOrder = async () => {
	if (items.value && collection.value) {
		const orderIds = items.value.map(creature => creature.id);
		await useFetch(`/api/automation-collection/${collection.value.id}/creatures/order`, "POST", orderIds);
	}
};

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


// const importFields = reactive({
// 	critterDbId: "",
// 	bestiaryBuilderJson: ""
// })


// async function importCreaturesFromBestiaryBuilder() {
// 	let creaturesToImport;
// 	if (importFields.bestiaryBuilderJson.length === 0) {
// 		addToast("No JSON given", { color: "error" });
// 		return;
// 	}
// 	try {
// 		creaturesToImport = JSON.parse(importFields.bestiaryBuilderJson);
// 	}
// 	catch (e) {
// 		addToast("Something is wrong with the format of your JSON", { color: "error" });
// 		return;
// 	}

// 	if (!Array.isArray(creaturesToImport))
// 		creaturesToImport = [creaturesToImport];

// 	addToast("Importing creatures has started. This may take a while.");
// 	const { success, data, error } = await useFetch<{ error?: string; ignoredCreatures: { creature: string; error: string }[] }>(`/api/bestiary/${collection.value?.id.toString()}/addcreatures`, "POST", creaturesToImport);

// 	if (!success) {
// 		notices.value = {};
// 		addToast(error, { color: "error" });
// 	}
// 	else if (data.error) {
// 		addToast("The import was completed with errors.", { color: "error" });
// 		notices.value.Errors = data.error;
// 		for (const error of data.ignoredCreatures)
// 			notices.value[error.creature] = error.error;
// 	}
// 	else {
// 		addToast("Importing has finished!", { color: "success" });
// 		void getUmami()?.track("Import bestiary from BestiaryBuilder");
// 	}

// 	await getCollection();
// }



// draggable stuff
const getDraggableKey = (item: any) => {
	return item;
};

// misc
const editorToAdd = ref("");
const showWarning = ref(false);
const isExpanded = ref(false);




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
			<DropdownMenu v-if="isEditor || isOwner">
				<template #activator="{ props }">
					<v-icon-btn text="Create creature" icon="mdi:plus" size="24" v-bind="props" class="inverted"
						v-tooltip="'Create creature'" />
				</template>
				<v-card min-width="300" class="text-center pa-4" title="Create automation">
					<v-card-actions class="d-flex flex-column align-center justify-center">
						<v-btn size="x-large" @click="createItem({ name: 'my new name' })">
							From scratch
						</v-btn>
						<div class="d-flex align-center my-4 w-100">
							<v-divider class="flex-grow-1" />
							<span class="mx-4 text-medium-emphasis">OR</span>
							<v-divider class="flex-grow-1" />
						</div>

					</v-card-actions>
				</v-card>
			</DropdownMenu>

			<v-dialog v-if="isOwner" max-width="950">
				<template #activator="{ props }">
					<v-icon-btn text="Collection Settings" icon="mdi:cog" size="24" v-bind="props"
						v-tooltip="'Settings'" />
				</template>

				<template #default="{ isActive }">
					<v-card title="Collection Settings">
						<v-sheet class="pa-4" max-width="1800" rounded="lg" width="100%">
							<v-form>
								<div class="grid-two">
									<v-text-field v-model="collection.name" label="Name"
										:maxlength="store.limits?.nameLength" :min-length="store.limits?.nameMin"
										:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]"
										class="mb-4" />
									<v-text-field v-model="collection.image" label="Image" class="mb-4" />
								</div>

								<v-textarea v-model="collection.description"
									:max-length="store.limits?.descriptionLength"
									:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]"
									label="Description" class="mb-4" hint="Supports Markdown" persistent-hint counter />
								<div class="grid-two">
									<div>
										<v-select v-model="collection.status" label="Status"
											:items="[{ value: 'private', title: 'Private' }, { value: 'unlisted', title: 'Unlisted' }, { value: 'public', title: 'Public' }]" />
									</div>
									<v-select v-model="collection.tags" multiple :items="store.tags || []" label="Tags"
										chips closable-chips />
								</div>

								<div class="editor-block">
									<h3 style="margin-bottom: .5rem">
										Editors
									</h3>
									<small>
										Editors can add, edit, and remove items. <br>
										Editors cannot edit the Collection itself. <br>
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
									<div class="grid-two">
										<v-text-field v-model="editorToAdd" inputmode="numeric" label="Discord user ID"
											:rules="[rules.integer('This must be a numeric Discord User ID.')]"
											pattern="[0-9]*" />
										<v-btn class="mz-auto" @click="addEditor(editorToAdd)">
											Add
										</v-btn>
									</div>
								</div>
								<p v-if="showWarning" class="warning">
									By changing the Collection status to public I confirm that I am the copyright holder
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
							<v-btn text="Save changes" color="green" size="large" @click="updateCollection" />
							<v-btn text="Cancel" size="large" @click="isActive.value = false" />
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>
			<DropdownMenu>
				<template #activator="{ props }">
					<v-icon-btn text="Search automations" icon="mdi:tag" size="24" v-bind="props"
						v-tooltip="'Search automations'" />
				</template>
				<v-card min-width="300" class="text-center pb-2 pa-4" title="Search collection">
					<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
						<v-select v-model="sortMode"
							:items="['Custom', 'Alphabetically', 'CR Ascending', 'CR Descending', 'Creature Type']"
							label="Collection sort type" width="100%" />
						<div class="grid-two">
							<v-text-field v-model="searchText" label="Name" width="200" />
							<v-select v-model="searchOptions.tags" :items="creatureTypes" label="Creature type" multiple
								chips closable-chips width="200" />
							<CRInput v-model="searchOptions.minCr" label="Minimum CR" />
							<CRInput v-model="searchOptions.maxCr" label="Maximum CR" />
							<v-text-field v-model="searchOptions.faction" label="Faction" width="200" />
							<v-text-field v-model="searchOptions.env" label="Environment" width="200" />
						</div>
					</v-card-actions>
				</v-card>
			</DropdownMenu>

			<v-dialog v-if="isOwner" max-width="750">
				<template #activator="{ props }">
					<v-icon-btn text="Import automations" icon="mdi:import" size="24" v-bind="props"
						v-tooltip="'Import automations'" />
				</template>

				<template #default="{ isActive }">
					<v-card title="Import Collection">
						<v-sheet class="pa-4" max-width="1800" rounded="lg" width="100%">
							<div class="grid-two">

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
					<v-icon-btn text="Export collection" icon="mdi:export" size="24" v-bind="props" />
				</template>
				<v-card min-width="300" class="text-center pb-2 pa-4" title="Export collection">
					<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
						<v-btn class="w-100" color="green" size="large" @click="exportCollection(false)">
							Clipboard
						</v-btn>
						<v-btn class="w-100" color="green" size="large" @click="exportCollection(true)">
							File
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
						<Markdown class="description" :class="{ expanded: isExpanded }"
							:text="collection.description || 'No description set.'" tag="p" />
						<button v-if="collection.description.length > 0" v-tooltip="'Expand description'"
							class="expand-btn" aria-label="Expand description" @click="isExpanded = !isExpanded">
							{{ isExpanded ? "▲" : "▼" }}
						</button>
						<hr>
						<div class="footer" :class="{ 'three-wide': isOwner }">
							<UserBanner :id="collection.ownerId" />
							<div v-tooltip.left="collection.status">
								<StatusIcon :icon="collection.status" />
							</div>
							<div>{{ items?.length }}<v-icon icon="mdi:paw" size="20" /></div>
							<div v-if="!isOwner" role="button" aria-label="Toggle bookmark status" class="bookmark"
								@click.prevent="toggleBookmark">
								<span v-if="bookmarked" v-tooltip="'Unbookmark this collection'"
									class="bookmark-enabled"><v-icon size="20" icon="mdi-star" /></span>
								<span v-else v-tooltip="'Bookmark this collection'" class="bookmark-disabled"><v-icon
										size="20" icon="mdi-star" /></span>
							</div>
						</div>
					</div>
					<v-skeleton-loader type="heading, text, text" v-if="items === null" />
					<Draggable v-else :list="sortCreatures()" :animation="500" class="tile-container list-tiles"
						:item-key="getDraggableKey" :disabled="sortMode !== 'Custom'" @change="saveOrder">
						<template #item="{ element }">
							<div>
								{{ element.name }}
							</div>
						</template>
					</Draggable>

					<div v-if="isOwner || isEditor" class="create-tile">
						<DropdownMenu>
							<template #activator="{ props }">
								<v-btn v-bind="props" variant="plain">
									Add action
								</v-btn>
							</template>
							<v-card min-width="300" class="text-center pa-4" title="Create automation">
								<v-card-actions class="d-flex flex-column align-center justify-center">
									<v-btn size="x-large" @click="createItem({ name: 'My Action' })">
										From scratch
									</v-btn>
								</v-card-actions>
							</v-card>
						</DropdownMenu>
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
						color: orangered;
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
	background-color: orangered;
	cursor: unset;
	margin: 0 0rem 1rem;
	padding: 1rem;
	border-radius: 2px;
	color: black;

	h2 {
		text-align: center;
		text-wrap: nowrap;
		overflow: hidden;
		max-width: 90vw;
		color: black;
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
