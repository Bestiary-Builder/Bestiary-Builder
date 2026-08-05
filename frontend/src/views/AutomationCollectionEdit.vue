<script setup lang="ts">
import type { AttackModel, AutomationCollectionExtended, AutomationWithType } from "~/shared";
import { onMounted, onUnmounted, reactive, ref, toValue, watch } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import Draggable from "vuedraggable";
import YAML from "yaml";
import Markdown from "@/components/Global/Markdown.vue";
import { getUmami } from "@/utils/app/analytics";
import { $loading } from "@/utils/app/loading";
import { $toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { useHotkey } from "vuetify";

const $route = useRoute();
const data = ref<AutomationWithType[]>([]);
const collection = ref<AutomationCollectionExtended | null>(null);
let initialData = "";
// get our data
onMounted(async () => {
	const loader = $loading.show();
	const { success, data, error } = await useFetch<AutomationCollectionExtended>(`/api/automation-collection/${$route.params.id}`);

	if (success) {
		collection.value = data;
		setSettingInputs();
	}
	else {
		addToast(error, { color: "error" });
		;
	}

	await getAutomations();
	loader.hide();
});

const activeAttackIndex = ref(-1);

const addAttack = async (name: string, automation: null | AttackModel | AttackModel[], shouldNotify = true, description = "") => {
	if (!collection.value)
		return;
	if (name === "New Automation") {
		$toast.warning("Automation must have a non-default name!");
		return;
	}
	const loader = $loading.show();
	const { success, error } = await useFetch<AutomationWithType>(`/api/automation/add`, "POST", { name, automation, description, collectionId: collection.value.id });
	if (success) {
		await getAutomations();
		if (shouldNotify)
			$toast.success(`Successfully added automation: ${name}`);
		activeAttackIndex.value = data.value.length - 1;
		getUmami()?.track("Add automation");
	}
	else {
		addToast(error, { color: "error" });
		;
		if (error.includes("includes blocked words or phrases"))
			void getUmami()?.track("Blocked words", { error });
	}
	loader.hide();
};

const deleteAutomation = async () => {
	const _id = data.value[activeAttackIndex.value].id;
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/automation/${_id.toString()}/delete`);
	if (success) {
		$toast.success("Successfully deleted the automation!");
		void getUmami()?.track("Delete automation");
		await getAutomations();
		activeAttackIndex.value = -1;
	}
	else {
		addToast(error, { color: "error" });
		;
	}
	loader.hide();
};

const getAutomations = async () => {
	if (!collection.value)
		return;
	const { success, data: rData, error } = await useFetch<AutomationWithType[]>(`/api/automation-collection/${collection.value.id}/automations`);
	if (success)
		data.value = rData;
	else addToast(error, { color: "error" });
	;
	initialData = JSON.stringify(data.value);
};

const exportMyAutomations = async () => {
	await navigator.clipboard.writeText(JSON.stringify(data.value.map(a => a.automation)));
	$toast.success("Copied all automation to clipboard!");
};

const showImportModal = ref(false);
const importedListOfAutomation = ref("");

const importAutomations = async () => {
	const parsedAutomation = YAML.parse(importedListOfAutomation.value) as any[];
	for (const a of parsedAutomation) {
		let name: string;
		if (a == null)
			continue;
		if (Array.isArray(a))
			name = a[0].name.replace(" (1H)", "").replace(" (2H)", "");
		else name = a.name;
		await addAttack(name, a, false);
	}
	$toast.info("Done importing automation!");
	showImportModal.value = false;
};

onBeforeRouteLeave(() => {
	// when the user leaves this route
	if (initialData !== JSON.stringify(data.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		if (!answer)
			return false;
	}
});

const unloadHandler = (event: Event) => {
	if (initialData !== JSON.stringify(data.value)) {
		window.confirm("Do you really want to leave? you have unsaved changes!");
		event.preventDefault();
		event.returnValue = true;
	}
};

onMounted(() => {
	window.addEventListener("beforeunload", unloadHandler);
});
onUnmounted(() => {
	window.removeEventListener("beforeunload", unloadHandler);
});

const characters = ref<Array<any>>([]);
const getAvraeCharacters = async () => {
	const toasterId = $toast.loading("Getting character data from Avrae...");
	const { success, data, error } = await useFetch("/api/character/list");
	if (success) {
		$toast.success("Loaded Avrae Characters", { id: toasterId });
		void getUmami()?.track("Loaded Avrae Characters");
		characters.value = data as any[];
	}
	else {
		addToast(error, { color: "error" });
		;
	}
};

const selectedCharacter = ref<any>();
watch(selectedCharacter, async () => {
	if (activeAttackIndex.value < 0) {
		$toast.info("No automation selected.");
		return;
	}
	let automation: null | AttackModel | AttackModel[] = data.value[activeAttackIndex.value].automation;

	if (automation === null) {
		$toast.info("You cannot import empty automation.");
		return;
	}
	if (!Array.isArray(automation))
		automation = [automation];

	const toasterId = $toast.loading("Waiting on the Avrae API...");
	const { success, error } = await useFetch(`/api/character/${selectedCharacter.value.upstream}/attacks/add`, "POST", automation);

	if (success) {
		$toast.success(`Successfully imported ${data.value[activeAttackIndex.value].name} to ${selectedCharacter.value.name}`, { id: toasterId });
		getUmami()?.track("Imported Attack to Avrae");
	}
	else {
		addToast(error, { color: "error" });
		;
	}
});

const showCreateModal = ref(false);
const createOptions = reactive({
	name: "",
	description: "",
});

const resetCreateInput = () => {
	createOptions.name = "";
	createOptions.description = "";
};

const cancelCreate = () => {
	resetCreateInput();
};

const getDraggableKey = (item: any) => {
	return item;
};

const saveOrder = async () => {
	const orderIds = data.value.map(i => i.id);
	await useFetch("/api/automation-collection/order", "POST", orderIds);
};

const personal = ref(true);

const settingOptions = ref({
	name: "",
	description: "",
	tags: [] as string[],
	status: "",
	image: ""
});

const setSettingInputs = () => {
	if (!collection.value)
		return;
	settingOptions.value = {
		name: toValue(collection.value.name),
		description: toValue(collection.value.description),
		tags: toValue(collection.value.tags),
		status: toValue(collection.value.status),
		image: toValue(collection.value.image)
	};
};

const updateCollection = async () => {
	if (!collection.value)
		return;
	const { success, data, error } = await useFetch<AutomationCollectionExtended>(`/api/automation-collection/${collection.value.id}/update`, "POST", toValue(settingOptions));
	if (success) {
		$toast.success("Updated collection!");
		collection.value = data;
	}
	else {
		addToast(error, { color: "error" });
		;
	}
};
useHotkey("cmd+s", async () => await updateCollection(), { inputs: true })

</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: '/automations/personal',
			text: 'My Automation',
			isCurrent: false
		},
		{
			path: '',
			text: collection ? collection.name : 'Unknown name',
			isCurrent: true
		}
	]">
		<!-- <v-icon-btn text="Add attack" @click="showCreateModal = true" icon="mdi:plus" size="24" />
		<v-icon-btn text="Settings" @click="showSettingsModal = true" icon="mdi:cog" size="24" /> -->
		<v-icon-btn text="Import automation" @click="showImportModal = true" icon="mdi:import" size="24" />
		<v-icon-btn text="Export automation" @click="exportMyAutomations()" icon="mdi:export" size="24" />
	</Breadcrumbs>
	<div v-if="collection" class="content less-wide">
		<h1> {{ collection?.name }}</h1>
		<ul class="tag-container">
			<li v-for="tag of collection?.tags.sort()">
				{{ tag }}
			</li>
		</ul>

		<Markdown :text="collection.description" />
		<h2> Actions </h2>
		<Draggable :key="Math.random()" :list="data" group="bestiaries" :animation="150" :item-key="getDraggableKey"
			class="attack-container" :handle="store.isMobile ? '.handle' : ''" :disabled="!personal" tag="ol"
			@change="saveOrder">
			<template #item="{ element, index }">
				<li class="attack-tile">
					<h3>
						{{ element.name }}
					</h3>
					<p> {{ element.description }}</p>
				</li>
			</template>
			<template #footer>
				<li class="ghost attack-tile" @click="showCreateModal = true">
					Add attack
				</li>
			</template>
		</Draggable>
	</div>
</template>

<style scoped lang="less">
@import url("@/assets/styles/mixins.less");

.two-wide {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0rem 1rem;
}

.selected-container {
	display: flex;

	button {
		translate: 0 4px;
	}
}

.modal-desc {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.content {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.attack-container {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	list-style-type: none;
	margin: 0;
	padding: 0;

	& .attack-tile {
		background-color: var(--color-surface-1);
		padding: 0.5rem;
		border-radius: 2px;

		&.ghost {
			background-color: unset;
			font-style: italic;
			cursor: pointer;
		}
	}
}

.tag-container {
	list-style-type: none;
	margin: 0;
	padding: 0;

	li {
		display: inline-block;
		font-size: smaller;
		background-color: var(--color-surface-3);
		padding: 0.5rem;
		border-radius: 16px;
		margin-right: 0.5rem;
		font-weight: bold;
	}
}
</style>

<style>
.markdown img {
	max-width: 250px;
}
</style>
