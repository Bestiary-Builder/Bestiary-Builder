<script setup lang="ts">
import type { AutomationCollectionExtended } from "~/shared";
import { onMounted, reactive, ref, toValue } from "vue";
import { useRouter } from "vue-router";
import Draggable from "vuedraggable";
import CollectionTile from "@/components/Global/CollectionTile.vue";
import { getUmami } from "@/utils/app/analytics";
import { $toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { useRules } from "vuetify/labs/rules";

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
	createOptions.tags = []
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

const statusOptions = [
	{ title: 'Private', value: 'private' },
	{ title: 'Unlisted', value: 'unlisted' },
	{ title: 'Public', value: 'public' },
]

const rules = useRules()
</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: '',
			text: 'My Automation Collections',
			isCurrent: true
		}
	]">
		<v-dialog max-width="500">
			<template #activator="{ props: activatorProps }">
				<v-icon-btn icon="mdi:plus" v-bind="activatorProps" size="24" />
			</template>

			<template #default="{ isActive }">
				<v-card title="Create new automation collection">
					<v-card-text>
						<v-text-field v-model="createOptions.name" label="Name" :maxlength="store.limits?.nameLength"
							:min-length="store.limits?.nameMin"
							:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]" />
						<v-textarea v-model="createOptions.description" :max-length="store.limits?.descriptionLength"
							:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]" label="Description"
							counter />
						<div class="grid-two">
							<div>
								<v-select v-model="createOptions.status" label="Status" :items="statusOptions" />
							</div>
							<v-select v-model="createOptions.tags" multiple :items="store.automationTags || []"
								label="Tags" chips closable-chips />
						</div>
					</v-card-text>
					<v-card-actions>
						<v-spacer />
						<v-btn @click="resetCreateInput(); isActive.value = false">
							Cancel
						</v-btn>
						<v-btn color="green" @click="createAutomationCollection">
							Create
						</v-btn>
					</v-card-actions>
				</v-card>
			</template>
		</v-dialog>
	</Breadcrumbs>
	<div class="content">
		<Draggable :key="Math.random()" :list="automationCollections" :animation="150" :item-key="getDraggableKey"
			class="tile-container" :handle="store.isMobile ? '.handle' : ''" @change="saveOrder">
			<template #item="{ element, idx }">
				<RouterLink :to="`/automations/edit/${element.id}`">
					<CollectionTile :key="idx" :data="element"
						@delete-collection-item="(id) => deleteAutomationCollection(id)" />
				</RouterLink>
			</template>
		</Draggable>
	</div>
</template>

<style lang="less" scoped>
.modal-desc {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}
</style>
