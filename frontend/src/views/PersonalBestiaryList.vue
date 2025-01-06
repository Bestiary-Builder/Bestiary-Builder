<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { toast } from "vue-sonner";
import Modal from "@/components/Modal.vue";
import BestiaryList from "@/components/BestiaryList.vue";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";

import type { Bestiary } from "~/shared";
import { useFetch } from "@/utils/utils";
import { $loading } from "@/utils/app/loading";

const router = useRouter();

onMounted(async () => {
	const loader = $loading.show();
	await getBestiaries();

	loader.hide();
});

const bestiaries = ref<Bestiary[]>([]);

const getBestiaries = async () => {
	const { success, data, error } = await useFetch<Bestiary[]>(`/api/my-bestiaries`);
	if (success) {
		bestiaries.value = data;
	}
	else {
		bestiaries.value = [];
		toast.error(error);
	}
};

const createBestiary = async () => {
	// Send data to server
	const { success, data, error } = await useFetch<Bestiary>("/api/bestiary/add", "POST", {
		name: "New bestiary",
		description: "",
		status: "private",
		creatures: []
	});
	if (success) {
		toast.success("Successfully created bestiary.");
		await router.push(`/bestiary-viewer/${data._id?.toString()}`);
	}
	else {
		toast.error(error);
	}
	await getBestiaries();
};

const deleteBestiary = async (bestiary: Bestiary | null) => {
	if (!bestiary)
		return;
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/bestiary/${bestiary._id?.toString()}/delete`);
	if (success) {
		toast.success("Deleted the bestiary succesfully.");
		showDeleteModal.value = false;
	}
	else {
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
		<button v-tooltip="'Create bestiary!'" class="inverted" aria-label="Create bestiary" @click="createBestiary">
			<font-awesome-icon :icon="['fas', 'plus']" />
		</button>
	</Breadcrumbs>
	<div class="content">
		<BestiaryList v-if="bestiaries" :personal="true" :bestiaries @delete-bestiary="openDeleteModal" />
		<div v-else class="zero-found">
			<span> You do not have any bestiaries. </span>
			<button class="btn confirm" @click="createBestiary">
				Create a bestiary
			</button>
		</div>
	</div>
	<Modal :show="showDeleteModal" @close="showDeleteModal = false">
		<template #header>
			Are you sure you want to delete {{ selectedBestiary?.name }}
		</template>
		<template #body>
			<p class="modal-desc">
				Please confirm you want to permanently delete this bestiary. This action is not reversible.
			</p>
		</template>
		<template #footer>
			<button class="btn" @click="showDeleteModal = false">
				Cancel
			</button>
			<button class="btn danger" @click.prevent="() => deleteBestiary(selectedBestiary)">
				Confirm
			</button>
		</template>
	</Modal>
</template>
