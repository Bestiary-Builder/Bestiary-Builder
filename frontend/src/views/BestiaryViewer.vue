<template>
	<div class="content">
		<h1><span>bestiary viewer </span></h1>
		<div class="bestiary" v-if="bestiary">
			<div class="tile-container list-tiles">
				<div class="content-tile header-tile">
					<h2>{{ bestiary.name }}</h2>
					<p class="description">{{ bestiary.description }}</p>

					<div class="unpin" v-if="lastClickedCreature">
						<span class="unpin-button" @click="lastClickedCreature = null" role="button" aria-label="unpin currently pinned creature">unpin</span>
						📌
					</div>

					<div class="footer">
						<UserBanner :id="bestiary.owner" />

						<div>{{ statusEmoji(bestiary.status) }}{{ bestiary.status }}</div>
						<div>{{ bestiary.creatures.length }}🐉</div>
						<div v-if="isOwner || isEditor">
							<span class="edit-bestiary" role="button" @click="isEditorModalOpen = true" aria-label="Edit bestiary" v-tooltip="'Edit bestiary'">✏️</span>
							<span class="edit-bestiary" role="button" @click="createCreature" aria-label="Add creature" v-tooltip="'Add creature'">➕</span>
						</div>
						<div role="button" aria-label="bookmark" @click.prevent="toggleBookmark" class="bookmark" v-else>
							<span v-if="bookmarked" v-tooltip="'Unbookmark this bestiary'" class="bookmark-enabled">⭐</span>
							<span v-else v-tooltip="'Bookmark this bestiary'" class="bookmark-disabled">⭐</span>
						</div>
					</div>
				</div>

				<TransitionGroup name="slide-fade">
					<div class="content-tile creature-tile" v-for="creature in creatures" @mouseover="lastHoveredCreature = creature.stats" @click="lastClickedCreature = creature.stats" :key="creature._id">
						<div class="left-side">
							<h3>{{ creature.stats?.description?.name }}</h3>
							<span>{{ creature.stats?.core?.size }} {{ creature.stats?.core?.race }}{{ creature.stats?.description?.alignment ? ", " + creature.stats?.description?.alignment : "" }}</span>
						</div>
						<div class="right-side">
							<span v-if="isOwner || isEditor" role="button" @click.stop="openDeleteModal(creature)" class="delete-creature"> <span>🗑️</span> </span>
							<span v-if="isOwner || isEditor" class="edit-creature" @click.stop="() => {}"> <RouterLink class="creature" :to="'/statblock-editor/' + creature._id"> ✏️ </RouterLink> </span>
							<span class="cr"> CR {{ creature.stats.description.cr }}</span>
						</div>
					</div>
				</TransitionGroup>


				<div class="create-tile" v-if="isOwner">
					<span role="button" class="create-text" @click="createCreature">add creature</span>
				</div>
			</div>

			<div class="statblock-container" v-if="creatures && lastHoveredCreature">
				<span v-if="lastClickedCreature" class="pin-notice">
					<span class="unpin-button" @click="lastClickedCreature = null" role="button" aria-label="unpin currently pinned creature"><b>unpin</b></span
					>📌
				</span>
				<StatblockRenderer :data="lastClickedCreature || lastHoveredCreature" />
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
			<div class="modal__bg" v-if="isDeleteModalOpen">
				<section class="modal__content modal__small" ref="deleteModal" v-if="bestiary && (isOwner || isEditor)">
					<button @click="isDeleteModalOpen = false" class="modal__close-button" aria-label="Close Modal" type="button"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
					<h2 class="modal-header">are you sure you want to delete {{ selectedCreature?.stats.description.name }}?</h2>
					<p class="warning"> This action cannot be reversed.</p>
					<div class="modal-buttons">
						<button class="btn cancel-button" @click="isDeleteModalOpen=false">Cancel</button>
						<button v-if="selectedCreature" class="btn danger-button" @click.prevent="deleteCreature(selectedCreature)">Delete creature</button>
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
						<label for="nameinput">name</label>
						<input type="text" v-model="bestiary.name" :minlength="limits.nameMin" :maxlength="limits.nameLength" id="nameinput" />
					</div>
					<div class="flow-vertically">
						<label for="descinput" >description</label>
						<textarea v-model="bestiary.description" :maxlength="limits.descriptionLength" id="descinput"/>
					</div>
					<div v-if="isOwner" class="flow-vertically">
						<label for="statusinput">status</label>

						<v-select v-model="bestiary.status" :options="['public', 'unlisted', 'private']" inputId="statusinput" />
					</div>

					<div class="editor-block">
						<h3><span>editors</span></h3>
						<p v-if="isOwner" class="flow-vertically">
							<p> Editors can add, edit, and remove creatures. They can edit the name of the bestiary and its description. Editors cannot change the status of the bestiary or delete the bestiary. Editors cannot add other editors. The owner can remove editors at any time.</p>

						</p>
						<div class="editor-container">
							<div v-for="editor in editors" class="editor-list">
								<p>
									<UserBanner :id="editor._id" />
									<span v-if="isOwner" role="button" @click="removeEditor(editor._id)" class="delete-creature"> <span>🗑️</span> </span>
								</p>
							</div>
							<div class="flow-vertically">
								<label for="addeditor">add editor</label>
								<div class="button-container">
									<input type="text" v-model="editorToAdd" inputmode="numeric" placeholder="Discord user ID" />
									<button class="btn" @click="addEditor()" id="add">add</button>
								</div>
							</div>
						</div>
					</div>
					<p class="warning" v-if="showWarning">
						By changing the bestiary status to {{ bestiary.status }} I confirm that I am the copyright holder of the content within, or that I have permission from the copyright holder to share this content. I hereby agree to the (CONTENT POLICY) and agree to be fully liable for the content within. I affirm that the content does not include any official non-free D&D content. 

						Bestiaries that breach these terms may have their status changed to private or be outright removed, and may result in a ban if the content breaches our content policy.
					</p>

					<div class="modal-buttons">
						<button class="btn cancel-button" @click="isEditorModalOpen=false">Cancel</button>
						<button class="btn confirm-button" @click.prevent="updateBestiary">Save changes</button>
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


