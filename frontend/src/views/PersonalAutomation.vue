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
								{{ d.name }}
							</p>
						</li>
					</ol>
					<p v-else>You do not have any personal automations.</p>
				</LabelledComponent>
				<LabelledComponent title="Add new automation">
					<input type="text" v-model="newAutomationName" id="addnewautomation" />
					<button class="btn confirm" @click="addAutomation(newAutomationName)">Add</button>
				</LabelledComponent>
				<LabelledComponent title="Delete automation" v-if="selectedAutomation">
					<button class="btn danger" @click="deleteAutomation(selectedAutomation._id)">Delete current automation</button>
				</LabelledComponent>
			</div>
			<hr />
			<div class="automation-editor">
				<AutomationEditor v-if="selectedAutomation" :data="selectedAutomation" :is-stand-alone="true" :key="selectedAutomation?._id.toString()" @saved-standalone-data="initialData = JSON.stringify(data)" />
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
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {ref, onMounted} from "vue";
import {useLoading} from "vue-loading-overlay";
import {user as getUser, handleApiResponse, toast, type error, loadingOptions} from "@/main";
import {type User, Automation} from "../../../shared";
import type {Id} from "../../../shared";
import LabelledComponent from "@/components/LabelledComponent.vue";
import AutomationEditor from "@/components/AutomationEditor.vue";
import Modal from "@/components/Modal.vue";
import {onBeforeRouteLeave} from "vue-router";
const $loading = useLoading(loadingOptions);
const user = ref<User | null>(null);
const data = ref<Automation[]>([]);
let initialData = "";
// get our data
onMounted(async () => {
	const loader = $loading.show();

	//Request my automations
	await getMyAutomations();
	initialData = JSON.stringify(data.value);
	user.value = await getUser;
	loader.hide();
});

const selectedAutomation = ref<Automation | null>(null);

const newAutomationName = ref<string>("New Automation");
const addAutomation = (name: string, automation = null, shouldNotify = true) => {
	if (name == "New Automation") {
		toast.warning("Automation must have a non-default name!");
		return;
	}
	const loader = $loading.show();
	fetch(`/api/automation/add`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({data: {name: name, automation: automation}})
	}).then(async (response) => {
		let result = await handleApiResponse<Automation>(response);
		if (result.success) {
			await getMyAutomations();
			newAutomationName.value = "New Automation";
			if (shouldNotify) toast.success("Successfully added automation: " + name);
			selectedAutomation.value = data.value[data.value.length - 1];
		} else toast.error((result.data as error).error);
	});
	loader.hide();
};

const deleteAutomation = (_id: Id) => {
	const loader = $loading.show();
	fetch(`/api/automation/${_id}/delete`).then(async (response) => {
		let result = await handleApiResponse<{}>(response);
		if (result.success) {
			toast.success("Successfully deleted the automation!");
			await getMyAutomations();
			selectedAutomation.value = null;
		} else toast.error((result.data as error).error);
	});
	loader.hide();
};

const getMyAutomations = async () => {
	await fetch(`/api/my-automations`).then(async (response) => {
		let result = await handleApiResponse<Automation[]>(response);
		if (result.success) data.value = result.data as Automation[];
		else toast.error((result.data as error).error);
	});
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

window.addEventListener("beforeunload", (event) => {
	// haven't figured out yet how to destroy the event listener upon unmount so for now this confirms that the
	// warning only shows if they are in the statblock editor
	if (initialData !== JSON.stringify(data.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		event.preventDefault();
		event.returnValue = true;
	}
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
