<template>
	<div class="content">
		<h1><span>My Bestiaries </span></h1>
		<div class="tile-container">
			<div class="content-tile create-tile" @click.prevent="createBestiary">
				<button class="create-button">+</button>
			</div>

			<TransitionGroup name="popin">
				<RouterLink class="content-tile bestiary-tile" v-if="bestiaries" v-for="bestiary in bestiaries" :to="'/bestiary-viewer/' + bestiary._id" :key="bestiary._id">
					<div class="tile-header">
						<h2>{{ bestiary.name }}</h2>
					</div>
					<div class="tile-content">
						<div class="tags">
							<span class="tag" v-for="tag in bestiary.tags">{{ tag }}</span>
						</div>
						<p>{{ bestiary.description }}</p>
					</div>
					<div class="tile-footer">
						<span>{{ statusEmoji(bestiary.status) }}{{ bestiary.status }}</span>
						<span role="button" @click.stop.prevent="openDeleteModal(bestiary)" class="edit-button" v-if="bestiary.owner == userData?._id">🗑️</span>
						<span class="shared-notice" v-else v-tooltip="'This bestiary has been shared with you by the owner.'">shared</span>
						<span>{{ bestiary.creatures.length }}🐉</span>
					</div>
				</RouterLink>
			</TransitionGroup>
		</div>
	</div>

	<Teleport to="#modal">
		<Transition name="modal">
			<div class="modal__bg" v-if="isDeleteModalOpen">
				<section class="modal__content modal__small" ref="deleteModal" v-if="isDeleteModalOpen">
					<button @click="isDeleteModalOpen = false" class="modal__close-button" aria-label="Close Modal" type="button"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
					<h2 class="modal-header"> Are you sure you want to delete <u> {{ selectedBestiary?.name }}</u>? </h2>
					<p class="modal-desc">Please confirm you want to permanently delete this bestiary. This action is not reversible.</p>
					<div class="modal-buttons">
						<button class="btn" @click="isDeleteModalOpen = false">Cancel</button>
						<button class="btn danger" @click.prevent="() => deleteBestiary(selectedBestiary)">Confirm</button>
					</div>
				</section>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {onClickOutside} from "@vueuse/core";
const isDeleteModalOpen = ref(false);
const deleteModal = ref<HTMLDivElement | null>(null);

const selectedBestiary =  ref<Bestiary | null>(null);
const openDeleteModal = (bestiary: Bestiary) => {
	selectedBestiary.value = bestiary;
	isDeleteModalOpen.value = true;
};
// @ts-ignore
onClickOutside(deleteModal, () => (isDeleteModalOpen.value = false));
</script>

<script lang="ts">
import {RouterLink} from "vue-router";
import {defineComponent} from "vue";
import {handleApiResponse, toast, user} from "@/main";
import type {User, Bestiary, Creature} from "@/generic/types";
import { statusEmoji } from "@/generic/displayFunctions";
import type {error} from "@/main";

export default defineComponent({
	data() {
		return {
			bestiaries: [] as Bestiary[],
			userData: null as User | null,
			deleteId: "" as string
		};
	},
	async beforeMount() {
		const loader = this.$loading.show()

		this.userData = await user;

		this.getBestiaries();
		loader.hide();
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
		async deleteBestiary(bestiary: Bestiary | null) {
			if (!bestiary) return;
			const loader = this.$loading.show()
			await fetch(`/api/bestiary/${bestiary._id}/delete`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Deleted bestiary succesfully");
				} else {
					toast.error((result.data as error).error);
				}
			});
			loader.hide()
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
	}
});
</script>

<style scoped lang="less">
@import url("@/assets/bestiary-list.less");
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

.shared-notice {
	text-decoration: underline;
}
</style>
