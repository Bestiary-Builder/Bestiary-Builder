<template>
	<div class="content">
		<h1><span>bestiary viewer </span></h1>
		<div class="bestiary" v-if="bestiary">
			<div class="tile-container list-tiles">
				<div class="content-tile header-tile">
					<h2>{{ bestiary.name }}</h2>
					<p>Description: {{ bestiary.description }}</p>
					<p>Status: {{ bestiary.status }}</p>
					<p>Creature amount: {{ bestiary.creatures.length }}</p>
					
					<span v-if="lastClickedCreature">
						<span class="unpin-button" @click="lastClickedCreature = null" role="button" aria-label="unpin currently pinned creature">unpin</span> 
						📌
					</span>
					
					<div class="owner">
						<p>Owner:</p>
						<UserBanner :id="bestiary.owner" />
					</div>
					<p>Bookmarked: {{ bookmarked }}</p>
					<button @click.prevent="toggleBookmark">Bookmark</button>
					<button v-if="isOwner" @click="openModal">Edit bestiary</button>
					<button v-if="isOwner" @click.prevent="createCreature">Create new creature</button>
				</div>

				<div class="content-tile creature-tile" v-for="creature in creatures" @mouseover="lastHoveredCreature = creature.stats" @click="lastClickedCreature = creature.stats">
					<div class="left-side">
						<h2>{{ creature.stats?.description?.name }}</h2>
						<span>{{ creature.stats?.core?.size }} {{ creature.stats?.core?.race }}{{ creature.stats?.description?.alignment ? ", " + creature.stats?.description?.alignment : "" }}</span>
					</div>
					<div class="right-side">
						<span v-if="isOwner" role="button" @click.stop="openDeleteModal(creature._id)" class="delete-creature"> <span>🗑️</span> </span>
						<span v-if="isOwner" class="edit-creature" @click.stop="()=>{}"> <RouterLink class="creature" :to="'/statblock-editor/' + creature._id"> ✏️ </RouterLink> </span>
						<span> CR {{ creature.stats.description.cr }}</span>
					</div>
				</div>
			</div>

			<div class="statblock-container" v-if="creatures && (lastHoveredCreature)">
				<span v-if="lastClickedCreature" class="pin-notice">
					<span class="unpin-button" @click="lastClickedCreature = null" role="button" aria-label="unpin currently pinned creature"><b>unpin</b></span>📌
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

	<dialog id="edit-modal" v-if="isOwner && bestiary">
		<h2 class="modal-header">Edit bestiary</h2>
		<p class="modal-desc">bla bla bla bla</p>
		<div>
			<label>Name: </label>
			<input type="text" v-model="bestiary.name" :minlength="limits.nameMin" :maxlength="limits.nameLength" />
		</div>
		<div>
			<label>Description: </label>
			<input type="text" v-model="bestiary.description" :maxlength="limits.descriptionLength" />
		</div>
		<div>
			<label>Status: </label>
			<select v-model="bestiary.status">
				<option value="public">Public</option>
				<option value="unlisted">Unlisted</option>
				<option value="private">Private</option>
			</select>
		</div>
		<div class="modal-buttons">
			<button class="cancel-button" @click="closeModal()">Cancel</button>
			<button class="danger-button" @click.prevent="updateBestiary">Save bestiary</button>
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
			user: null as User | null,
			lastHoveredCreature: null as null | Statblock,
			lastClickedCreature: null as null | Statblock,
			hasPinnedBefore: false as boolean,
			selectedCreature: "" as string,
			limits: {} as limitsType,
			bookmarked: false as boolean,
			isOwner: false
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
		}
	},
	watch: {
		lastClickedCreature(newValue, oldValue): void {
			if (this.hasPinnedBefore) return
			if (!this.hasPinnedBefore) this.hasPinnedBefore = true
			
			toast.info("Pinned creature to the right side. Click unpin there to go back to hover behaviour.")
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
	padding: 0 1rem;
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

		h2 {
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
				}
			}
		}
	}

	.header-tile {
		background-color: orangered;
		position: sticky;
		z-index: 1;
		top: 0;

		& h2 {
			text-transform: lowercase;
			text-align: center;
			border-bottom: 1px dotted white;
		}
	}
}

.bestiary {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;
}

.content-tile:hover {
	scale: 1.05;
}

.bestiary-tile:hover {
	background-color: rgb(56, 53, 52);
}

.delete-creature,
.edit-creature {
	cursor: pointer;
	transition: scale 0.3s ease;

	&:hover {
		scale: 1.08;
	}
}

.pin-notice {
	float: right
}
.unpin-button {
	text-decoration: underline;
	cursor: pointer;
}

.no-creature-text {
	font-size: 1.3rem;
	text-align: center;
	margin-top: 1rem;
}
</style>
