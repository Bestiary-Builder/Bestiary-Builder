<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { toast } from "vue-sonner";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import { useFetch } from "@/utils/utils";
import type { Automation, Id } from "~/shared";

import LabelledComponent from "@/components/LabelledComponent.vue";
import AutomationEditor from "@/components/AutomationEditor.vue";
import Modal from "@/components/Modal.vue";
import { store } from "@/utils/store";
import { $loading } from "@/utils/app/loading";

const data = ref<Automation[]>([]);
const initialData = ref("");
// get our data
onMounted(async () => {
	const loader = $loading.show();
	await getMyAutomations();
	initialData.value = JSON.stringify(data.value);
	loader.hide();
});

const selectedAutomation = ref<Automation | null>(null);

const newAutomationName = ref<string>("New Automation");
const addAutomation = async (name: string, automation = null, shouldNotify = true) => {
	if (name === "New Automation") {
		toast.warning("Automation must have a non-default name!");
		return;
	}
	const loader = $loading.show();
	const { success, error } = await useFetch<Automation>(`/api/automation/add`, "POST", { name, automation });
	if (success) {
		await getMyAutomations();
		newAutomationName.value = "New Automation";
		if (shouldNotify)
			toast.success(`Successfully added automation: ${name}`);
		selectedAutomation.value = data.value[data.value.length - 1];
	}
	else { toast.error(error); }
	loader.hide();
};

const deleteAutomation = async (_id: Id) => {
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/automation/${_id.toString()}/delete`);
	if (success) {
		toast.success("Successfully deleted the automation!");
		await getMyAutomations();
		selectedAutomation.value = null;
	}
	else { toast.error(error); }
	loader.hide();
};

const getMyAutomations = async () => {
	const { success, data: rData, error } = await useFetch<Automation[]>(`/api/my-automations`);
	if (success)
		data.value = rData;
	else toast.error(error);
	initialData.value = JSON.stringify(data.value);
};

const exportMyAutomations = async () => {
	await navigator.clipboard.writeText(JSON.stringify(data.value.map(a => a.automation)));
	toast.success("Copied all automation to clipboard.");
};

const showImportModal = ref(false);
const importedListOfAutomation = ref("");

const importAutomations = async () => {
	const parsedAutomation = JSON.parse(importedListOfAutomation.value) as any[];
	for (const a of parsedAutomation) {
		let name: string;
		if (a == null)
			continue;
		if (Array.isArray(a))
			name = a[0].name.replace(" (1H)", "").replace(" (2H)", "");
		else name = a.name;
		await addAutomation(name, a, false);
	}
	toast.info("Importing automation has finished.");
	showImportModal.value = false;
};

onBeforeRouteLeave(() => {
	// when the user leaves this route
	if (initialData.value !== JSON.stringify(data.value)) {
		const answer = window.confirm("Do you really want to leave? You have unsaved changes.");
		if (!answer)
			return false;
	}
});

const unloadHandler = (event: Event) => {
	if (initialData.value !== JSON.stringify(data.value)) {
		window.confirm("Do you really want to leave? you have unsaved changes.");
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

const isVisualEditor = ref(true);
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'My Automation',
				isCurrent: true
			}
		]"
	>
		<button v-tooltip="'Change editor'" aria-label="Change editor" @click="isVisualEditor = !isVisualEditor">
			<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
		</button>
		<button v-tooltip="'Import a list of automation'" aria-label="Import a list of automation" @click="showImportModal = true">
			<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
		</button>
		<button v-tooltip="'Export all automations to your clipboard'" aria-label="Export all automations to your clipboard" @click="exportMyAutomations()">
			<font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
		</button>
	</Breadcrumbs>
	<div class="content">
		<div class="wrapper">
			<div class="left">
				<LabelledComponent title="List">
					<ol v-if="data && data.length > 0">
						<li v-for="(d, key) in data" :key="key" class="feature-button__container" :class="{ selected: d._id === selectedAutomation?._id }" @click="selectedAutomation = d">
							<p role="button" :aria-label="`Select automation: ${d.name} (${key})`">
								{{ d.name || "Unnamed feature" }}
							</p>
						</li>
					</ol>
					<p v-else>
						You do not have any personal automations.
					</p>
				</LabelledComponent>
				<LabelledComponent title="Add new automation" for="addnewautomation">
					<input id="addnewautomation" v-model="newAutomationName" type="text" :minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength">
					<button class="btn confirm" @click="addAutomation(newAutomationName)">
						Add
					</button>
				</LabelledComponent>
				<LabelledComponent v-if="selectedAutomation" title="Delete automation">
					<button class="btn danger" @click="deleteAutomation(selectedAutomation._id!)">
						Delete current
					</button>
				</LabelledComponent>
			</div>
			<hr>
			<div class="automation-editor">
				<AutomationEditor v-if="selectedAutomation" :key="selectedAutomation?._id!.toString()" :is-visual-editor="isVisualEditor" :data="selectedAutomation" :is-stand-alone="true" @saved-standalone-data="initialData = JSON.stringify(data)" />
				<div v-else class="no-selected">
					Select an automation to get started with editing it.
				</div>
			</div>
		</div>
	</div>

	<Modal :show="showImportModal" @close="showImportModal = false">
		<template #header>
			Import Automation
		</template>
		<template #body>
			<LabelledComponent title="List of automation" for="listInput">
				<p>Insert a list of automation in JSON format.</p>
				<div class="two-wide">
					<input id="listInput" v-model="importedListOfAutomation" type="text" placeholder="JSON">
					<button class="btn confirm" @click="importAutomations">
						Import
					</button>
				</div>
			</LabelledComponent>
			<hr>
		</template>
	</Modal>
</template>

<style scoped lang="less">
@import url("@/assets/styles/mixins.less");
.wrapper {
	display: grid;
	grid-template-columns: 2fr 0.1fr 10fr;
	gap: 2rem;
	border-radius: 3px;
	padding: 0.5rem;

	.left {
		ol {
			list-style-type: decimal;
			color: white;
			margin: 0rem;
			font-size: 0.9rem;
			li {
				display: list-item;
				margin: 0.3rem 0;
				p {
					cursor: pointer;
					word-break: break-all;
				}
				&.selected {
					text-decoration: underline;
					color: orangered;
				}
			}
		}

		.two-wide.uneven {
			width: 100%;
			display: grid;
			gap: 0rem 1rem;
			margin-bottom: 1rem;
			grid-template-columns: 3fr 1fr;
		}

		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.automation-editor {
		border: 0px solid red;
	}
}

@media screen and (max-width: 1200px) {
	.wrapper {
		gap: 1rem;
		grid-template-columns: 1fr;
	}
}

.two-wide {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0 1rem;
}
</style>
