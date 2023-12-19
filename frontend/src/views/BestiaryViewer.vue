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
							<span class="edit-bestiary" role="button" @click="openModal" aria-label="Edit bestiary" v-tooltip="'Edit bestiary'">✏️</span>
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
							<span v-if="isOwner || isEditor" role="button" @click.stop="openDeleteModal(creature._id)" class="delete-creature"> <span>🗑️</span> </span>
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

	<dialog id="edit-modal" v-if="(isOwner || isEditor) && bestiary">
		<h2 class="modal-header">Edit bestiary</h2>
		<p class="modal-desc">bla bla bla bla</p>
		<div>
			<label>Name: </label>
			<input type="text" v-model="bestiary.name" :minlength="limits.nameMin" :maxlength="limits.nameLength" />
		</div>
		<div>
			<label>Description: </label>
			<textarea v-model="bestiary.description" :maxlength="limits.descriptionLength" cols="4" />
		</div>
		<div v-if="isOwner">
			<label>Status: </label>
			<select v-model="bestiary.status">
				<option value="public">Public</option>
				<option value="unlisted">Unlisted</option>
				<option value="private">Private</option>
			</select>
		</div>

		<div>
			<h3> Editors </h3>
			{{  editors  }}
			<p v-for="editor in editors">
				<UserBanner :id="editor._id" />
				<button class="btn" @click="removeEditor(editor._id)" v-if="isOwner"> Remove </button>
			</p>
			<p v-if="isOwner">
				Add Editor
				<input type="text" v-model="editorToAdd" inputmode="numeric">
				<button class="btn" @click="addEditor()"> Add </button>
			</p>
		</div>

		<div class="modal-buttons">
			<button class="btn cancel-button" @click="closeModal()">Cancel</button>
			<button class="btn danger-button" @click.prevent="updateBestiary">Save bestiary</button>
		</div>
	</dialog>

	<dialog id="delete-modal" v-if="isOwner && bestiary">
		<h2 class="modal-header">Are you sure you want to delete this creature?</h2>
		<p class="modal-desc">Please confirm you want to permanently delete this creature. This action is not reversible.</p>

		<div class="modal-buttons">
			<button class="cancel-button" @click="closeDeleteModal()">Cancel</button>
			<button class="danger-button" @click.prevent="() => deleteCreature(selectedCreature)">Confirm</button>
		</div>
	</dialog>
</template>

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
			selectedCreature: "" as string,
			limits: {} as limitsType,
			bookmarked: false as boolean,
			isOwner: false,
			isEditor: false,
			editorToAdd: "" as string
		};
	},
	components: {
		UserBanner,
		StatblockRenderer
	},
	async created() {
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
		async deleteCreature(id: string) {
			await fetch(`/api/creature/${id}/delete`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Deleted creature succesfully");
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
		},
		async addEditor() {
			let id = this.editorToAdd
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
					for (let editorId in this.bestiary.editors) {
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
		openModal(): void {
			const dialog = document.getElementById("edit-modal") as HTMLDialogElement;
			if (!dialog) return;

			dialog.showModal();
		},
		closeModal(): void {
			(document.getElementById("edit-modal") as HTMLDialogElement).close();
		},
		openDeleteModal(id: string): void {
			const dialog = document.getElementById("delete-modal") as HTMLDialogElement;
			if (!dialog) return;
			this.selectedCreature = id;
			dialog.showModal();
		},
		closeDeleteModal(): void {
			(document.getElementById("delete-modal") as HTMLDialogElement).close();
		},
		statusEmoji(status: "public" | "private" | "unlisted"): string {
			return status == "public" ? "🌍" : status == "private" ? "🔒" : "🔗";
		}
	},
	watch: {
		lastClickedCreature(newValue, oldValue): void {
			if (this.hasPinnedBefore) return;
			if (!this.hasPinnedBefore) this.hasPinnedBefore = true;

			toast.info("Pinned creature to the right side. Click unpin there to go back to hover behaviour.");
		}
	}
});
</script>

<style scoped lang="less">
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
</style>
