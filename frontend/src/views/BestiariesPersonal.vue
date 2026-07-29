<script setup lang="ts">
import type { BestiaryExtended } from "~/shared";
import { onMounted, reactive, ref, toValue } from "vue";
import { useRouter } from "vue-router";
import ButtonIcon from "@/components/Global/ButtonIcon.vue";
import Modal from "@/components/Global/Modal.vue";
import Breadcrumbs from "@/components/Page/Breadcrumbs.vue";
import { getUmami } from "@/utils/app/analytics";
import { $loading } from "@/utils/app/loading";
import { $toast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";
import { store } from "@/utils/store";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import CollectionTile from "@/components/Global/CollectionTile.vue";
import Draggable from "vuedraggable";

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

const deleteBestiary = async (id: BestiaryExtended["id"]) => {
	if (!id)
		return;
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/bestiary/${id}/delete`);
	if (success) {
		$toast.success("Deleted bestiary succesfully");
		getUmami()?.track("Delete bestiary");
	}
	else {
		$toast.error(error);
	}
	loader.hide();
	await getBestiaries();
};

const saveOrder = async () => {
    if (!bestiaries.value) return
	const orderIds = bestiaries.value.map(coll => coll.id);
	await useFetch("/api/my-bestiaries/order", "POST", orderIds);
};

const getDraggableKey = (item: any) => {
	return item;
};

</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: '',
			text: 'My Bestiaries',
			isCurrent: true
		}
	]">
		<ButtonIcon icon="plus" label="Create bestiary!" inverted @click="showCreateModal = true" />
	</Breadcrumbs>
	<div class="content">
		<Draggable :key="Math.random()" :list="bestiaries" :animation="150" :item-key="getDraggableKey"
			class="tile-container" :handle="store.isMobile ? '.handle' : ''" @change="saveOrder" v-if="bestiaries">
			<template #item="{ element, idx }">
				<RouterLink :to="`/bestiary/edit/${element.id}`">
					<CollectionTile :data="element" :key="idx" @delete-collection-item="(id) => deleteBestiary(id)" />
				</RouterLink>
			</template>
		</Draggable>
		<div v-else class="zero-found">
			<span> You do not have any bestiaries. </span>
			<button class="btn confirm" @click="createBestiary">
				Create a bestiary
			</button>
		</div>
	</div>

	<Modal :show="showCreateModal" @close="showCreateModal = false">
		<template #header>
			Create new bestiary
		</template>
		<template #body>
			<div class="modal-desc">
				<LabelledComponent title="Name">
					<input type="text" :maxlength="store.limits?.nameLength" :minlength="store.limits?.nameMin"
						v-model="createOptions.name" />
				</LabelledComponent>
				<LabelledComponent title="Description">
					<input type="text" :maxlength="store.limits?.descriptionLength"
						v-model="createOptions.description" />
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
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
</template>

<style scoped>
.modal-desc {
	display: flex;
	flex-direction: column;
	gap: .5rem;
}
</style>