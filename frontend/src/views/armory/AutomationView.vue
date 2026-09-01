<script setup lang="ts">
import type { Automation, AutomationCollectionExtended } from "~/shared";
import { onMounted, provide, ref, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import EditAutomation from "@/components/Automations/EditAutomation.vue";
import ImportToCharacter from "@/components/Characters/ImportToCharacter.vue";
import Editor from "@/components/StatblockEditor/Editor.vue";
import { useToast } from "@/utils/app/toast";
import { useRecentPages } from "@/utils/app/useRecentPages";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import type { VAutocomplete } from "vuetify/components";

const $router = useRouter();
const $route = useRoute();
const data = ref<Automation>();
const collection = ref<AutomationCollectionExtended | null>(null);

const { addToast, removeToast } = useToast();
const { updateLabel } = useRecentPages();
const EditAutomationRef = useTemplateRef("EditAutomationRef");

// load creature data
onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	const { success, data: aData, error } = await useFetch<Automation>(`/api/automation/${$route.params.id.toString()}`);
	if (success) {
		data.value = aData;
		await getCollection();
		updateLabel($route.path, data.value.name);
		removeToast(toastId);
	}
	else {
		addToast(error, { color: "error" });
		await $router.push("/error");
		removeToast(toastId);
	}
});


// ownership
const isOwner = ref(false);
const isEditor = ref(false);
const getCollection = async () => {
	const { success, data: cData, error } = await useFetch<AutomationCollectionExtended>(`/api/automation-collection/${data.value?.collectionId}`);
	if (success) {
		collection.value = cData;
		isOwner.value = store.user?.id === collection.value.ownerId;
		isEditor.value = (collection.value?.editors ?? []).map(e => e.userId).includes(store.user?.id ?? "");

		if (!isOwner.value && !isEditor.value)
			await $router.push(`/automation/view/${data.value?.id}`);
	}
	else {
		addToast(error, { color: "error" });
	}
};

const isVisualEditor = ref(store.user?.preferredEditor === "Visual");

provide("setActionName", false);
provide("setActionDescription", false);

// TODO
const makeGvar = async () => {
	console.log("run this");
	const { success, data: aAdata, error } = await useFetch("/api/character/makeattackgvar", "POST", data.value?.automation);
	console.log(success, aAdata, error);
};
</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: isOwner || isEditor ? `/armory/edit/${collection?.id}` : `/armory/view/${collection?.id}`,
			text: collection?.name || '',
			isCurrent: false
		},
		{
			path: '',
			text: data?.name,
			isCurrent: true
		}
	]">
		<v-icon-btn v-tooltip="'Change editor'" size="24" icon="mdi:code-block-braces" text="Change editor"
			@click="EditAutomationRef?.toggleEditor()" />
		<ImportToCharacter :automation="data?.automation || null" :consumables="data?.consumables || null" />
		<v-icon-btn v-if="data && store.isMobile" v-tooltip="'Copy automation'" icon="mdi:content-copy"
			text="Copy automation" size="24" @click="EditAutomationRef?.copyAutomation()" />
	</Breadcrumbs>
	<div v-if="data" class="content">
		<div class="pa-0">
			<v-row>
				<v-col cols="4">
					<v-text-field v-model="data.name" type="text" label="Feature name"
						:minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength" variant="outlined"
						hide-details disabled />
				</v-col>
				<v-col cols="8">
					<Editor v-model="data.description" :height="100" />
				</v-col>
			</v-row>
		</div>

		<v-defaults-provider
			:defaults="{ VTextField: { disabled: true }, VSelect: { disabled: true }, VNumberInput: { disabled: true }, VComboBox: { disabled: true }, VCheckbox: { disabled: true }, VAutocomplete: { disabled: true }, VTextArea: { disabled: true } }">
			<EditAutomation ref="EditAutomationRef" v-model="data.automation" v-model:is-visual-editor="isVisualEditor"
				:name="data.name" />
		</v-defaults-provider>

	</div>
</template>

<style scoped lang="less">
.two-wide {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;

	&.uneven {
		grid-template-columns: 1fr 2fr;
		max-width: 100%;
	}
}

a {
	color: rgb(var(--v-theme-primary));
}

.sub-action {
	line-height: 0.7;

	small {
		font-size: x-small;
	}

	input[type="checkbox"] {
		scale: 0.7;
		translate: 0 4px;
	}
}
</style>
