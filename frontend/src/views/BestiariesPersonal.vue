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
import CollectionTile from "@/components/Global/CollectionTile.vue";
import Draggable from "vuedraggable";
import { useRules } from 'vuetify/labs/rules'

const rules = useRules()

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
	status: "unlisted",
	tags: [],
	image: ""
})

const resetCreateInput = () => {
	createOptions.name = ""
	createOptions.description = ""
	createOptions.status = "unlisted",
		createOptions.tags = []
	createOptions.image = ""
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
		<!-- <ButtonIcon icon="plus" label="Create new bestiary" inverted @click="showCreateModal = true" /> -->
		<v-dialog max-width="750">
			<template v-slot:activator="{ props: activatorProps }">
				<ButtonIcon icon="plus" label="Create new bestiary" inverted v-bind="activatorProps" />
			</template>

			<template v-slot:default="{ isActive }">
				<v-card title="Create new bestiary">
					<v-sheet class="pa-4" max-width="1800" rounded="lg" width="100%">
						<v-form>
							<v-text-field v-model="createOptions.name" label="Name"
								:maxlength="store.limits?.nameLength" :minLength="store.limits?.nameMin"
								:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]"
								class="mb-4" />
							<v-textarea v-model="createOptions.description" :maxLength="store.limits?.descriptionLength"
								:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]" label="Description"
								class="mb-4" hint="Supports Markdown" persistent-hint/>
							<div class="grid-two" counter>
								<div>
									<v-select label="Status" v-model="createOptions.status"
										:items="[{ value: 'private', title: 'Private' }, { value: 'unlisted', title: 'Unlisted' }, { value: 'public', title: 'Public' }]" />
								</div>
								<v-select multiple :items="store.tags || []" v-model="createOptions.tags" label="Tags"
									chips closable-chips />
							</div>
						</v-form>
					</v-sheet>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text="Create" @click="createBestiary" color="green" size="large" />
						<v-btn text="Close" @click="isActive.value = false; resetCreateInput()" size="large" />
					</v-card-actions>
				</v-card>
			</template>
		</v-dialog>

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
				<v-form>
					<v-text-field v-model="createOptions.name" label="Name" :maxlength="store.limits?.nameLength"
						:minLength="store.limits?.nameMin"
						:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]" />
					<v-textarea v-model="createOptions.description" :maxLength="store.limits?.descriptionLength"
						:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]" label="Description" />
					<div class="grid-two">
						{{ createOptions.status }}
						<v-select label="Status" v-model="createOptions.status"
							:items="['Private', 'Unlisted', 'Public']"></v-select>
						<v-select multiple :items="store.tags || []" v-model="createOptions.tags" label="Tags" chips
							closable-chips />
					</div>
				</v-form>

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