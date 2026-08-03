<script setup lang="ts">
import type { AutomationCollectionExtended } from "~/shared";
import { onMounted, reactive, ref, toValue } from "vue";
import { useRouter } from "vue-router";
import Draggable from "vuedraggable";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import ButtonIcon from "@/components/Global/ButtonIcon.vue";
import CollectionTile from "@/components/Global/CollectionTile.vue";
import Modal from "@/components/Global/Modal.vue";
import Breadcrumbs from "@/components/Page/Breadcrumbs.vue";
import { getUmami } from "@/utils/app/analytics";
import { $toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

const $router = useRouter();
const automationCollections = ref<AutomationCollectionExtended[]>();
const getMyCollections = async () => {
	const { success, data, error } = await useFetch<AutomationCollectionExtended[]>(`/api/automation-collection/personal`);
	if (success)
		automationCollections.value = data;
	else $toast.error(error);
	console.log(success, data, error);
};

const showCreateModal = ref(false);
const createOptions = reactive({
	name: "",
	description: "",
	status: "unlisted",
	image: "",
	tags: []
});

const resetCreateInput = () => {
	createOptions.name = "";
	createOptions.description = "";
	createOptions.status = "unlisted";
};
const createAutomationCollection = async () => {
	const { success, data, error } = await useFetch<AutomationCollectionExtended>("/api/automation-collection/add", "POST", toValue(createOptions));

	if (success) {
		$toast.success("Created automation collection");
		void getUmami()?.track("Add automation collection");
		showCreateModal.value = false;
		resetCreateInput();
		// await $router.push(`/bestiary/edit/${data.id.toString()}`);
	}
	else {
		$toast.error(error);
		if (error.includes("includes blocked words or phrases"))
			void getUmami()?.track("Blocked words", { error });
	}

	await getMyCollections();
};

const cancelCreate = () => {
	showCreateModal.value = false;
	resetCreateInput();
};

onMounted(async () => {
	await getMyCollections();
});

const deleteAutomationCollection = async (id: AutomationCollectionExtended["id"]) => {
	const { success, error } = await useFetch<AutomationCollectionExtended>(`/api/automation-collection/${id}/delete`, "POST");

	if (success) {
		$toast.success("Successfully deleted automation collection");
		getUmami()?.track("Delete automation collection");
		await getMyCollections();
	}
	else {
		$toast.error(error);
	}
};

const getDraggableKey = (item: any) => {
	return item;
};

const saveOrder = async () => {
	if (!automationCollections.value)
		return;
	const orderIds = automationCollections.value.map(coll => coll.id);
	await useFetch("/api/automation-collection/order", "POST", orderIds);
};
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'My Automation Collections',
				isCurrent: true
			}
		]"
	>
		<ButtonIcon icon="plus" label="Create bestiary!" inverted @click="showCreateModal = true" />
		<ButtonIcon icon="arrow-right-from-bracket" label="Export all automations to your clipboard" />
	</Breadcrumbs>
	<div class="content">
		<Draggable :key="Math.random()" :list="automationCollections" :animation="150" :item-key="getDraggableKey" class="tile-container" :handle=" store.isMobile ? '.handle' : ''" @change="saveOrder">
			<template #item="{ element, idx }">
				<RouterLink :to="`/automations/edit/${element.id}`">
					<CollectionTile :key="idx" :data="element" @delete-collection-item="(id) => deleteAutomationCollection(id)" />
				</RouterLink>
			</template>
		</Draggable>
	</div>
	<Modal :show="showCreateModal" @close="showCreateModal = false">
		<template #header>
			Create new automation collection
		</template>
		<template #body>
			<p class="modal-desc">
				<LabelledComponent title="Name">
					<input v-model="createOptions.name" type="text" :maxlength="store.limits?.nameLength" :minlength="store.limits?.nameMin">
				</LabelledComponent>
				<LabelledComponent title="Description">
					<input v-model="createOptions.description" type="text" :maxlength="store.limits?.descriptionLength" :minlength="store.limits?.nameMin">
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
			</p>
		</template>
		<template #footer>
			<button class="btn confirm" @click="createAutomationCollection">
				Create
			</button>
			<button class="btn" @click="cancelCreate">
				Cancel
			</button>
		</template>
	</Modal>
</template>

<style lang="less" scoped>
.modal-desc {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}
</style>
