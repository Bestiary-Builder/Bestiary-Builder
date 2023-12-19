<template>
	<div class="content">
		<h1><span>my bestiaries </span></h1>

		<div class="tile-container">
			<div class="content-tile create-tile" @click.prevent="createBestiary">
				<button class="create-button">+</button>
			</div>
			<RouterLink class="content-tile bestiary-tile" v-if="bestiaries" v-for="bestiary in bestiaries" :to="'/bestiary-viewer/' + bestiary._id">
				<div class="tile-header"> <h2>{{ bestiary.name }}</h2> </div>
				<div class="tile-content">
					<p>{{ bestiary.description }}</p>
				</div>
				<div class="tile-footer">
					<span>{{ statusEmoji(bestiary.status) }}{{ bestiary.status }}</span>
					<span role="button" @click.stop.prevent="openModal(bestiary._id)" class="edit-button">🗑️</span>
					<span>{{ bestiary.creatures.length }}🐉</span>
				</div>
			</RouterLink>
		</div>
	</div>

	<dialog id="delete-modal">
		<h2 class="modal-header">Are you sure you want to delete this bestiary?</h2>
		<p class="modal-desc">Please confirm you want to permanently delete this bestiary. This action is not reversible.</p>

		<div class="modal-buttons">
			<button class="btn cancel-button" @click="closeModal()">Cancel</button>
			<button class="btn danger-button" @click.prevent="() => deleteBestiary()">Confirm</button>
		</div>
	</dialog>
</template>

<script lang="ts">
import {RouterLink} from "vue-router";
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import {handleApiResponse, toast, user} from "@/main";
import type {error} from "@/main";

export default defineComponent({
	data() {
		return {
			bestiaries: [] as Bestiary[],
			user: null as User | null,
			deleteId: "" as string
		};
	},
	async beforeMount() {
		this.user = await user;
		this.getBestiaries();
	},
	methods: {
		async createBestiary() {
			//Replace for actual creation data:
			let data = {
				name: "New bestiary",
				description: "",
				status: "private",
				creatures: [] as string[]
			} as Bestiary;
			//Send data to server
			await fetch("/api/bestiary/update", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({data: data})
			}).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Created bestiary");
					// @ts-ignore
					this.$router.push("/bestiary-viewer/" + result.data._id);
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiaries();
		},
		async deleteBestiary() {
			let id = this.deleteId;
			await fetch(`/api/bestiary/${id}/delete`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Deleted bestiary succesfully");

					(document.getElementById("delete-modal") as HTMLDialogElement).close();
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiaries();
		},
		async getBestiaries() {
			//Request bestiary info
			await fetch(`/api/my-bestiaries`).then(async (response) => {
				let result = await handleApiResponse<Bestiary[]>(response);
				if (result.success) this.bestiaries = result.data as Bestiary[];
				else {
					this.bestiaries = [];
					toast.error((result.data as error).error);
				}
			});
			console.log(this.bestiaries);
		},
		statusEmoji(status: "public" | "private" | "unlisted"): string {
			return status == "public" ? "🌍" : status == "private" ? "🔒" : "🔗";
		},
		openModal(id: string): void {
			const dialog = document.getElementById("delete-modal") as HTMLDialogElement;
			if (!dialog) return;
			this.deleteId = id;
			dialog.showModal();
		},
		closeModal(): void {
			(document.getElementById("delete-modal") as HTMLDialogElement).close();
		}
	}
});
</script>

<style scoped lang="less">
@import url("../assets/bestiary-list.less");
.create-tile:first-of-type {
	background-color: orangered;
	display: flex;
	justify-content: center;
	align-items: center;
	user-select: none;
	cursor: pointer;

	
	& .create-button {
		background-color: transparent;
		color: white;
		border: none;
		outline: none;
		font-size: 25rem;
		line-height: 0;
		pointer-events: none;
	}
}

.edit-button {
	margin: auto;
	transition: scale 0.3s ease;
	& :hover {
		scale: 1.1;
	}
}
</style>
