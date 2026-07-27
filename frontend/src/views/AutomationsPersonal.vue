<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import Breadcrumbs from "@/components/Page/Breadcrumbs.vue";
import { useFetch } from "@/utils/utils";
import { $toast } from "@/utils/app/toast";
import type { AttackModel, AutomationWithType, Id } from "~/shared";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import Modal from "@/components/Global/Modal.vue";
import { store } from "@/utils/store";
import { $loading } from "@/utils/app/loading";
import StandAloneEditor from "@/components/Automations/StandAloneEditor.vue";
import ImportAutomationUtil from "@/components/Automations/ImportAutomationUtil.vue";
import ButtonIcon from "@/components/Global/ButtonIcon.vue";
import { getUmami } from "@/utils/app/analytics";

const data = ref<AutomationWithType[]>([]);
let initialData = "";
// get our data
onMounted(async () => {
	const loader = $loading.show();
	await getMyAutomations();
	initialData = JSON.stringify(data.value);
	loader.hide();
});

const selectedAutomation = ref<AutomationWithType | null>(null);

const newAutomationName = ref<string>("New Automation");
const addAutomation = async (name: string, automation: null | AttackModel | AttackModel[], shouldNotify = true) => {
	if (name === "New Automation") {
		$toast.warning("Automation must have a non-default name!");
		return;
	}
	const loader = $loading.show();
	const { success, error } = await useFetch<AutomationWithType>(`/api/automation/add`, "POST", { name, automation });
	if (success) {
		await getMyAutomations();
		newAutomationName.value = "New Automation";
		if (shouldNotify)
			$toast.success(`Successfully added automation: ${name}`);
		selectedAutomation.value = data.value[data.value.length - 1];
		getUmami()?.track("Add automation");
	}
	else {
		$toast.error(error);
	}
	loader.hide();
};

const deleteAutomation = async (_id: Id) => {
	const loader = $loading.show();
	const { success, error } = await useFetch(`/api/automation/${_id.toString()}/delete`);
	if (success) {
		$toast.success("Successfully deleted the automation!");
		getUmami()?.track("Delete automation");
		await getMyAutomations();
		selectedAutomation.value = null;
	}
	else { $toast.error(error); }
	loader.hide();
};

const getMyAutomations = async () => {
	const { success, data: rData, error } = await useFetch<AutomationWithType[]>(`/api/my-automations`);
	if (success)
		data.value = rData;
	else $toast.error(error);
	initialData = JSON.stringify(data.value);
};

const exportMyAutomations = async () => {
	await navigator.clipboard.writeText(JSON.stringify(data.value.map(a => a.automation)));
	$toast.success("Copied all automation to clipboard!");
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
		getUmami()?.track("Loaded Avrae Characters");
		characters.value = data as any[];
	}
	else {
		$toast.error(error);
	}
};

const selectedCharacter = ref<any>();
watch(selectedCharacter, async () => {
	console.log(selectedCharacter.value);
	if (!selectedAutomation.value) {
		$toast.info("No automation selected.");
		return;
	}
	if (selectedAutomation.value.automation === null) {
		$toast.info("You cannot import empty automation.");
		return;
	}
	let automation: any = selectedAutomation.value.automation;
	if (!Array.isArray(selectedAutomation.value.automation))
		automation = [automation];

	const toasterId = $toast.loading("Waiting on the Avrae API...");
	const { success, error } = await useFetch(`/api/character/${selectedCharacter.value.upstream}/attacks/add`, "POST", automation);

	if (success) {
		$toast.success(`Successfully imported ${selectedAutomation.value.name} to ${selectedCharacter.value.name}`, { id: toasterId });
		getUmami()?.track("Imported Attack to Avrae");
	}
	else {
		$toast.error(error);
	}
});
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
		<ImportAutomationUtil @load-feature="(feature) => addAutomation(feature.name, feature.automation)" />
		<VDropdown :distance="6" :positioning-disabled="store.isMobile">
			<ButtonIcon icon="avrae" label="Import to Avrae Character" />
			<template #popper>
				<div class="v-popper__custom-menu" style="min-width: 200px">
					<button v-if="characters.length === 0" class="btn confirm" @click="getAvraeCharacters">
						Get Avrae Characters
					</button>
					<div v-else>
						<p> Choose Avrae Character <br> to import this feature to.<br></p>
						<select v-model="selectedCharacter" style="margin-top: 1rem;">
							<option v-for="char, idx of characters" :key="idx" :value="char">
								{{ char.name }}
							</option>
						</select>
					</div>
				</div>
			</template>
		</VDropdown>
		<ButtonIcon icon="arrow-right-to-bracket" label="Import a list of automation" @click="showImportModal = true" />
		<ButtonIcon icon="arrow-right-from-bracket" label="Export all automations to your clipboard" @click="exportMyAutomations()" />
	</Breadcrumbs>
	<div class="content">
		<div class="wrapper">
			<div class="left">
				<LabelledComponent title="List">
					<ol v-if="data && data.length > 0">
						<li v-for="(d, key) in data" :key="key" class="feature-button__container" :class="{ selected: d.id === selectedAutomation?.id }" @click="selectedAutomation = d">
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
					<button class="btn confirm" @click="addAutomation(newAutomationName, null)">
						Add
					</button>
				</LabelledComponent>
				<LabelledComponent v-if="selectedAutomation" title="Delete automation">
					<button class="btn danger" @click="deleteAutomation(selectedAutomation.id!)">
						Delete current automation
					</button>
				</LabelledComponent>
			</div>
			<hr>
			<div class="automation-editor">
				<StandAloneEditor v-if="selectedAutomation" :key="selectedAutomation?.id!.toString()" :data="selectedAutomation" :is-stand-alone="true" @saved-standalone-data="initialData = JSON.stringify(data)" />
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
