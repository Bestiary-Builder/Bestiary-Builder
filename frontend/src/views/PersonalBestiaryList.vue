<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'My Bestiaries',
				isCurrent: true
			}
		]"
	>
		<button @click="createBestiary" v-tooltip="'Create bestiary!'" class="inverted" aria-label="Create bestiary">
			<font-awesome-icon :icon="['fas', 'plus']" />
		</button>
	</Breadcrumbs>
	<div class="content">
		<div class="tile-container" v-if="bestiaries">
			<TransitionGroup name="popin">
				<RouterLink class="content-tile bestiary-tile" v-for="(bestiary, index) in bestiaries" :to="'/bestiary-viewer/' + bestiary._id" :key="bestiary._id?.toString()" :class="{'four-tall': bestiary.owner != user?._id}" :aria-label="`Open Bestiary ${bestiary.name}`">
					<div class="tile-header">
						<h2>{{ bestiary.name }}</h2>
					</div>
					<span class="shared-notice" v-if="bestiary.owner != user?._id">(shared)</span>
					<div class="tile-content" :class="{'tile-has-image': bestiaryImages[index]}">
						<img class="tile-image" v-if="bestiaryImages[index]" :src="bestiaryImages[index]" />
						<div class="tags">
							{{ bestiary.tags.join(", ") }}
						</div>
						<p class="description">{{ bestiary.description }}</p>
					</div>
					<div class="tile-footer">
						<span v-tooltip.left="bestiary.status"><StatusIcon :icon="bestiary.status" /></span>
						<span role="button" @click.stop.prevent="openDeleteModal(bestiary)" class="edit-button" v-tooltip="'Delete bestiary'" v-if="bestiary.owner == user?._id" aria-label="Delete bestiary"><font-awesome-icon :icon="['fas', 'trash']" /></span>
						<span v-else>
							<UserBanner :id="bestiary.owner" />
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
		<template #header>Are you sure you want to delete {{ selectedBestiary?.name }}</template>
		<template #body>
			<p class="modal-desc">Please confirm you want to permanently delete this bestiary. This action is not reversible.</p>
		</template>
		<template #footer>
			<button class="btn" @click="showDeleteModal = false">Cancel</button>
			<button class="btn danger" @click.prevent="() => deleteBestiary(selectedBestiary)">Confirm</button>
		</template>
	</Modal>
</template>

<script setup lang="ts">
import UserBanner from "@/components/UserBanner.vue";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import StatusIcon from "@/components/StatusIcon.vue";
import Modal from "@/components/Modal.vue";

import {RouterLink, useRouter} from "vue-router";
import {onMounted, ref, computed} from "vue";

import {toast, loadingOptions} from "@/main";
import type {User, Bestiary, Id} from "~/shared";
import {type error, handleApiResponse, user as getUser} from "@/utils/functions";
import {useLoading} from "vue-loading-overlay";

const $loading = useLoading(loadingOptions);
const router = useRouter();
const user = ref<User | null>(null);

onMounted(async () => {
	const loader = $loading.show();
	getBestiaries();
	user.value = await getUser;

	loader.hide();
});

const bestiaries = ref<Bestiary[]>([]);

const getBestiaries = async () => {
	await fetch(`/api/my-bestiaries`).then(async (response) => {
		let result = await handleApiResponse<Bestiary[]>(response);
		if (result.success) bestiaries.value = result.data as Bestiary[];
		else {
			bestiaries.value = [];
			toast.error((result.data as error).error);
		}
	});
};

const createBestiary = async () => {
	//Replace for actual creation data:
	let data = {
		name: "New bestiary",
		description: "",
		status: "private",
		creatures: [] as Id[]
	} as Bestiary;
	//Send data to server
	await fetch("/api/bestiary/add", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({data: data})
	}).then(async (response) => {
		let result = await handleApiResponse<Bestiary>(response);
		if (result.success) {
			toast.success("Created bestiary");
			router.push("/bestiary-viewer/" + (result.data as Bestiary)._id);
		} else {
			toast.error((result.data as error).error);
		}
	});
	await getBestiaries();
};

const deleteBestiary = async (bestiary: Bestiary | null) => {
	if (!bestiary) return;
	const loader = $loading.show();
	await fetch(`/api/bestiary/${bestiary._id}/delete`).then(async (response) => {
		let result = await handleApiResponse(response);
		if (result.success) {
			toast.success("Deleted bestiary succesfully");
			showDeleteModal.value = false;
		} else {
			toast.error((result.data as error).error);
		}
	});
	loader.hide();
	await getBestiaries();
};

const showDeleteModal = ref(false);
const selectedBestiary = ref<Bestiary | null>(null);
const openDeleteModal = (bestiary: Bestiary) => {
	selectedBestiary.value = bestiary;
	showDeleteModal.value = true;
};

const bestiaryImages = computed(() => {
	let bestiaryImages: string[] = [];
	for (let bestiary of bestiaries.value) {
		const match = bestiary.description.match(/\!\[.*?\]\((.*?)\)/);
		const firstImageUrl = (match || [])[1];
		if (match) bestiary.description = bestiary.description.replace(match[0], "");
		bestiaryImages.push(firstImageUrl);
	}
	return bestiaryImages;
});
</script>

<style scoped lang="less">
@import url("@/assets/styles/bestiary-list.less");
.edit-button {
	margin: auto;
	color: orangered;
	.scale-on-hover(1.2);
}

.four-tall {
	grid-template-rows: 1fr 0.1fr 6fr 1fr;
}

.shared-notice {
	margin: auto;
	color: orangered;
	translate: 0 -4px;
}
</style>
