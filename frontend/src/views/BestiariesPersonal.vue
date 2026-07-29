<script setup lang="ts">
import type { BestiaryExtended } from "~/shared";
import { onMounted, reactive, ref, toValue } from "vue";
import { useRouter } from "vue-router";
import BestiaryList from "@/components/Bestiary/BestiaryList.vue";
import ButtonIcon from "@/components/Global/ButtonIcon.vue";
import Modal from "@/components/Global/Modal.vue";
import Breadcrumbs from "@/components/Page/Breadcrumbs.vue";
import { getUmami } from "@/utils/app/analytics";
import { $loading } from "@/utils/app/loading";
import { $toast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";
import { store } from "@/utils/store";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";

const router = useRouter();

onMounted(async () => {
	const loader = $loading.show();
	await getBestiaries();

	loader.hide();
});

const bestiaries = ref<BestiaryExtended[]>([]);

const getBestiaries = async () => {
	const { success, data, error } = await useFetch(`/api/my-bestiaries`);
	if (success) {
		bestiaries.value = data as BestiaryExtended[];
	}
	else {
		bestiaries.value = [];
		$toast.error(error);
	}
};

const showCreateModal = ref(false)
const createOptions = reactive({
    name: "",
    description: "",
    status: "unlisted"
})

const resetCreateInput = () => {
    createOptions.name = ""
    createOptions.description = ""
    createOptions.status = "unlisted"
}

const createBestiary = async () => {
	// Send data to server
	const { success, data, error } = await useFetch<BestiaryExtended>("/api/bestiary/add", "POST", toValue(createOptions));
	if (success) {
		$toast.success("Created bestiary");
		void getUmami()?.track("Add bestiary");
		await router.push(`/bestiary/edit/${data.id.toString()}`);
	}
	else {
		$toast.error(error);
	}
	await getBestiaries();
};

const cancelCreate = () => {
    showCreateModal.value = false;
    resetCreateInput()
}

const deleteBestiary = async (bestiary: BestiaryExtended | null) => {
	if (!bestiary)
		return;
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/bestiary/${bestiary.id.toString()}/delete`);
	if (success) {
		$toast.success("Deleted bestiary succesfully");
		void getUmami()?.track("Delete bestiary");
		showDeleteModal.value = false;
	}
	else {
		$toast.error(error);
	}
	loader.hide();
	await getBestiaries();
};

const showDeleteModal = ref(false);
const selectedBestiary = ref<BestiaryExtended | null>(null);
const openDeleteModal = (bestiary: BestiaryExtended) => {
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
		<ButtonIcon icon="plus" label="Create bestiary!" inverted @click="showCreateModal = true" />
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

		<Modal :show="showCreateModal" @close="showCreateModal = false">
		<template #header>
			Create new bestiary
		</template>
		<template #body>
			<div class="modal-desc">
				<LabelledComponent title="Name">
                    <input type="text" :maxlength="store.limits?.nameLength" :minlength="store.limits?.nameMin" v-model="createOptions.name" />
                </LabelledComponent>
                <LabelledComponent title="Description">
                    <input type="text" :maxlength="store.limits?.descriptionLength" :minlength="store.limits?.nameMin" v-model="createOptions.description" />
                </LabelledComponent>
                <LabelledComponent title="Status">
                    <select v-model="createOptions.status">
                        <option value="private">
                            Private
                        </option>
                        <option value="unlisted">
                            Unlisted
                        </option>
                        <option value="public">
                            Public
                        </option>
                    </select>
                </LabelledComponent>
			</div>
		</template>
		<template #footer>
		<button class="btn confirm" @click="createBestiary">
            Create
        </button>
        <button class="btn" @click="cancelCreate">
            Cancel
        </button>
		</template>
	</Modal>

</template>

<style scoped>
.modal-desc {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}
</style>