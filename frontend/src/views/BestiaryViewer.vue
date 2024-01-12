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
			<VDropdown :distance="6" :positioning-disabled="isMobile">
				<button v-tooltip="'Filter bestiary'" aria-label="Filter bestiary">
					<font-awesome-icon :icon="['fas', 'tag']" />
				</button>
				<template #popper>
					<div class="v-popper__custom-menu">
						<LabelledComponent title="Sort creatures">
							<select v-model="sortMode" name="Sort bestiary by attribute" id="sortcreatures">
								<option>Alphabetically</option>
								<option>CR Ascending</option>
								<option>CR Descending</option>
								<option>Creature Type</option>
							</select>
						</LabelledComponent>
						<LabelledComponent title="Filter">
							<input type="text" v-model="searchText" id="searchtext" placeholder="Search by name..." />
						</LabelledComponent>
						<LabelledComponent title="Creature type">
							<div style="min-width: 300px;">
							<v-select placeholder="Search by creature type" v-model="searchOptions.tags" multiple :options="['Aberration', 'Beast', 'Celestial', 'Construct', 'Dragon', 'Elemental', 'Fey', 'Fiend', 'Giant', 'Humanoid', 'Monstrosity', 'Ooze', 'Plant', 'Undead']" inputId="taaaags"/>
						</div>
						</LabelledComponent>
						<div class="two-wide">
							<LabelledNumberInput v-model="searchOptions.minCr" :min="0" :max="30" title="Minimum CR" :step="1"/>
							<LabelledNumberInput v-model="searchOptions.maxCr" :min="0" :max="30" title="Maximum CR" :step="1"/>
						</div>
						<span class="warning" v-if="searchOptions.minCr > searchOptions.maxCr" style="text-align: center;">
							Min is bigger than max
						</span>
						<LabelledComponent title="Environment">
							<input type="text" v-model="searchEnv" id="environment" placeholder="Search by name..." />
						</LabelledComponent>						
						<LabelledComponent title="Faction">
							<input type="text" v-model="searchFaction" id="faction" placeholder="Search by name..." />
						</LabelledComponent>
					</div>
				</template>
			</VDropdown>

			<VDropdown :distance="6" :positioning-disabled="isMobile">
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
			<button @click="showImportModal = true" v-tooltip="'Import bestiary'" v-if="isOwner" aria-label="Import bestiary">
				<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
			</button>
	</Breadcrumbs>
	<div class="content">
		<div class="bestiary" v-if="bestiary">
			<div class="left-side-container">
				<div class="content-tile header-tile">
					<h2> {{ bestiary.name ? bestiary.name : "..." }} </h2>
					<p class="description" :class="{expanded: isExpanded}" v-html="md.render(bestiary.description || 'No description set.')"></p>
					<button v-if="bestiary.description.length > 0" class="expand-btn" v-tooltip="'Expand description'" @click="isExpanded = !isExpanded" aria-label="Expand description">{{ isExpanded ? "▲" : "▼" }}</button>
					<hr />
					<div class="footer" :class="{'three-wide': isOwner}">
						<UserBanner :id="bestiary.owner" />
						<div><StatusIcon :icon="bestiary.status" /> {{ bestiary.status }}</div>
						<div>{{ bestiary.creatures.length }}<font-awesome-icon :icon="['fas', 'skull']" /></div>
						<div role="button" aria-label="Toggle bookmark status" @click.prevent="toggleBookmark" class="bookmark" v-if="!isOwner">
							<span v-if="bookmarked" v-tooltip="'Unbookmark this bestiary'" class="bookmark-enabled"><font-awesome-icon :icon="['fas', 'star']" /></span>
							<span v-else v-tooltip="'Bookmark this bestiary'" class="bookmark-disabled"><font-awesome-icon :icon="['fas', 'star']" /></span>
						</div>
					</div>
				</div>
				<div class="tile-container list-tiles">
					<TransitionGroup name="slide-fade">
						<div v-for="creature in searchCreatures" :key="creature._id" class="content-tile creature-tile" @mouseover="lastHoveredCreature = creature.stats" @click="lastClickedCreature = creature.stats">
							<div class="left-side">
								<h3>{{ creature.stats?.description?.name }}</h3>
								<span>{{ creature.stats?.core?.size }} {{ creature.stats?.core?.race }}{{ creature.stats?.description?.alignment ? ", " + creature.stats?.description?.alignment : "" }}</span>
							</div>
							<div class="right-side">
								<VDropdown :distance="6" v-if="isOwner || isEditor" :positioning-disabled="isMobile">
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
								<span v-if="isOwner || isEditor" v-tooltip="'Edit creature'" :aria-label="`Edit ${creature.stats.description.name}`" class="edit-creature" @click.stop="() => {}">
									<RouterLink class="creature" :to="'/statblock-editor/' + creature._id" aria-label="Edit creature"> <font-awesome-icon :icon="['fas', 'pen-to-square']" /> </RouterLink>
								</span>
								<span class="cr"> CR {{ displayCR(creature.stats.description.cr) }}</span>
							</div>
						</div>
					</TransitionGroup>
					<div class="create-tile" v-if="isOwner">
						<span role="button" class="create-text" @click="createCreature()">add creature</span>
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
		<LabelledComponent title="CritterDB bestiary link">
			<p>Insert a link to a critterDB bestiary to import all its creatures.</p>
			<p> Make sure the bestiary is public or has link sharing enabled.</p>
			<div class="flow-horizontally">
				<input type="text" v-model="critterDbId" id="critterdbbestiarylink" placeholder="CritterDB bestiary link" />
				<button class="btn confirm" @click.prevent="importBestiaryFromCritterDB">Import</button>
			</div>
		</LabelledComponent>

		<hr />

		<LabelledComponent title="Bestiary Builder JSON">
			<p>Insert the JSON as text gotten from clicking export on another bestiary within Bestiary Builder.</p>
			<div class="flow-horizontally">
				<input type="text" v-model="bestiaryBuilderJson" id="bestiarybuilderjson" placeholder="" />
				<button class="btn confirm" @click.prevent="importCreaturesFromBestiaryBuilder">Import</button>
			</div>
		</LabelledComponent>
	  </template>
    </Modal>

	<Modal :show="showEditorModal" @close="showEditorModal = false" v-if="bestiary && isOwner">
      <template #header>Edit Bestiary</template>
	  <template #body>
		<LabelledComponent title="Bestiary name">
			<input type="text" v-model="bestiary.name" :minlength="limits.nameMin" :maxlength="limits.nameLength" id="bestiaryname" />
		</LabelledComponent>
		<LabelledComponent title="Description">
			<p>Supports markdown</p>
			<textarea v-model="bestiary.description" :maxlength="limits.descriptionLength" id="description" />
		</LabelledComponent>
		<div class="two-wide" v-if="isOwner">
			<LabelledComponent title="Status">
				<v-select v-model="bestiary.status" :options="['public', 'unlisted', 'private']" inputId="status" />
			</LabelledComponent>
			<LabelledComponent title="Tags">
				<v-select placeholder="Select Tags" v-model="bestiary.tags" multiple :options="allTags" inputId="tags" />
			</LabelledComponent>
		</div>
		<div class="editor-block">
			<h3>Editors</h3>
			<p v-if="isOwner">
				Editors can add, edit, and remove creatures. They can edit the name of the bestiary and its description. Editors cannot change the status of the bestiary or delete the bestiary. Editors cannot add other editors. The owner can remove editors at any time.
			</p>
			<div class="editor-container">
				<div v-for="editor in editors" class="editor-list">
					<p>
						<UserBanner :id="editor._id" />
						<span v-if="isOwner" role="button" @click="removeEditor(editor._id)" class="delete-creature"> <span>🗑️</span> </span>
					</p>
				</div>
			</div>
			<LabelledComponent title="Add editor">
				<div class="button-container">
					<input type="text" v-model="editorToAdd" inputmode="numeric" placeholder="Discord user ID" id="addeditor" />
					<button class="btn" @click="addEditor()" id="add">Add</button>
				</div>
			</LabelledComponent>
		</div>
		<p class="warning" v-if="showWarning">
			By changing the bestiary status to public I confirm that I am the copyright holder of the content within, or that I have permission from the copyright holder to share this content. I hereby agree to the <RouterLink to="../content-policy">Content Policy</RouterLink> and agree
			to be fully liable for the content within. I affirm that the content does not include any official non-free D&D content. Bestiaries that breach these terms may have their status changed to private or be outright removed, and may result in a ban if the content breaches our
			content policy.
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
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import StatusIcon from "@/components/StatusIcon.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import LabelledNumberInput from "@/components/LabelledNumberInput.vue";
import Modal from "@/components/Modal.vue";
import StatblockRenderer from "@/components/StatblockRenderer.vue";

