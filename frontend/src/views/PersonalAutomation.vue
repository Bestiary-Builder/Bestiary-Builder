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
		<button @click="showImportModal = true" v-tooltip="'Import a list of automation'" aria-label="Import a list of automation">
			<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
		</button>
		<button @click="exportMyAutomations()" v-tooltip="'Export all automations to your clipboard'" aria-label="Export all automations to your clipboard">
			<font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
		</button>
	</Breadcrumbs>
	<div class="content">
		<div class="wrapper">
			<div class="left">
				<LabelledComponent title="List">
					<ol v-if="data && data.length > 0">
						<li v-for="(d, key) in data" :key="key" class="feature-button__container" @click="selectedAutomation = d" :class="{selected: d._id == selectedAutomation?._id}">
							<p role="button" :aria-label="`Select automation: ${d.name} (${key})`">
								{{ d.name || "Unnamed feature" }}
							</p>
						</li>
					</ol>
					<p v-else>You do not have any personal automations.</p>
				</LabelledComponent>
				<LabelledComponent title="Add new automation">
					<input type="text" v-model="newAutomationName" id="addnewautomation" :minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength" />
					<button class="btn confirm" @click="addAutomation(newAutomationName)">Add</button>
				</LabelledComponent>
				<LabelledComponent title="Delete automation" v-if="selectedAutomation">
					<button class="btn danger" @click="deleteAutomation(selectedAutomation._id!)">Delete current automation</button>
				</LabelledComponent>
			</div>
			<hr />
			<div class="automation-editor">
				<AutomationEditor v-if="selectedAutomation" :data="selectedAutomation" :is-stand-alone="true" :key="selectedAutomation?._id!.toString()" @saved-standalone-data="initialData = JSON.stringify(data)" />
				<div v-else class="no-selected">Select an automation to get started with editing it.</div>
			</div>
		</div>
	</div>

	<Modal :show="showImportModal" @close="showImportModal = false">
		<template #header>Import Automation</template>
		<template #body>
			<LabelledComponent title="List of automation">
				<p>Insert a list of automation in JSON format.</p>
				<div class="two-wide">
					<input type="text" v-model="importedListOfAutomation" id="listofautomation" placeholder="JSON" />
					<button class="btn confirm" @click="importAutomations">Import</button>
				</div>
			</LabelledComponent>
			<hr />
		</template>
	</Modal>
</template>

<script setup lang="ts">
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import {ref, onMounted, onUnmounted} from "vue";
import {useLoading} from "vue-loading-overlay";
import {useFetch} from "@/utils/utils";
import {toast, loadingOptions} from "@/main";
import {Automation} from "~/shared";
import type {Id} from "~/shared";
import LabelledComponent from "@/components/LabelledComponent.vue";
import AutomationEditor from "@/components/AutomationEditor.vue";
import Modal from "@/components/Modal.vue";
import {onBeforeRouteLeave} from "vue-router";
import {store} from "@/utils/store";
const $loading = useLoading(loadingOptions);
const data = ref<Automation[]>([]);
let initialData = "";
// get our data
onMounted(async () => {
	const loader = $loading.show();

	//Request my automations
	await getMyAutomations();
	initialData = JSON.stringify(data.value);
	loader.hide();
});

const selectedAutomation = ref<Automation | null>(null);

const newAutomationName = ref<string>("New Automation");
const addAutomation = async (name: string, automation = null, shouldNotify = true) => {
	if (name == "New Automation") {
		toast.warning("Automation must have a non-default name!");
		return;
	}
	const loader = $loading.show();
	const {success, error} = await useFetch<Automation>(`/api/automation/add`, "POST", {name: name, automation: automation});
	if (success) {
		await getMyAutomations();
		newAutomationName.value = "New Automation";
		if (shouldNotify) toast.success("Successfully added automation: " + name);
		selectedAutomation.value = data.value[data.value.length - 1];
	} else toast.error(error);
	loader.hide();
};

const deleteAutomation = async (_id: Id) => {
	const loader = $loading.show();
	const {success, error} = await useFetch<{}>(`/api/automation/${_id}/delete`);
	if (success) {
		toast.success("Successfully deleted the automation!");
		await getMyAutomations();
		selectedAutomation.value = null;
	} else toast.error(error);
	loader.hide();
};

const getMyAutomations = async () => {
	const {success, data: rData, error} = await useFetch<Automation[]>(`/api/my-automations`);
	if (success) data.value = rData;
	else toast.error(error);
	initialData = JSON.stringify(data.value);
};

const exportMyAutomations = () => {
	navigator.clipboard.writeText(JSON.stringify(data.value.map((a) => a.automation)));
	toast.success("Copied all automation to clipboard!");
};

const showImportModal = ref(false);
const importedListOfAutomation = ref("");

const importAutomations = () => {
	const parsedAutomation = JSON.parse(importedListOfAutomation.value) as any[];
	for (const a of parsedAutomation) {
		let name: string;
		if (a == null) continue;
		if (Array.isArray(a)) name = a[0].name.replace(" (1H)", "").replace(" (2H)", "");
		else name = a.name;
		addAutomation(name, a, false);
	}
	toast.info("Done importing automation!");
	showImportModal.value = false;
};

onBeforeRouteLeave(() => {
	// when the user leaves this route
	if (initialData !== JSON.stringify(data.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		if (!answer) return false;
	}
});

const unloadHandler = (event: Event) => {
	if (initialData !== JSON.stringify(data.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
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
</script>

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
	gap: 0rem 1rem;
}
</style>
