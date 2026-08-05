<script setup lang="ts">
import type { BestiaryExtended } from "~/shared";
import { onMounted, reactive, ref, toValue } from "vue";
import { useRouter } from "vue-router";
import Draggable from "vuedraggable";
import { useRules } from "vuetify/labs/rules";
import CollectionTile from "@/components/Global/CollectionTile.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

const rules = useRules();
const router = useRouter();
const { addToast, updateToast, removeToast } = useToast()

onMounted(async () => {
	await getBestiaries();
});

const bestiaries = ref<BestiaryExtended[]>([]);

const getBestiaries = async (shouldNotify = true) => {
	const toastId = addToast("Loading...", { loading: true, show: shouldNotify })
	const { success, data, error } = await useFetch(`/api/my-bestiaries`);
	if (success) {
		removeToast(toastId)
		bestiaries.value = data as BestiaryExtended[];
	}
	else {
		bestiaries.value = [];
		updateToast(toastId, { text: error, color: "error" });
	}
};

const createOptions = reactive({
	name: "",
	description: "",
	status: "unlisted",
	tags: [],
	image: ""
});

const resetCreateInput = () => {
	createOptions.name = "";
	createOptions.description = "";
	createOptions.status = "unlisted";
	createOptions.tags = [];
	createOptions.image = "";
};

const createBestiary = async () => {
	// Send data to server
	const { success, data, error } = await useFetch<BestiaryExtended>("/api/bestiary/add", "POST", toValue(createOptions));
	if (success) {
		addToast("Created bestiary");
		void getUmami()?.track("Add bestiary");
		await router.push(`/bestiary/edit/${data.id.toString()}`);
	}
	else {
		addToast(error, { color: "error" });
	}
};

const deleteBestiary = async (id: BestiaryExtended["id"]) => {
	if (!id)
		return;
	const { success, error } = await useFetch(`/api/bestiary/${id}/delete`);
	if (success) {
		addToast("Deleted bestiary succesfully", { color: "success" });
		getUmami()?.track("Delete bestiary");
	}
	else {
		addToast(error, { color: "error" });
	}
	await getBestiaries(false);
};

const saveOrder = async () => {
	if (!bestiaries.value)
		return;
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
		<v-dialog max-width="750">
			<template #activator="{ props: activatorProps }">
				<v-icon-btn icon="mdi:plus" label="Create new bestiary" inverted v-bind="activatorProps" size="24" />
			</template>

			<template #default="{ isActive }">
				<v-card title="Create new bestiary">
					<v-sheet class="pa-4" max-width="1800" rounded="lg" width="100%">
						<v-form>
							<div class="grid-two">
								<v-text-field v-model="createOptions.name" label="Name"
									:maxlength="store.limits?.nameLength" :min-length="store.limits?.nameMin"
									:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]"
									class="mb-4" />
								<v-text-field v-model="createOptions.image" label="Image" class="mb-4" />
							</div>

							<v-textarea v-model="createOptions.description"
								:max-length="store.limits?.descriptionLength"
								:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]" label="Description"
								class="mb-4" hint="Supports Markdown" persistent-hint />
							<div class="grid-two" counter>
								<div>
									<v-select v-model="createOptions.status" label="Status"
										:items="[{ value: 'private', title: 'Private' }, { value: 'unlisted', title: 'Unlisted' }, { value: 'public', title: 'Public' }]" />
								</div>
								<v-select v-model="createOptions.tags" multiple :items="store.tags || []" label="Tags"
									chips closable-chips />
							</div>
						</v-form>
					</v-sheet>
					<v-card-actions>
						<v-spacer />
						<v-btn text="Create" color="green" size="large" @click="createBestiary" />
						<v-btn text="Close" size="large" @click="isActive.value = false; resetCreateInput()" />
					</v-card-actions>
				</v-card>
			</template>
		</v-dialog>
	</Breadcrumbs>
	<div class="content">
		<Draggable v-if="bestiaries" :key="Math.random()" :list="bestiaries" :animation="150"
			:item-key="getDraggableKey" class="tile-container" :handle="store.isMobile ? '.handle' : ''"
			@change="saveOrder">
			<template #item="{ element, idx }">
				<RouterLink :to="`/bestiary/edit/${element.id}`">
					<CollectionTile :key="idx" :data="element" @delete-collection-item="(id) => deleteBestiary(id)" />
				</RouterLink>
			</template>
		</Draggable>
		<div v-else class="zero-found">
			<span> You do not have any bestiaries. </span>
			<v-btn class="btn confirm" @click="createBestiary">
				Create a bestiary
			</v-btn>
		</div>
	</div>
</template>
