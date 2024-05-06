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
import Breadcrumbs from "@/components/Breadcrumbs.vue";

import {useRouter} from "vue-router";
import {onMounted, ref, computed} from "vue";

import {toast, loadingOptions} from "@/main";
import type {User, Bestiary, Id} from "~/shared";
import {user as getUser, fetchBackend} from "@/utils/functions";
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
	await fetchBackend(`/api/my-bestiaries`).then(async (result) => {
		if (result.success) bestiaries.value = result.data as Bestiary[];
		else {
			bestiaries.value = [];
			toast.error(result.error);
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
	await fetchBackend<Bestiary>("/api/bestiary/add", "POST", data).then(async (result) => {
		if (result.success) {
			toast.success("Created bestiary");
			router.push("/bestiary-viewer/" + result.data._id);
		} else {
			toast.error(result.error);
		}
	});
	await getBestiaries();
};

const deleteBestiary = async (bestiary: Bestiary | null) => {
	if (!bestiary) return;
	const loader = $loading.show();
	await fetchBackend(`/api/bestiary/${bestiary._id}/delete`).then(async (result) => {
		if (result.success) {
			toast.success("Deleted bestiary succesfully");
			showDeleteModal.value = false;
		} else {
			toast.error(result.error);
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
