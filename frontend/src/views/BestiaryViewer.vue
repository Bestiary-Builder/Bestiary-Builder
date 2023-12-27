<template>
	<div class="content">
		<h1><span>Bestiary Viewer </span></h1>
		<div class="bestiary" v-if="bestiary">
			<div class="tile-container list-tiles" id="tile-container">
				<div class="content-tile header-tile">
					<h2>{{ bestiary.name }}</h2>
					<p class="description">{{ bestiary.description }}</p>
					<hr />
					<div class="controls-container">
						<div class="flow-vertically">
							<label for="searchtext"> Filter </label>
							<input type="text" v-model="searchText" id="searchtext" placeholder="Search by name...">
						</div>
						<div class="flow-vertically" v-if="isOwner || isEditor">
							<label> Options </label>
							<div class="btn-container">
								<button class="btn" @click="isEditorModalOpen = true"> Edit </button> 
								<button class="btn" @click="createCreature()"> Add creature </button> 
								<button class="btn" v-if="isOwner" @click="isImportModalOpen = true"> Import </button>
							</div>
						</div>
					</div>
					<div class="tags">
						<span class="tag" v-for="tag in bestiary.tags">{{ tag }}</span>
					</div>
					<div class="unpin" v-if="lastClickedCreature">
						<span class="unpin-button" @click="lastClickedCreature = null" role="button" aria-label="unpin currently pinned creature">unpin</span>
						📌
					</div>
					<hr />
					<div class="footer" :class="{'three-wide': isOwner || isEditor}">
						<UserBanner :id="bestiary.owner" />
						<div>{{ statusEmoji(bestiary.status) }}{{ bestiary.status }}</div>
						<div>{{ bestiary.creatures.length }}🐉</div>
						<div role="button" aria-label="bookmark" @click.prevent="toggleBookmark" class="bookmark" v-if="!isOwner && !isEditor">
							<span v-if="bookmarked" v-tooltip="'Unbookmark this bestiary'" class="bookmark-enabled">⭐</span>
							<span v-else v-tooltip="'Bookmark this bestiary'" class="bookmark-disabled">⭐</span>
						</div>
					</div>
				</div>

				<TransitionGroup name="slide-fade" mode="out-in">
					<template v-for="creature in creatures" :key="creature._id">
						<div class="content-tile creature-tile" @mouseover="lastHoveredCreature = creature.stats" @click="lastClickedCreature = creature.stats" 
							v-if="creature.stats.description.name.toLowerCase().includes(searchText.toLowerCase().trim())" autofocus>
							<div class="left-side">
								<h3>{{ creature.stats?.description?.name }}</h3>
								<span>{{ creature.stats?.core?.size }} {{ creature.stats?.core?.race }}{{ creature.stats?.description?.alignment ? ", " + creature.stats?.description?.alignment : "" }}</span>
							</div>
							<div class="right-side">
								<span v-if="isOwner || isEditor" role="button" @click.stop="openDeleteModal(creature)" class="delete-creature"> <span>🗑️</span> </span>
								<span v-if="isOwner || isEditor" class="edit-creature" @click.stop="() => {}"> <RouterLink class="creature" :to="'/statblock-editor/' + creature._id"> ✏️ </RouterLink> </span>
								<span class="cr"> CR {{ displayCR(creature.stats.description.cr) }}</span>
							</div>
						</div>
					</template>
				</TransitionGroup>

				<div class="create-tile" v-if="isOwner">
					<span role="button" class="create-text" @click="createCreature()">add creature</span>
				</div>
			</div>

			<div class="statblock-container" v-if="creatures && lastHoveredCreature">
				<span v-if="lastClickedCreature" class="pin-notice">
					<span class="unpin-button" @click="lastClickedCreature = null" role="button" aria-label="unpin currently pinned creature"><b>unpin</b></span
					>📌
				</span>
				<Transition name="fade" mode="out-in">
					<StatblockRenderer :data="lastClickedCreature || lastHoveredCreature" :key="lastClickedCreature?.description.name || lastHoveredCreature.description.name"/>
				</Transition>
			</div>
			<div class="statblock-container" v-else>
				<div class="no-creature-text">
					<p>hover over a creature to see its statblock</p>
					<p>click on a creature to pin it to the right side</p>
				</div>
			</div>
		</div>
	</div>

	<Teleport to="#modal">
		<Transition name="modal">
			<div class="modal__bg" v-if="isImportModalOpen">
				<section class="modal__content modal__small" ref="importModal" v-if="bestiary && isOwner">
					<button @click="isImportModalOpen = false" class="modal__close-button" aria-label="Close Modal" type="button"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
					<h2 class="modal-header">Import from CritterDB</h2>
					<div class="flow-vertically">
						<label for="critterdblink">CritterDB bestiary link </label>
						<input type="text" v-model="critterDbId" id="critterdblink" style="width: 100%" placeholder="" />
					</div>
					<div class="modal-buttons">
						<button class="btn" @click="isImportModalOpen = false">Cancel</button>
						<button class="btn confirm" @click.prevent="importBestiaryFromCritterDB">Import Bestiary</button>
					</div>
				</section>
			</div>
		</Transition>
	</Teleport>

	<Teleport to="#modal">
		<Transition name="modal">
			<div class="modal__bg" v-if="isDeleteModalOpen">
				<section class="modal__content modal__small" ref="deleteModal" v-if="bestiary && (isOwner || isEditor)">
					<button @click="isDeleteModalOpen = false" class="modal__close-button" aria-label="Close Modal" type="button"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
					<h2 class="modal-header">
						Are you sure you want to delete <u>{{ selectedCreature?.stats.description.name }}</u
						>?
					</h2>
					<div class="modal-buttons">
						<button class="btn" @click="isDeleteModalOpen = false">Cancel</button>
						<button v-if="selectedCreature" class="btn danger" @click.prevent="deleteCreature(selectedCreature)">Delete Creature</button>
					</div>
				</section>
			</div>
		</Transition>
	</Teleport>

	<Teleport to="#modal">
		<Transition name="modal">
			<div class="modal__bg" v-if="isEditorModalOpen">
				<section class="modal__content modal__small" ref="editModal" v-if="bestiary && (isOwner || isEditor)">
					<button @click="isEditorModalOpen = false" class="modal__close-button" aria-label="Close Modal" type="button"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
					<h2 class="modal-header">edit bestiary</h2>
					<div class="flow-vertically">
						<label for="nameinput">Name</label>
						<input type="text" v-model="bestiary.name" :minlength="limits.nameMin" :maxlength="limits.nameLength" id="nameinput" />
					</div>
					<div class="flow-vertically">
						<label for="descinput">Description</label>
						<textarea v-model="bestiary.description" :maxlength="limits.descriptionLength" id="descinput" />
					</div>
					<div v-if="isOwner" class="flow-vertically">
						<label for="statusinput">Status</label>
						<v-select v-model="bestiary.status" :options="['public', 'unlisted', 'private']" inputId="statusinput" />
					</div>
					<div  v-if="isOwner" class="flow-vertically">
						<label for="tagsInput">Tags</label>
						<v-select placeholder="Select Tags" v-model="bestiary.tags" multiple :options="allTags" inputId="tagsInput" />
					</div>

					<div class="editor-block">
						<h3><span>editors</span></h3>
						<p v-if="isOwner" class="flow-vertically">
							Editors can add, edit, and remove creatures. They can edit the name of the bestiary and its description. Editors cannot change the status of the bestiary or delete the bestiary. Editors cannot add other editors. The owner can remove editors at any time.
						</p>
						<div class="editor-container">
							<div v-for="editor in editors" class="editor-list">
								<p>
									<UserBanner :id="editor._id" />
									<span v-if="isOwner" role="button" @click="removeEditor(editor._id)" class="delete-creature"> <span>🗑️</span> </span>
								</p>
							</div>
							<div class="flow-vertically">
								<label for="addeditor">Add editor</label>
								<div class="button-container">
									<input type="text" v-model="editorToAdd" inputmode="numeric" placeholder="Discord user ID" />
									<button class="btn" @click="addEditor()" id="add">Add</button>
								</div>
							</div>
						</div>
					</div>
					<p class="warning" v-if="showWarning">
						By changing the bestiary status to public I confirm that I am the copyright holder of the content within, or that I have permission from the copyright holder to share this content. I hereby agree to the (CONTENT POLICY) and agree to be fully liable for the content within. I
						affirm that the content does not include any official non-free D&D content. Bestiaries that breach these terms may have their status changed to private or be outright removed, and may result in a ban if the content breaches our content policy.
					</p>

					<div class="modal-buttons">
						<button class="btn" @click="isEditorModalOpen = false">Cancel</button>
						<button class="btn confirm" @click.prevent="updateBestiary">Save changes</button>
					</div>
				</section>
			</div>
		</Transition>
	</Teleport>
