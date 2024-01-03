<template>
<Breadcrumbs :routes="[
	{
		path: '',
		text: 'My Bestiaries',
		isCurrent: true
	}
	]" 
>
<button @click="createBestiary" v-tooltip="'Create bestiary!'" class="inverted">
	<font-awesome-icon :icon="['fas', 'plus']" />
</button>
</Breadcrumbs>
<div class="content">
	<div class="tile-container" v-if="bestiaries">
		<TransitionGroup name="popin">
			<RouterLink class="content-tile bestiary-tile" v-for="bestiary in bestiaries" :to="'/bestiary-viewer/' + bestiary._id" :key="bestiary._id"
				:class="{'four-tall': bestiary.owner != userData?._id}">
				<div class="tile-header" >
					<h2>{{ bestiary.name }}</h2>
				</div>
				<span class="shared-notice" v-if="bestiary.owner != userData?._id">(shared)</span>
				<div class="tile-content">
					<div class="tags">
						<span class="tag" v-for="tag in bestiary.tags">{{ tag }}</span>
					</div>
					<p>{{ bestiary.description }}</p>
				</div>
				<div class="tile-footer">
					<span><StatusIcon :icon="bestiary.status" />{{ bestiary.status }}</span>
					<span role="button" @click.stop.prevent="openDeleteModal(bestiary)" class="edit-button" v-tooltip="'Delete bestiary'" v-if="bestiary.owner == userData?._id"><font-awesome-icon :icon="['fas', 'trash']" /></span>
					<span v-else>
						<UserBanner :id="bestiary.owner"/>
					</span>
					<span>{{ bestiary.creatures.length }}<font-awesome-icon :icon="['fas', 'skull']" /></span>
				</div>
			</RouterLink>

		</TransitionGroup>
	</div>
	<div v-else class="zero-found">
		<span> You do not have any bestiaries. </span>
		<button class="btn confirm" @click="createBestiary">Create a bestiary</button>
	</div>
</div>
<Modal :show="showDeleteModal" @close="showDeleteModal = false">
	<template #header>
		<h3>Are you sure you want to delete {{ selectedBestiary?.name }}</h3>
	</template>
	<template #body>
		<p class="modal-desc">Please confirm you want to permanently delete this bestiary. This action is not reversible.</p>
	</template>
	<template #footer>
		<button class="btn" @click="showDeleteModal = false">Cancel</button>
		<button class="btn danger" @click.prevent="() => deleteBestiary(selectedBestiary)">Confirm</button>
	</template>
</Modal>
</template>


<script lang="ts">
import {RouterLink} from "vue-router";
import {defineComponent} from "vue";
import {handleApiResponse, toast, user} from "@/main";
import type {User, Bestiary, Creature} from "@/generic/types";
import type {error} from "@/main";
import UserBanner from "@/components/UserBanner.vue";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import StatusIcon from "@/components/StatusIcon.vue";
import Modal from "@/components/Modal.vue";
export default defineComponent({
	components: {
		UserBanner,
		Breadcrumbs,
		StatusIcon,
		Modal
	},
	data() {
		return {
			bestiaries: [] as Bestiary[],
			userData: null as User | null,
			deleteId: "" as string,
			showDeleteModal: false,
			selectedBestiary: null as Bestiary | null
		};
	},
	async beforeMount() {
		const loader = this.$loading.show();

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
			const loader = this.$loading.show();
			await fetch(`/api/bestiary/${bestiary._id}/delete`).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Deleted bestiary succesfully");
					this.showDeleteModal = false
				} else {
					toast.error((result.data as error).error);
				}
			});
			loader.hide();
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
			///console.log(this.bestiaries);
		},
		openDeleteModal(bestiary: Bestiary) {
			this.selectedBestiary = bestiary;
			this.showDeleteModal  = true;
		}
	}
});
</script>

<style scoped lang="less">
@import url("@/assets/bestiary-list.less");
.edit-button {
	margin: auto;
	transition: all 1s ease;
	color: orangered;
	& :hover {
		transform: scale(1.1);
	}
}

.four-tall {
	grid-template-rows: 1fr .1fr 6fr 1fr
}

.shared-notice {
	margin: auto;
	color: orangered;
	translate: 0 -4px;
}
</style>
