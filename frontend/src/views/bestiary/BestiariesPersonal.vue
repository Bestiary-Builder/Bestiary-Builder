<script setup lang="ts">
import type { BestiaryExtended } from "~/shared";
import { onMounted, reactive, ref, toValue } from "vue";
import { useRouter } from "vue-router";
import { useRules } from "vuetify/labs/rules";
import CollectionTile from "@/components/Global/CollectionTile.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { VueDraggable } from "vue-draggable-plus";

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

const newBestiaryIsOpen = ref(false)
</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: '',
			text: 'My Bestiaries',
			isCurrent: true
		}
	]">
		<v-icon-btn icon="mdi:plus" label="Create new bestiary" inverted @click="newBestiaryIsOpen = true" size="24"
			v-tooltip="'Create new bestiary'" />
	</Breadcrumbs>
	<div class="content">
		<VueDraggable v-if="bestiaries.length > 0" v-model="bestiaries" :animation="150" class="tile-container"
			:handle="store.isMobile ? '.handle' : ''" @update="saveOrder">
			<RouterLink :to="`/bestiary/edit/${element.id}`" v-for="element, idx, in bestiaries">
				<CollectionTile :key="idx" :data="element" @delete-collection-item="(id) => deleteBestiary(id)" />
			</RouterLink>
		</VueDraggable>
		<div v-else class="zero-found">
			<p> You do not have any bestiaries. </p>
		</div>
		<v-fab icon="mdi:plus" location="bottom end" app color="primary" @click="newBestiaryIsOpen = true"
			size="large"></v-fab>
	</div>

	<v-dialog max-width="750" v-model="newBestiaryIsOpen">
		<v-card title="Create new bestiary" class="pa-4">
			<v-container class="pa-0">
				<v-row>
					<v-col cols="6">
						<div>
							<v-text-field v-model="createOptions.name" label="Name"
								:maxlength="store.limits?.nameLength" :min-length="store.limits?.nameMin"
								:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]" />
						</div>
					</v-col>
					<v-col cols="6">
						<div>
							<v-text-field v-model="createOptions.image" label="Image" :rules="[rules.imageLink()]"
								hide />
						</div>
					</v-col>
					<v-col cols="12">
						<v-textarea v-model="createOptions.description" :max-length="store.limits?.descriptionLength"
							:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]" label="Description"
							class="mb-4" hint="Supports Markdown" persistent-hint />
					</v-col>
					<v-col>
						<div>
							<v-select v-model="createOptions.status" label="Status"
								:items="[{ value: 'private', title: 'Private' }, { value: 'unlisted', title: 'Unlisted' }, { value: 'public', title: 'Public' }]" />
						</div>
					</v-col>
					<v-col>
						<div>
							<v-select v-model="createOptions.tags" multiple :items="store.tags || []" label="Tags" chips
								closable-chips />
						</div>
					</v-col>
				</v-row>
			</v-container>



			<v-card-actions>
				<v-spacer />
				<v-btn text="Create" color="success" size="large" @click="createBestiary" />
				<v-btn text="Close" size="large" @click="newBestiaryIsOpen = false; resetCreateInput()" />
			</v-card-actions>
		</v-card>
	</v-dialog>

</template>