</template>
<script setup lang="ts">
import {ref} from "vue";
import {onClickOutside} from "@vueuse/core";
const isEditorModalOpen = ref(false);
const editModal = ref<HTMLDivElement | null>(null);
// @ts-ignore
onClickOutside(editModal, () => (isEditorModalOpen.value = false));

const selectedCreature = ref<Creature | null>(null);

const isDeleteModalOpen = ref(false);
const deleteModal = ref<HTMLDivElement | null>(null);
// @ts-ignore
onClickOutside(deleteModal, () => (isDeleteModalOpen.value = false));

const openDeleteModal = (creature: Creature) => {
	selectedCreature.value = creature;
	isDeleteModalOpen.value = true;
};

const isImportModalOpen = ref(false);
const importModal = ref<HTMLDivElement | null>(null);
// @ts-ignore
onClickOutside(deleteModal, () => (isImportModalOpen.value = false));
</script>

<script lang="ts">
import {RouterLink} from "vue-router";
import {defineComponent} from "vue";
import {defaultStatblock} from "@/generic/types";
import type {User, Bestiary, Creature, Statblock} from "@/generic/types";
import UserBanner from "@/components/UserBanner.vue";
import {handleApiResponse, user, type error, toast, tags, type limitsType, asyncLimits} from "@/main";
import StatblockRenderer from "@/components/StatblockRenderer.vue";
import {parseFromCritterDB} from "@/parser/parseFromCritterDB";
import {statusEmoji, displayCR} from "@/generic/displayFunctions";
export default defineComponent({
	data() {
		return {
			bestiary: null as Bestiary | null,
			savedBestiary: null as Bestiary | null,
			creatures: null as Creature[] | null,
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
			searchText: "" as string
		};
	},
	components: {
		UserBanner,
		StatblockRenderer
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
	},
	methods: {
		async importBestiaryFromCritterDB() {
			let link = this.critterDbId.trim();
			let isPublic = link.includes("publishedbestiary");
			if (!link.startsWith("https://critterdb.com") && !link.startsWith("critterdb.com")) {
				toast.error("Are you sure this is a link to a critterDB bestiary?");
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
						loader.hide();
					} else {
						toast.error((result.data as error).error);
						hasFailed = true;
					}
				});

			if (hasFailed) {
				return;
			}

			loader = this.$loading.show();
			toast.info("Importing creatures has started. This may take a while.");
			let index = 0;
			for (let creature of data.creatures) {
				let stats;
				try {
					stats = parseFromCritterDB(creature);
					await this.createCreature(stats[0], false);
				} catch (e) {
					console.error(e);
				}
				index++;
			}
			await this.getBestiary();
			loader.hide();
			toast.success("Importing has finished!");
		},
		async createCreature(stats = defaultStatblock, shouldRefresh = true) {
			const loader = this.$loading.show()
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
				let result = await handleApiResponse(response);
				if (result.success) {
				} else {
					toast.error((result.data as error).error);
				}
			});
			if (shouldRefresh) { 
				await this.getBestiary();
				const tileContainer = document.getElementById("tile-container") as HTMLDivElement;
				tileContainer.scrollTop = tileContainer.scrollHeight;
			}
			loader.hide()

		},
		async deleteCreature(creature: Creature) {
			const loader = this.$loading.show()
			await fetch(`/api/creature/${creature._id}/delete`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Deleted creature succesfully");
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
			loader.hide()
		},
		async addEditor() {
			if (!this.bestiary) return;
			let id = this.editorToAdd;
			const loader = this.$loading.show()

			await fetch(`/api/bestiary/${this.bestiary._id}/editors/add/${id}`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Added editor succesfully");
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
			loader.hide()
		},
		async removeEditor(id: string) {
			if (!this.bestiary) return;
			const loader = this.$loading.show()
			await fetch(`/api/bestiary/${this.bestiary._id}/editors/remove/${id}`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Removed editor succesfully");
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
			loader.hide()
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
			const loader = this.$loading.show()
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
				} else {
					toast.error((result.data as error).error);
				}
			});
			loader.hide()

		},
		async toggleBookmark() {
			if (!this.bestiary) return;
			const loader = this.$loading.show()

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
			loader.hide()
		},
		setSelectedCreature(creature: any) {
			this.lastHoveredCreature = creature;
		}
	},
	watch: {
		lastClickedCreature(): void {
			if (this.hasPinnedBefore) return;
			if (!this.hasPinnedBefore) this.hasPinnedBefore = true;

			toast.info("Pinned creature to the right side. Click unpin there to go back to hover behaviour.");
		},
		"bestiary.status"(newValue, oldValue): void {
			if (newValue == "private") this.showWarning = false;
			if (newValue == "public") this.showWarning = true;
		}
	}
});
</script>

