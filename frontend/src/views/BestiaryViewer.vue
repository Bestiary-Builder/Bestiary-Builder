<template>
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
			<button @click="createCreature()" v-tooltip="'Create creature!'" class="inverted" v-if="isOwner || isEditor" aria-label="Create creature">
				<font-awesome-icon :icon="['fas', 'plus']" />
			</button>
			<button v-if="lastClickedCreature" @click="lastClickedCreature = null" v-tooltip="'Unpin currently pinned creature!'" style="rotate: 45deg" aria-label="Unpin currently pinned creature">
				<font-awesome-icon :icon="['fas', 'thumbtack']" />
			</button>
			<button @click="showEditorModal = true" v-tooltip="'Edit bestiary!'" v-if="isOwner" aria-label="Edit bestiary">
				<font-awesome-icon :icon="['fas', 'pen-to-square']" />
			</button>
			<VDropdown :distance="6" :positioning-disabled="store.isMobile">
				<button v-tooltip="'Filter bestiary'" aria-label="Filter bestiary">
					<font-awesome-icon :icon="['fas', 'tag']" />
				</button>
				<template #popper>
					<div class="v-popper__custom-menu">
						<LabelledComponent title="Sort creatures" for="sortcreatures">
							<select v-model="sortMode" name="Sort bestiary by attribute" id="sortcreatures">
								<option>Alphabetically</option>
								<option>CR Ascending</option>
								<option>CR Descending</option>
								<option>Creature Type</option>
							</select>
						</LabelledComponent>
						<LabelledComponent title="Filter" for="searchtext">
							<input type="text" v-model="searchText" id="searchtext" placeholder="Search by name..." />
						</LabelledComponent>
						<LabelledComponent title="Creature type" for="creatureType">
							<div style="min-width: 300px">
								<v-select
									placeholder="Search by creature type"
									v-model="searchOptions.tags"
									multiple
									:options="creatureTypes"
									inputId="creaturetype"
									:taggable="true"
								/>
							</div>
						</LabelledComponent>
						<div class="two-wide">
							<div class="flow-vertically">
								<label class="editor-field__title" for="challengerating"><span class="text"> Minimum CR</span></label>
								<div class="quantity">
									<input type="number" v-model="searchOptions.minCr" min="0" max="30" inputmode="numeric" id="minimumcr" />
									<div class="quantity-nav">
										<div class="quantity-button quantity-up" @click="changeCR(true, true)" aria-label="Increase minimum CR">+</div>
										<div class="quantity-button quantity-down" @click="changeCR(false, true)" aria-label="Decrease maximum CR">-</div>
									</div>
								</div>
							</div>
							<div class="flow-vertically">
								<label class="editor-field__title" for="challengerating"><span class="text"> Maximum CR</span></label>
								<div class="quantity">
									<input type="number" v-model="searchOptions.maxCr" min="0" max="30" inputmode="numeric" id="maximumcr" />
									<div class="quantity-nav">
										<div class="quantity-button quantity-up" @click="changeCR(true, false)" aria-label="Increase minimum CR">+</div>
										<div class="quantity-button quantity-down" @click="changeCR(false, false)" aria-label="Decrease maximum CR">-</div>
									</div>
								</div>
							</div>
						</div>
						<span class="warning" v-if="searchOptions.minCr > searchOptions.maxCr" style="text-align: center"> Min is bigger than max </span>
						<LabelledComponent title="Environment" for="environment">
							<input type="text" v-model="searchEnv" id="environment" placeholder="Search by name..." />
						</LabelledComponent>
						<LabelledComponent title="Faction" for="faction">
							<input type="text" v-model="searchFaction" id="faction" placeholder="Search by name..." />
						</LabelledComponent>
					</div>
				</template>
			</VDropdown>

			<button @click="showImportModal = true" v-tooltip="'Import bestiary'" v-if="isOwner" aria-label="Import bestiary">
				<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
			</button>

			<VDropdown :distance="6" :positioning-disabled="store.isMobile">
				<button v-tooltip="'Export bestiary'" aria-label="Export bestiary">
					<font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
				</button>
				<template #popper>
					<div class="v-popper__custom-menu">
						<span>
							Export this Bestiary as JSON<br />
							to clipboard or to file
						</span>
						<button class="btn confirm" v-close-popper @click="exportBestiary(false)">Clipboard</button>
						<button class="btn confirm" v-close-popper @click="exportBestiary(true)">File</button>
					</div>
				</template>
			</VDropdown>
		</Breadcrumbs>
		<div class="content">
			<div class="bestiary" v-if="bestiary">
				<div class="left-side-container">
					<div class="content-tile header-tile">
						<h2>{{ bestiary.name ? bestiary.name : "..." }}</h2>
						<Markdown class="description" :class="{expanded: isExpanded}" :text="bestiary.description || 'No description set.'" tag="p" />
						<button v-if="bestiary.description.length > 0" class="expand-btn" v-tooltip="'Expand description'" @click="isExpanded = !isExpanded" aria-label="Expand description">{{ isExpanded ? "▲" : "▼" }}</button>
						<hr />
						<div class="footer" :class="{'three-wide': isOwner}">
							<UserBanner :id="bestiary.owner" />
							<div v-tooltip.left="bestiary.status"><StatusIcon :icon="bestiary.status" /></div>
							<div>{{ bestiary.creatures.length }}<font-awesome-icon :icon="['fas', 'skull']" /></div>
							<div role="button" aria-label="Toggle bookmark status" @click.prevent="toggleBookmark" class="bookmark" v-if="!isOwner">
								<span v-if="bookmarked" v-tooltip="'Unbookmark this bestiary'" class="bookmark-enabled"><font-awesome-icon :icon="['fas', 'star']" /></span>
								<span v-else v-tooltip="'Bookmark this bestiary'" class="bookmark-disabled"><font-awesome-icon :icon="['fas', 'star']" /></span>
							</div>
						</div>
					</div>
					<div class="tile-container list-tiles">
						<TransitionGroup name="slide-fade">
							<div v-for="creature in searchCreatures" :key="creature._id?.toString()" class="content-tile creature-tile" @mouseover="lastHoveredCreature = creature.stats" @click="lastClickedCreature = creature.stats">
								<div class="left-side">
									<h3>{{ creature.stats?.description?.name }}</h3>
									<span>{{ creature.stats?.core?.size }} {{ creature.stats?.core?.race }}{{ creature.stats?.description?.alignment ? ", " + creature.stats?.description?.alignment : "" }}</span>
								</div>
								<div class="right-side">
									<VDropdown :distance="6" v-if="isOwner || isEditor" :positioning-disabled="store.isMobile">
										<button v-tooltip="'Delete creature'" @click.stop.prevent="" :aria-label="`Delete ${creature.stats.description.name}`">
											<font-awesome-icon :icon="['fas', 'trash']" />
										</button>
										<template #popper>
											<div class="v-popper__custom-menu">
												<span> Are you sure you want to delete this creature? </span>
												<button class="btn danger" @click.stop="deleteCreature(creature)" v-close-popper>Confirm</button>
											</div>
										</template>
									</VDropdown>
									<button v-tooltip="`${isOwner || isEditor ? 'Edit' : 'View'} creature`" :aria-label="`${isOwner || isEditor ? 'Edit' : 'View'} ${creature.stats.description.name}`" class="edit-creature" @click.stop="() => {}">
										<RouterLink class="creature" :to="'/statblock-editor/' + creature._id" :aria-label="`${isOwner || isEditor ? 'Edit' : 'View'} creature`">
											<font-awesome-icon :icon="['fas', 'pen-to-square']" v-if="isOwner || isEditor" />
											<font-awesome-icon :icon="['fas', 'eye']" v-else />
										</RouterLink>
									</button>
									<span class="cr"> CR {{ crAsString(creature.stats.description.cr) }}</span>
								</div>
							</div>
						</TransitionGroup>
						<div class="create-tile" v-if="isOwner || isEditor">
							<span role="button" class="create-text" @click="createCreature()">Add Creature</span>
						</div>
					</div>
				</div>
				<div class="statblock-container" v-if="creatures && lastHoveredCreature">
					<span v-if="lastClickedCreature" class="pin-notice">
						<span class="unpin-button" @click="lastClickedCreature = null" role="button" aria-label="unpin currently pinned creature"><b>unpin</b></span
						>📌
					</span>
					<Transition name="fade" mode="out-in">
						<StatblockRenderer :data="lastClickedCreature || lastHoveredCreature" :key="lastClickedCreature?.description.name || lastHoveredCreature.description.name" />
					</Transition>
				</div>
				<div class="statblock-container" v-else>
					<div class="no-creature-text">
						<p>Hover or click on a creature to see its statblock</p>
					</div>
				</div>
			</div>
		</div>
		<Modal :show="showImportModal" @close="showImportModal = false" v-if="bestiary && isOwner">
			<template #header>Import Creatures</template>
			<template #body>
				<LabelledComponent title="CritterDB bestiary link" for="critterlink">
					<p>Insert a link to a critterDB bestiary to import all its creatures.</p>
					<p>Make sure the bestiary is public or has link sharing enabled.</p>
					<div class="flow-horizontally">
						<input type="text" v-model="critterDbId" id="critterlink" placeholder="CritterDB bestiary link" />
						<button class="btn confirm" @click.prevent="importBestiaryFromCritterDB">Import</button>
					</div>
				</LabelledComponent>

				<hr />

				<LabelledComponent title="Bestiary Builder JSON" for="bestiaryjson">
					<p>Insert the JSON as text gotten from clicking export on another bestiary within Bestiary Builder.</p>
					<div class="flow-horizontally">
						<input type="text" v-model="bestiaryBuilderJson" id="bestiaryjson" placeholder="Bestiary builder JSON" />
						<button class="btn confirm" @click.prevent="importCreaturesFromBestiaryBuilder">Import</button>
					</div>
				</LabelledComponent>
			</template>
		</Modal>

		<Modal :show="showEditorModal" @close="showEditorModal = false" v-if="bestiary && isOwner">
			<template #header>Edit Bestiary</template>
			<template #body>
				<LabelledComponent title="Bestiary name" for="bestiaryname">
					<input type="text" v-model="bestiary.name" :minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength" id="bestiaryname" />
				</LabelledComponent>
				<LabelledComponent title="Description" for="description">
					<p>Supports markdown</p>
					<textarea v-model="bestiary.description" :maxlength="store.limits?.descriptionLength" id="description" />
				</LabelledComponent>
				<div class="two-wide" v-if="isOwner">
					<LabelledComponent title="Status" for="status">
						<v-select v-model="bestiary.status" :options="['public', 'unlisted', 'private']" inputId="status" />
					</LabelledComponent>
					<LabelledComponent title="Tags" for="tags">
						<v-select placeholder="Select Tags" v-model="bestiary.tags" multiple :options="store.tags" inputId="tags" />
					</LabelledComponent>
				</div>
				<div class="editor-block">
					<h3>Editors</h3>
					<p v-if="isOwner">Editors can add, edit, and remove creatures. They can edit the name of the bestiary and its description. Editors cannot change the status of the bestiary or delete the bestiary. Editors cannot add other editors. The owner can remove editors at any time.</p>
					<div class="editor-container">
						<div v-for="editor in editors" class="editor-list">
							<p>
								<UserBanner :id="editor._id" />
								<span v-if="isOwner" role="button" @click="removeEditor(editor._id)" class="delete-creature"> <span>🗑️</span> </span>
							</p>
						</div>
					</div>
					<LabelledComponent title="Add editor" for="addeditor">
						<div class="button-container">
							<input type="text" v-model="editorToAdd" inputmode="numeric" placeholder="Discord user ID" id="addeditor" />
							<button class="btn" @click="addEditor()">Add</button>
						</div>
					</LabelledComponent>
				</div>
				<p class="warning" v-if="showWarning">
					By changing the bestiary status to public I confirm that I am the copyright holder of the content within, or that I have permission from the copyright holder to share this content. I hereby agree to the <RouterLink to="../content-policy">Content Policy</RouterLink> and agree to
					be fully liable for the content within. I affirm that the content does not include any official non-free D&D content. Bestiaries that breach these terms may have their status changed to private or be outright removed, and may result in a ban if the content breaches our content
					policy.
				</p>
			</template>
			<template #footer>
				<button class="btn confirm" @click.prevent="updateBestiary">Save changes</button>
			</template>
		</Modal>
	</div>
