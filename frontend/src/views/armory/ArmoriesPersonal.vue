<script setup lang="ts">
import type { AutomationCollectionExtended } from "~/shared";
import { onMounted, reactive, ref, toValue } from "vue";
import { useRouter } from "vue-router";
import Draggable from "vuedraggable";
import CollectionTile from "@/components/Global/CollectionTile.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { useRules } from "vuetify/labs/rules";

const $router = useRouter();
const { addToast } = useToast()

const automationCollections = ref<AutomationCollectionExtended[]>();
const getMyCollections = async () => {
	const { success, data, error } = await useFetch<AutomationCollectionExtended[]>(`/api/automation-collection/personal`);
	if (success)
		automationCollections.value = data;
	else addToast(error, { color: "error" });

	console.log(success, data, error);
};

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
		addToast("Created automation collection", { color: "success" });
		void getUmami()?.track("Add automation collection");
		newCollectionIsOpen.value = false;
		resetCreateInput();

	}
	else {
		addToast(error, { color: "error" });

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
		addToast("Deleted automation collection");
		getUmami()?.track("Delete automation collection");
		await getMyCollections();
	}
	else {
		addToast(error, { color: "error" });
		;
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

const rules = useRules()

const newCollectionIsOpen = ref(false)
</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: '',
			text: 'My Automation Collections',
			isCurrent: true
		}
	]">
		<v-dialog max-width="750" v-model="newCollectionIsOpen">
			<template #activator="{ props: activatorProps }">
				<v-icon-btn icon="mdi:plus" label="Create new Automation Collection" inverted v-bind="activatorProps"
					size="24" v-tooltip="'Create new Automation Collection'" />
			</template>

			<template #default="{ isActive }">
				<v-card title="Create new Automation Collection" class="pa-4">
					<v-container class="pa-0">
						<v-row>
							<v-col>
								<div>
									<v-text-field v-model="createOptions.name" label="Name"
										:maxlength="store.limits?.nameLength" :min-length="store.limits?.nameMin"
										:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]"
										class="mb-4" />
								</div>
							</v-col>
							<v-col>
								<div>
									<v-text-field v-model="createOptions.image" label="Image" class="mb-4"
										:rules="[rules.imageLink()]" />
								</div>
							</v-col>
						</v-row>
					</v-container>

					<v-textarea v-model="createOptions.description" :max-length="store.limits?.descriptionLength"
						:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]" label="Description"
						class="mb-4" hint="Supports Markdown" persistent-hint />

					<v-container class="pa-0">
						<v-row>
							<v-col>
								<div>
									<v-select v-model="createOptions.status" label="Status"
										:items="[{ value: 'private', title: 'Private' }, { value: 'unlisted', title: 'Unlisted' }, { value: 'public', title: 'Public' }]" />
								</div>
							</v-col>
							<v-col>
								<div>
									<v-select v-model="createOptions.tags" multiple :items="store.tags || []"
										label="Tags" chips closable-chips />
								</div>
							</v-col>
						</v-row>
					</v-container>

					<v-card-actions>
						<v-spacer />
						<v-btn text="Create" color="success" size="large" @click="createAutomationCollection" />
						<v-btn text="Close" size="large" @click="isActive.value = false; resetCreateInput()" />
					</v-card-actions>
				</v-card>
			</template>
		</v-dialog>
	</Breadcrumbs>
	<div class="content">
		<Draggable :key="Math.random()" :list="automationCollections" :animation="150" :item-key="getDraggableKey"
			class="tile-container" :handle="store.isMobile ? '.handle' : ''" @change="saveOrder">
			<template #item="{ element, idx }">
				<RouterLink :to="`/armory/edit/${element.id}`">
					<CollectionTile :key="idx" :data="element"
						@delete-collection-item="(id) => deleteAutomationCollection(id)" />
				</RouterLink>
			</template>
		</Draggable>
		<v-fab icon="mdi:plus" location="bottom end" app color="primary" @click="newCollectionIsOpen = true"
			size="large"></v-fab>
	</div>
</template>