<style scoped lang="less">
.flow-vertically {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;

	label {
		font-weight: bold;
		text-decoration: underline;
	}
}

.controls-container {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;

	& .btn-container {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
	}
}
.list-tiles {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	position: relative;
	overflow: scroll;
	max-height: 80vh;
	padding: 0 1rem 1rem;
	overflow-x: hidden;
	overscroll-behavior: contain;
	.content-tile {
		height: fit-content !important;
		background: rgb(59, 55, 54);
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

				span {
					color: orangered;
					font-size: 1.2rem;
					display: flex;
					align-items: center;
					height: 100%;

					&.cr {
						width: 5rem;
					}
				}
			}

			&:hover {
				scale: 1.05;
				background-color: rgb(56, 53, 52);
			}
		}
	}

	.header-tile {
		background-color: var(--color-surface-2);
		position: sticky;
		z-index: 1;
		top: 0;
		cursor: unset;

		& h2 {
			text-align: center;
			text-wrap: nowrap;
			overflow: hidden;
			color: white;
		}

		.description {
			max-height: 8rem;
			font-size: smaller;
			color: rgb(229, 229, 229);
			overflow-y: scroll;
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

	.create-tile {
		text-align: center;
		text-decoration: underline;
		cursor: pointer;
	}
}

.bestiary {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;
}

.delete-creature,
.edit-creature,
.edit-bestiary {
	cursor: pointer;
	transition: scale 0.3s ease;

	:hover {
		scale: 1.08;
	}
}

.pin-notice {
	float: right;
	cursor: pointer;
}

.unpin {
	text-align: center;
	margin: 0.5rem;
	.unpin-button {
		text-decoration: underline;
		cursor: pointer;
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