</template>

<script lang="ts">
import UserBanner from "@/components/UserBanner.vue";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import StatusIcon from "@/components/StatusIcon.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import LabelledNumberInput from "@/components/LabelledNumberInput.vue";
import Modal from "@/components/Modal.vue";
import StatblockRenderer from "@/components/StatblockRenderer.vue";

import {RouterLink} from "vue-router";
import {defineComponent, ref} from "vue";
import {refDebounced} from "@vueuse/core";

import {defaultStatblock, crAsString} from "~/shared";
import type {User, Bestiary, Creature, Statblock} from "~/shared";
import {useFetch} from "@/utils/utils";
import {toast} from "@/utils/app/toast";
import {store} from "@/utils/store";
import Markdown from "@/components/Markdown.vue";
import { creatureTypes } from "@/utils/constants";
import { $loading } from "@/utils/app/loading";
export default defineComponent({
	data() {
		return {
			bestiary: null as Bestiary | null,
			savedBestiary: null as Bestiary | null,
			creatures: null as Creature[] | null,
			searchCreatureList: [] as Creature[] | null,
			editors: [] as User[],
			lastHoveredCreature: null as null | Statblock,
			lastClickedCreature: null as null | Statblock,
			hasPinnedBefore: false as boolean,
			bookmarked: false as boolean,
			isOwner: false,
			isEditor: false,
			editorToAdd: "" as string,
			showWarning: false as boolean,
			critterDbId: "" as string,
			bestiaryBuilderJson: "" as string,
			searchOptions: {
				text: "",
				tags: [] as string[],
				minCr: 0,
				maxCr: 30,
				env: "",
				faction: ""
			},
			sortMode: "Alphabetically",
			isExpanded: false,
			showEditorModal: false,
			showImportModal: false,
			selectedCreature: null as Creature | null,
			store,
			creatureTypes
		};
	},
	components: {
		UserBanner,
		StatblockRenderer,
		Breadcrumbs,
		StatusIcon,
		LabelledComponent,
		LabelledNumberInput,
		Modal,
		Markdown
	},
	async beforeMount() {
		const loader = $loading.show();
		await this.getBestiary();
		loader.hide();

		if (this?.bestiary?.name) {
			document.title = `${this?.bestiary?.name.substring(0, 16)} | Bestiary Builder`;
		}
	},
	setup() {
		const searchText = ref("");
		const debouncedSearch = refDebounced(searchText, 500);

		const searchEnv = ref("");
		const debouncedEnv = refDebounced(searchEnv, 500);

		const searchFaction = ref("");
		const debouncedFaction = refDebounced(searchFaction, 500);

		return {
			searchText,
			debouncedSearch,
			searchEnv,
			debouncedEnv,
			searchFaction,
			debouncedFaction
		};
	},
	computed: {
		searchCreatures(): Creature[] | null {
			if (this.creatures == null) return null;
			const loader = $loading.show();

			let response = this.creatures?.filter(this.filterCreature) || null;

			if (this.sortMode == "Alphabetically") {
				response.sort((a, b) => {
					const nameA = a.stats.description.name.toLowerCase();
					const nameB = b.stats.description.name.toLowerCase();
					if (nameA < nameB) return -1;
					if (nameA > nameB) return 1;
					return 0;
				});
			} else if (this.sortMode == "Creature Type") {
				response.sort((a, b) => {
					const nameA = a.stats.core.race.toLowerCase();
					const nameB = b.stats.core.race.toLowerCase();
					if (nameA < nameB) return -1;
					if (nameA > nameB) return 1;
					return 0;
				});
			} else if (this.sortMode == "CR Descending") {
				response.sort((a, b) => {
					return b.stats.description.cr - a.stats.description.cr;
				});
			} else if (this.sortMode == "CR Ascending") {
				response.sort((a, b) => {
					return a.stats.description.cr - b.stats.description.cr;
				});
			}
			loader.hide();

			return response;
		}
	},
	methods: {
		filterCreature(data: Creature) {
			let filterChecks: boolean[] = [];
			if (this.searchOptions.text != "") {
				filterChecks.push(data.stats.description.name.toLowerCase().includes(this.searchOptions.text.toLowerCase().trim()));
			}

			if (this.searchOptions.env != "") {
				filterChecks.push(data.stats.description.environment.toLowerCase().includes(this.searchOptions.env.toLowerCase().trim()));
			}

			if (this.searchOptions.faction != "") {
				filterChecks.push(data.stats.description.faction.toLowerCase().includes(this.searchOptions.faction.toLowerCase().trim()));
			}

			if (this.searchOptions.tags.length > 0) {
				filterChecks.push(this.searchOptions.tags.some((item) => data.stats.core.race.toLowerCase().includes(item.toLowerCase())));
			}

			if (this.searchOptions.minCr != 0 || this.searchOptions.maxCr != 30) {
				filterChecks.push(this.searchOptions.minCr <= data.stats.description.cr && data.stats.description.cr <= this.searchOptions.maxCr);
			}
			return filterChecks.every((_) => _);
		},
		exportBestiary(asFile: boolean): void {
			if (asFile) {
				const file = new File(
					[
						JSON.stringify(
							this.creatures?.map((obj) => obj.stats),
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
			} else {
				navigator.clipboard.writeText(
					JSON.stringify(
						this.creatures?.map((obj) => obj.stats),
						null,
						2
					)
				);
				toast.info("Exported this bestiary to your clipboard.");
			}
		},
		async importBestiaryFromCritterDB() {
			let link = this.critterDbId.trim();
			let isPublic = link.includes("publishedbestiary");
			if (!link.startsWith("https://critterdb.com") && !link.startsWith("critterdb.com")) {
				toast.error("Could not recognize link as a link to a CritterDB bestiary");
				return;
			}
			let linkEls = link.split("/");
			link = linkEls[linkEls.length - 1];
			let hasFailed = false;
			toast.info("Fetching bestiary data has started. This may take a while.");
			let loader = $loading.show();
			const {success, data, error} = await useFetch<{
				data: {
					creatures: Statblock[];
					name: string;
					description: string;
				};
				failedCreatures: string[];
			}>(`/api/critterdb/${link}/${isPublic}`);
			if (success) {
				if (data.failedCreatures.length > 0) toast.error(`Failed to parse ${data.failedCreatures.length} creatures.\nFailed creatures: "${data.failedCreatures.join(",")}"`);
			} else {
				toast.error(error);
				loader.hide();
				return;
			}
			toast.info("Saving creatures has started. This may take a while.");
			const {success: cSuccess, data: creatureData, error: cError} = await useFetch<{error?: string}>("/api/bestiary/" + this.bestiary?._id + "/addcreatures", "POST", data.data.creatures);
			if (!cSuccess) toast.error(cError);
			else if (creatureData.error) toast.error(creatureData.error);
			await this.getBestiary();
			loader.hide();
			toast.success("Importing has finished!");
			this.showImportModal = false;
		},
		async importCreaturesFromBestiaryBuilder() {
			let creatures;
			const loader = $loading.show();
			try {
				creatures = JSON.parse(this.bestiaryBuilderJson);
			} catch (e) {
				console.error(e);
				toast.error("Something is wrong with the format of your JSON");
				loader.hide();
				return;
			}
			toast.info("Importing creatures has started. This may take a while.");
			const {success, data, error} = await useFetch<{error?: string}>("/api/bestiary/" + this.bestiary?._id + "/addcreatures", "POST", creatures);
			if (!success) toast.error(error);
			else if (data.error) toast.error(data.error);
			else toast.success("Importing has finished!");

			await this.getBestiary();
			loader.hide();
			this.showImportModal = false;
		},
		async createCreature(stats = defaultStatblock, shouldRefresh = true, shouldHaveLoader = true) {
			let loader;
			if (shouldHaveLoader) {
				loader = $loading.show();
			}
			//Replace for actual creation data:
			let data = {
				stats: stats,
				bestiary: this.bestiary?._id
			} as Creature;
			//Send data to server
			const {success, data: resultData, error} = await useFetch<Creature>("/api/creature/add", "POST", data);
			if (success) {
				let data = resultData as Creature;
				this.$router.push(`../statblock-editor/${data._id}`);
			} else {
				toast.error(error);
			}
			if (shouldRefresh) {
				const tileContainer = document.getElementsByClassName("tile-container")[0] as HTMLDivElement;
				tileContainer.scrollTop = tileContainer.scrollHeight;
			}
			if (shouldHaveLoader && loader) loader.hide();
		},
		async deleteCreature(creature: Creature) {
			const loader = $loading.show();
			const {success, error} = await useFetch(`/api/creature/${creature._id}/delete`);
			if (success) {
				toast.success("Deleted creature succesfully");
				if (!this.bestiary) return;
				this.bestiary.creatures = this.bestiary.creatures.filter((c) => c != creature._id);
				this.creatures = this.creatures?.filter((c) => c._id != creature._id) ?? [];
			} else {
				toast.error(error);
			}
			loader.hide();
		},
		async addEditor() {
			if (!this.bestiary) return;
			let id = this.editorToAdd;
			const loader = $loading.show();
			const {success, error} = await useFetch(`/api/bestiary/${this.bestiary._id}/editors/add/${id}`);
			if (success) {
				toast.success("Added editor succesfully");
			} else {
				toast.error(error);
			}
			await this.getBestiary();
			loader.hide();
		},
		async removeEditor(id: string) {
			if (!this.bestiary) return;
			const loader = $loading.show();
			const {success, error} = await useFetch(`/api/bestiary/${this.bestiary._id}/editors/remove/${id}`);
			if (success) {
				toast.success("Removed editor succesfully");
			} else {
				toast.error(error);
			}
			await this.getBestiary();
			loader.hide();
		},
		async getBestiary() {
			//Get id
			let id = this.$route.params.id;
			//Request bestiary info
			const {success, data, error} = await useFetch<Bestiary>("/api/bestiary/" + id);
			if (!success) {
				this.bestiary = null;
				toast.error(error);
				return;
			}
			this.bestiary = data as Bestiary;
			this.savedBestiary = this.bestiary;
			this.isOwner = store.user?._id == this.bestiary.owner;
			this.isEditor = (this.bestiary?.editors ?? []).includes(store.user?._id ?? "");
			//Fetch creatures
			await useFetch<Creature[]>("/api/bestiary/" + this.bestiary._id + "/creatures").then(async (creatureResult) => {
				if (creatureResult.success) {
					this.creatures = creatureResult.data as Creature[];
				} else {
					this.creatures = null;
					toast.error(creatureResult.error);
				}
			});
			//Fetch editors
			this.editors = [] as User[];
			for (let editorId of this.bestiary?.editors ?? []) {
				await useFetch("/api/user/" + editorId).then((editorResult) => {
					if (editorResult.success) {
						this.editors.push(editorResult.data as User);
					} else {
						toast.error(editorResult.error);
					}
				});
			}
			//Bookmark state
			if (store.user) {
				await useFetch<{state: boolean}>(`/api/bestiary/${this.bestiary._id}/bookmark/get`).then(async (bookmarkResult) => {
					if (bookmarkResult.success) {
						this.bookmarked = (bookmarkResult.data as {state: boolean}).state;
					} else {
						this.bookmarked = false;
						toast.error(bookmarkResult.error);
					}
				});
			} else {
				this.bookmarked = false;
			}
		},
		async updateBestiary() {
			if (!this.bestiary) return;
			const loader = $loading.show();
			//Send to backend
			const {success, error} = await useFetch<Bestiary>(`/api/bestiary/${this.bestiary._id}/update`, "POST", this.bestiary);
			if (success) {
				toast.success("Saved bestiary");
				this.savedBestiary = this.bestiary;
				this.showEditorModal = false;
			} else {
				toast.error(error);
			}
			loader.hide();
		},
		async toggleBookmark() {
			if (!this.bestiary) return;
			const loader = $loading.show();
			const {success, data, error} = await useFetch<{state: boolean}>(`/api/bestiary/${this.bestiary._id}/bookmark/toggle`);
			if (success) {
				this.bookmarked = data.state;
				if (this.bookmarked) toast.success("Successfully bookmarked this bestiary!");
				else toast.success("Successfully unbookmarked this bestiary!");
			} else {
				this.bookmarked = false;
				toast.error(error);
			}
			loader.hide();
		},
		setSelectedCreature(creature: any) {
			this.lastHoveredCreature = creature;
		},
		changeCR(isIncrease: boolean, isMinimumOption: boolean): void {
			let cr;
			if (isMinimumOption) cr = this.searchOptions.minCr;
			else cr = this.searchOptions.maxCr;
			if (cr == 0 && isIncrease) cr = 0.125;
			else if (cr == 0.125 && isIncrease) cr = 0.25;
			else if (cr == 0.25 && isIncrease) cr = 0.5;
			else if (cr == 0.5 && isIncrease) cr = 1;
			else if (cr == 0.125 && !isIncrease) cr = 0;
			else if (cr == 0.25 && !isIncrease) cr = 0.125;
			else if (cr == 0.5 && !isIncrease) cr = 0.25;
			else if (cr == 1 && !isIncrease) cr = 0.5;
			else {
				if (isIncrease) cr = Math.min(30, cr + 1);
				else cr = Math.max(0, cr - 1);
			}
			if (isMinimumOption) this.searchOptions.minCr = cr;
			else this.searchOptions.maxCr = cr;
		},
		crAsString
	},
	watch: {
		lastClickedCreature(): void {
			if (this.hasPinnedBefore) return;
			if (!this.hasPinnedBefore) this.hasPinnedBefore = true;

			toast.info("Pinned creature to the view. Click unpin there to go back to hover behaviour.");
		},
		"bestiary.status"(newValue, oldValue): void {
			if (newValue == "private") this.showWarning = false;
			if (newValue == "public") this.showWarning = true;
		},
		"bestiary.name"(): void {
			document.title = `${this?.bestiary?.name.substring(0, 16)} | Bestiary Builder`;
		},
		debouncedSearch() {
			this.searchOptions.text = this.searchText;
		},
		debouncedEnv() {
			this.searchOptions.env = this.searchEnv;
		},
		debouncedFaction() {
			this.searchOptions.faction = this.searchFaction;
		}
	}
});
</script>

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
		box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
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
</style>
