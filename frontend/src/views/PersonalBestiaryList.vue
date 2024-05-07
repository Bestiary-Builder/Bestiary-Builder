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
		<BestiaryList :personal="true" :bestiaries v-if="bestiaries" @delete-bestiary="openDeleteModal"></BestiaryList>
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
import Modal from "@/components/Modal.vue";
import BestiaryList from "@/components/BestiaryList.vue";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";

import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";

import {toast, loadingOptions} from "@/main";
import type {Bestiary} from "~/shared";
import {useFetch} from "@/utils/utils";
import {useLoading} from "vue-loading-overlay";

const $loading = useLoading(loadingOptions);
const router = useRouter();

onMounted(async () => {
	const loader = $loading.show();
	getBestiaries();

	loader.hide();
});

const bestiaries = ref<Bestiary[]>([]);

const getBestiaries = async () => {
	const {success, data, error} = await useFetch(`/api/my-bestiaries`);
	if (success) bestiaries.value = data as Bestiary[];
	else {
		bestiaries.value = [];
		toast.error(error);
	}
};

const createBestiary = async () => {
	//Send data to server
	const {success, data, error} = await useFetch<Bestiary>("/api/bestiary/add", "POST", {
		name: "New bestiary",
		description: "",
		status: "private",
		creatures: []
	});
	if (success) {
		toast.success("Created bestiary");
		router.push("/bestiary-viewer/" + data._id);
	} else {
		toast.error(error);
	}
	await getBestiaries();
};

const deleteBestiary = async (bestiary: Bestiary | null) => {
	if (!bestiary) return;
	const loader = $loading.show();
	const {success, error} = await useFetch(`/api/bestiary/${bestiary._id}/delete`);
	if (success) {
		toast.success("Deleted bestiary succesfully");
		showDeleteModal.value = false;
	} else {
		toast.error(error);
	}
	loader.hide();
	await getBestiaries();
};

const showDeleteModal = ref(false);
const selectedBestiary = ref<Bestiary | null>(null);
const openDeleteModal = (bestiary: Bestiary) => {
	selectedBestiary.value = bestiary;
	showDeleteModal.value = true;
};
</script>