import {RouterLink} from "vue-router";
import {defineComponent, ref} from "vue";
import { refDebounced, useTitle } from '@vueuse/core'

import {defaultStatblock} from "@/generic/types";
import type {User, Bestiary, Creature, Statblock} from "@/generic/types";
import {handleApiResponse, user, type error, toast, tags, type limitsType, asyncLimits, isMobile} from "@/main";
import {parseFromCritterDB} from "@/parser/parseFromCritterDB";
import {displayCR} from "@/generic/displayFunctions";

import markdownit from "markdown-it";

const md = markdownit();
export default defineComponent({
	data() {
		return {
			bestiary: null as Bestiary | null,
			savedBestiary: null as Bestiary | null,
			creatures: null as Creature[] | null,
			searchCreatureList: [] as Creature[] | null,
			editors: [] as User[],
			user: null as User | null,
			lastHoveredCreature: null as null | Statblock,
			lastClickedCreature: null as null | Statblock,
			hasPinnedBefore: false as boolean,
			limits: {} as limitsType,
			allTags: [] as string[],
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
			displayCR,
			md,
			isMobile,
			isExpanded: false,
			showEditorModal: false,
			showImportModal: false,
			selectedCreature: null as Creature | null
		};
	},
	components: {
		UserBanner,
		StatblockRenderer,
		Breadcrumbs,
		StatusIcon,
		LabelledComponent,
		LabelledNumberInput,
		Modal
	},
	async created() {
		this.limits = (await asyncLimits) ?? ({} as limitsType);
		tags.then((t) => {
			this.allTags = t ?? ([] as string[]);
		});
	},
	async beforeMount() {
		const loader = this.$loading.show();
		this.user = await user;
		await this.getBestiary();
		loader.hide();

		if (this?.bestiary?.name) {
			document.title = `${this?.bestiary?.name.substring(0,16)} | Bestiary Builder`
		}
	},
	mounted() {
	},
	setup() {
		const searchText = ref('')
		const debouncedSearch = refDebounced(searchText, 500)

		const searchEnv = ref('')
		const debouncedEnv = refDebounced(searchEnv, 500)

		const searchFaction= ref('')
		const debouncedFaction= refDebounced(searchFaction, 500)

		return {
			searchText,
			debouncedSearch,
			searchEnv,
			debouncedEnv,
			searchFaction,
			debouncedFaction
		}
	},
	computed: {
		searchCreatures() : Creature[] | null {
			if (this.creatures == null) return null
			const loader = this.$loading.show()

			let response = this.creatures?.filter(this.filterCreature) || null

			if (this.sortMode == "Alphabetically") {
				response.sort((a, b) => {
					const nameA = a.stats.description.name.toLowerCase()
					const nameB = b.stats.description.name.toLowerCase()
					if (nameA < nameB) return -1
					if (nameA > nameB) return 1
					return 0
				})
			}
			else if (this.sortMode == "Creature Type") {
				response.sort((a, b) => {
					const nameA = a.stats.core.race.toLowerCase()
					const nameB = b.stats.core.race.toLowerCase()
					if (nameA < nameB) return -1
					if (nameA > nameB) return 1
					return 0
				})
			}
			else if (this.sortMode == "CR Descending") {
				response.sort((a, b) => {
					return b.stats.description.cr - a.stats.description.cr
				})
			}
			else if (this.sortMode == "CR Ascending") {
				response.sort((a, b) => {
					return a.stats.description.cr - b.stats.description.cr
				})
			}
			loader.hide()


			return response
		}
	},
	methods: {
		filterCreature(data : Creature) {
			let filterChecks : boolean[] = []
			if (this.searchOptions.text != "") {
				filterChecks.push(
					data.stats.description.name.toLowerCase().includes(this.searchOptions.text.toLowerCase().trim())
				)
			}

			if (this.searchOptions.env != "") {
				filterChecks.push(
					data.stats.description.environment.toLowerCase().includes(this.searchOptions.env.toLowerCase().trim())
				)
			}

			if (this.searchOptions.faction != "") {
				filterChecks.push(
					data.stats.description.faction.toLowerCase().includes(this.searchOptions.faction.toLowerCase().trim())
				)
			}

			if (this.searchOptions.tags.length > 0) {
				filterChecks.push(
					this.searchOptions.tags.map(str => str.toLowerCase()).includes(data.stats.core.race.trim().split(' ')[0].toLowerCase())
				)
			}

			if (this.searchOptions.minCr != 0 || this.searchOptions.maxCr != 30) {
				filterChecks.push(
					this.searchOptions.minCr <= data.stats.description.cr && data.stats.description.cr <= this.searchOptions.maxCr
				)
			}
			return filterChecks.every(_ => _)
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
			let data = {} as {
				name: string;
				description: string;
				creatures: object[];
			};
			let hasFailed = false;
			toast.info("Fetching bestiary data has started. This may take a while.");
			let loader = this.$loading.show();
			await fetch(`/api/critterdb/${link}/${isPublic}`)
				.then((response) => handleApiResponse<any>(response))
				.then((result) => {
					if (result.success) {
						data = result.data;
					} else {
						toast.error((result.data as error).error);
						hasFailed = true;
					}
					loader.hide();
				});
			if (hasFailed) {
				return;
			}
			loader = this.$loading.show();
			toast.info("Importing creatures has started. This may take a while.");
			let creatures = data.creatures.map((a) => parseFromCritterDB(a)[0]);
			await fetch("/api/bestiary/" + this.bestiary?._id + "/addcreatures", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({data: creatures})
			})
				.then((response) => handleApiResponse<{error?: string}>(response))
				.then((result) => {
					if (result.data.error) toast.error(result.data.error);
				});
			await this.getBestiary();
			loader.hide();
			toast.success("Importing has finished!");
			this.showImportModal = false;
		},
		async importCreaturesFromBestiaryBuilder() {
			let creatures;
			const loader = this.$loading.show();
			try {
				creatures = JSON.parse(this.bestiaryBuilderJson);
			} catch (e) {
				console.error(e);
				toast.error("Something is wrong with the format of your JSON");
				loader.hide();
				return;
			}
			toast.info("Importing creatures has started. This may take a while.");
			await fetch("/api/bestiary/" + this.bestiary?._id + "/addcreatures", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({data: creatures})
			})
				.then((response) => handleApiResponse<{error?: string}>(response))
				.then((result) => {
					if (result.data.error) toast.error(result.data.error);
					if (result.success) {
						toast.success("Importing has finished!");
					}
				});
			await this.getBestiary();
			loader.hide();
			this.showImportModal = false;
		},
		async createCreature(stats = defaultStatblock, shouldRefresh = true, shouldHaveLoader = true) {
			let loader;
			if (shouldHaveLoader) {
				loader = this.$loading.show();
			}
			//Replace for actual creation data:
			let data = {
				stats: stats,
				bestiary: this.bestiary?._id
			} as Creature;
			//Send data to server
			await fetch("/api/creature/update", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({data: data})
			}).then(async (response) => {
				let result = await handleApiResponse<Creature>(response);
				if (result.success) {
					let data = result.data as Creature;
					this.bestiary?.creatures.push(data._id);
					this.creatures?.push(data);
				} else {
					toast.error((result.data as error).error);
				}
			});
			if (shouldRefresh) {
				const tileContainer = document.getElementsByClassName("tile-container")[0] as HTMLDivElement;
				tileContainer.scrollTop = tileContainer.scrollHeight;
			}
			if (shouldHaveLoader && loader) loader.hide()
		},
		async deleteCreature(creature: Creature) {
			const loader = this.$loading.show();
			await fetch(`/api/creature/${creature._id}/delete`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Deleted creature succesfully");
					if (!this.bestiary) return;
					this.bestiary.creatures = this.bestiary.creatures.filter((c) => c != creature._id);
					this.creatures = this.creatures?.filter((c) => c._id != creature._id) ?? [];
				} else {
					toast.error((result.data as error).error);
				}
			});
			loader.hide();
		},
		async addEditor() {
			if (!this.bestiary) return;
			let id = this.editorToAdd;
			const loader = this.$loading.show();

			await fetch(`/api/bestiary/${this.bestiary._id}/editors/add/${id}`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Added editor succesfully");
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
			loader.hide();
		},
		async removeEditor(id: string) {
			if (!this.bestiary) return;
			const loader = this.$loading.show();
			await fetch(`/api/bestiary/${this.bestiary._id}/editors/remove/${id}`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Removed editor succesfully");
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
			loader.hide();
		},
		async getBestiary() {
			//Get id
			let id = this.$route.params.id;
			//Request bestiary info
			await fetch("/api/bestiary/" + id).then(async (response) => {
				let result = await handleApiResponse<Bestiary>(response);
				if (result.success) {
					this.bestiary = result.data as Bestiary;
					this.savedBestiary = this.bestiary;
					this.isOwner = this.user?._id == this.bestiary.owner;
					this.isEditor = (this.bestiary?.editors ?? []).includes(this.user?._id ?? "");
					//Fetch creatures
					await fetch("/api/bestiary/" + this.bestiary._id + "/creatures").then(async (creatureResponse) => {
						let creatureResult = await handleApiResponse<Creature[]>(creatureResponse);
						if (creatureResult.success) {
							this.creatures = creatureResult.data as Creature[];
						} else {
							this.creatures = null;
							toast.error((creatureResult.data as error).error);
						}
					});
					//Fetch editors
					this.editors = [] as User[];
					for (let editorId of this.bestiary?.editors ?? []) {
						await fetch("/api/user/" + editorId)
							.then((response) => handleApiResponse<User>(response))
							.then((editorResult) => {
								if (editorResult.success) {
									this.editors.push(editorResult.data as User);
								} else {
									toast.error((editorResult.data as error).error);
								}
							});
					}
					//Bookmark state
					if (this.user) {
						await fetch(`/api/bestiary/${this.bestiary._id}/bookmark/get`).then(async (bookmarkResponse) => {
							let bookmarkResult = await handleApiResponse<{state: boolean}>(bookmarkResponse);
							if (bookmarkResult.success) {
								this.bookmarked = (bookmarkResult.data as {state: boolean}).state;
							} else {
								this.bookmarked = false;
								toast.error((bookmarkResult.data as error).error);
							}
						});
					} else {
						this.bookmarked = false;
					}
				} else {
					this.bestiary = null;
					toast.error((result.data as error).error);
				}
			});
		},
		async updateBestiary() {
			if (!this.bestiary) return;
			const loader = this.$loading.show();
			//Send to backend
			fetch(`/api/bestiary/${this.bestiary._id}/update`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({data: this.bestiary})
			}).then(async (response) => {
				let result = await handleApiResponse<Bestiary>(response);
				if (result.success) {
					toast.success("Saved bestiary");
					this.savedBestiary = this.bestiary;
					this.showEditorModal = false;
				} else {
					toast.error((result.data as error).error);
				}
			});
			loader.hide();
		},
		async toggleBookmark() {
			if (!this.bestiary) return;
			const loader = this.$loading.show();

			await fetch(`/api/bestiary/${this.bestiary._id}/bookmark/toggle`).then(async (bookmarkResponse) => {
				let bookmarkResult = await handleApiResponse<{state: boolean}>(bookmarkResponse);
				if (bookmarkResult.success) {
					this.bookmarked = (bookmarkResult.data as {state: boolean}).state;
					if (this.bookmarked) toast.success("Successfully bookmarked this bestiary!");
					else toast.success("Successfully unbookmarked this bestiary!");
				} else {
					this.bookmarked = false;
					toast.error((bookmarkResult.data as error).error);
				}
			});
			loader.hide();
		},
		setSelectedCreature(creature: any) {
			this.lastHoveredCreature = creature;
		}
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
		"bestiary.name"() : void {
			document.title = `${this?.bestiary?.name.substring(0,16)} | Bestiary Builder`
		},
		debouncedSearch() {
			this.searchOptions.text = this.searchText
		},
		debouncedEnv() {
			this.searchOptions.env = this.searchEnv
		},
		debouncedFaction() {
			this.searchOptions.faction = this.searchFaction
		}
	}
});
</script>

<style scoped lang="less">
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
				gap: 1rem;

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

					&:hover {
						scale: 1.02;
						overflow: visible;
					}

					svg {
						color: #536d8c;
					}

					&.cr {
						width: 5rem;
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
		& span {
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
	& h2 {
		text-align: center;
		text-wrap: nowrap;
		overflow: hidden;
		color: white;
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

		& .content-tile.creature-tile:hover {
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

	& h3 {
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