const selectedCreature = ref<Creature | null>(null)

const isDeleteModalOpen = ref(false);
const deleteModal = ref<HTMLDivElement | null>(null);
// @ts-ignore
onClickOutside(deleteModal, () => (isDeleteModalOpen.value = false));

const openDeleteModal = (creature: Creature) => {
	selectedCreature.value = creature
	isDeleteModalOpen.value = true;
};
</script>

<script lang="ts">
import {RouterLink} from "vue-router";
import {defineComponent} from "vue";
import {defaultStatblock} from "@/components/types";
import type {User, Bestiary, Creature, Statblock} from "@/components/types";
import UserBanner from "@/components/UserBanner.vue";
import {handleApiResponse, user, type error, toast, limits, type limitsType} from "@/main";
import StatblockRenderer from "@/components/StatblockRenderer.vue";

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
			bookmarked: false as boolean,
			isOwner: false,
			isEditor: false,
			editorToAdd: "" as string,
			showWarning: false as boolean
		};
	},
	components: {
		UserBanner,
		StatblockRenderer
	},
	async created() {
		// @ts-ignore
		this.limits = (await limits) ?? ({} as limitsType);
	},
	async beforeMount() {
		this.getBestiary();
		this.user = await user;
	},
	methods: {
		async createCreature() {
			console.log("Create");
			//Replace for actual creation data:
			let data = {
				stats: defaultStatblock,
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
					console.log("Created");
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
		},
		async deleteCreature(creature: Creature) {
			await fetch(`/api/creature/${creature._id}/delete`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Deleted creature succesfully");
					isDeleteModalOpen.value = false;
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
		},
		async addEditor() {
			let id = this.editorToAdd;
			if (!this.bestiary) return;
			await fetch(`/api/bestiary/${this.bestiary._id}/editors/add/${id}`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Added editor succesfully");
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
		},
		async removeEditor(id: string) {
			if (!this.bestiary) return;
			await fetch(`/api/bestiary/${this.bestiary._id}/editors/remove/${id}`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Removed editor succesfully");
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
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
					this.isEditor = this.bestiary.editors.includes(this.user?._id ?? "");
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
					for (let editorId of this.bestiary.editors) {
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
					this.bestiary = null;
					toast.error((result.data as error).error);
				}
			});
		},
		async updateBestiary() {
			console.log("Pressed save statblock!");
			if (!this.bestiary) return;
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
		},
		async toggleBookmark() {
			if (!this.bestiary) return;
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
		},
		setSelectedCreature(creature: any) {
			this.lastHoveredCreature = creature;
		},
		statusEmoji(status: "public" | "private" | "unlisted"): string {
			return status == "public" ? "🌍" : status == "private" ? "🔒" : "🔗";
		},
	},
	watch: {
		lastClickedCreature(newValue, oldValue): void {
			if (this.hasPinnedBefore) return;
			if (!this.hasPinnedBefore) this.hasPinnedBefore = true;

			toast.info("Pinned creature to the right side. Click unpin there to go back to hover behaviour.");
		},
		'bestiary.status'(newValue, oldValue): void {
			if (newValue == "private") this.showWarning = false
			if (newValue != "private") this.showWarning = true
			console.log(newValue, oldValue)
		}
	}
});
</script>

<style scoped lang="less">
.flow-vertically {
	display: flex;
	flex-direction: column;
	gap: .3rem;

	label {
		font-weight: bold;
		text-decoration: underline;
	}
}
.content {
	margin: 1rem 5vw;

	& h1 {
		text-align: center;
		margin-bottom: 2rem;
		font-size: 3rem;

		& span {
			border-bottom: 4px solid orangered;
			padding: 0 10rem;
		}
	}
}

@media screen and (max-width: 1800px) {
	.content h1 span {
		padding: 0 7rem;
	}
}

@media screen and (max-width: 1550px) {
	.content h1 span {
		padding: 0 4rem;
	}
}

@media screen and (max-width: 1050px) {
	.content h1 {
		font-size: 2rem;

		span {
			padding: 0 2rem;
		}
	}
}

.list-tiles {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	position: relative;
	overflow: scroll;
	max-height: 85vh;
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
						width: 4rem;
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
		background-color: orangered;
		position: sticky;
		z-index: 1;
		top: 0;
		cursor: unset;

		& h2 {
			text-transform: lowercase;
			text-align: center;
			border-bottom: 1px dotted white;
		}

		.description {
			max-height: 10.5rem;
			color: rgb(229, 229, 229);
			overflow-y: scroll;
		}
		.footer {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr 1fr;
			font-size: 1rem;

			margin-top: 0.5rem;

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
.modal-buttons {
	display: flex;
	gap: 1rem;
	justify-content: center;
	margin-top: 2rem;

	& button {
		padding: .5rem 1rem;
		border: none;
		cursor: pointer;

		transition: all .3s ease;
		&:hover {
			scale: 1.05;
			filter: brightness(1.05);
		}
	}

	.cancel-button {
		background-color: grey;
	}
	
	.confirm-button {
		background-color: var(--color-success);
	
	}
	
	.danger-button {
		background-color: var(--color-destructive);
	}
}

.warning {
	color: var(--color-destructive);
	margin-top: .5rem;
}

.editor-container {
	display: grid;
	grid-template-columns: 1fr 1fr;
}
</style>
