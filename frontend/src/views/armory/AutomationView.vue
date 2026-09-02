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


const displayTypeOptions = [
	{ title: '〇◉ Default', value: 'default' },
	{ title: '〇◉ Bubble', value: 'bubble' },
	{ title: '▢▣ Square', value: 'square' },
	{ title: '⬡⬢ Hex', value: 'hex' },
	{ title: '☆★ Star', value: 'star' },
	{ title: 'None', value: null },
]

const resetOnOptions = [
	{ title: 'Default', value: null },
	{ title: 'Short Rest ', value: 'short' },
	{ title: 'Long Rest', value: 'long' },
	{ title: 'None (never)', value: 'none' },
]


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
						:minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength" hide-details
						disabled />
				</v-col>
				<v-col cols="8">
					<Editor v-model="data.description" :height="100" />
				</v-col>
			</v-row>
		</div>

		<v-defaults-provider
			:defaults="{ VTextField: { disabled: true }, VSelect: { disabled: true }, VNumberInput: { disabled: true }, VComboBox: { disabled: true }, VCheckbox: { disabled: true }, VAutocomplete: { disabled: true }, VTextArea: { disabled: true }, VField: { disabled: true } }">
			<EditAutomation ref="EditAutomationRef" v-model="data.automation" v-model:is-visual-editor="isVisualEditor"
				:name="data.name" />

			<v-card title="Custom Counters" class="pa-4 d-flex flex-column"
				subtitle="Importing this action to your Avrae Character will import this Custom Counter too."
				bg-color="surface-light" color="surface-light">
				<v-card-text class="flex-grow-1" bg-color="surface-light">
					<v-list density="compact" class="text-left my-4" max-height="1000">
						<v-list-group v-for="consumable, idx of data.consumables">
							<template #activator="{ props, isOpen }">
								<v-list-item v-bind="props" :title="consumable.name" :subtitle="consumable.desc || ''">
									<template #append>
										<v-icon-btn text="Delete counter" icon="mdi:delete"
											@click.stop="data.consumables?.splice(idx, 1)">

										</v-icon-btn>
										<v-icon icon="mdi:chevron-down" :class="{ 'rotate-180': isOpen }"
											class="transition-transform" />
									</template>
								</v-list-item>
							</template>
							<v-container class="pa-4">
								<v-row density="comfortable">
									<v-col cols="6">
										<v-text-field v-model="consumable.name" label="Name"></v-text-field>
									</v-col>


									<v-col cols="12">
										<p class="">
											<small>
												The following fields may use CVARS from the
												<a href="https://avrae.readthedocs.io/en/stable/aliasing/api.html#cvar-table"
													target="_blank">
													CVAR
													table
												</a>
												and math expressions.
											</small>
										</p>
									</v-col>


									<v-col cols="6">
										<v-select v-model="consumable.display_type" label="Display Type"
											:items="displayTypeOptions" hide-details>
										</v-select>
									</v-col>
									<v-col cols="6">
										<v-select v-model="consumable.reset" label="Reset On" :items="resetOnOptions"
											hide-details>
										</v-select>
									</v-col>
									<v-col cols="6">
										<TypeHintedEditor v-model="consumable.minv" label="Minimum" />
									</v-col>
									<v-col cols="6">
										<TypeHintedEditor v-model="consumable.maxv" label="Maximum" />
									</v-col>

									<v-col cols="6">
										<TypeHintedEditor v-model="consumable.reset_by" label="Reset By"
											is-annotated-string />
									</v-col>
									<v-col cols="6">
										<TypeHintedEditor v-model="consumable.reset_to" label="Reset To" />
									</v-col>
									<v-col cols="6">
										<v-number-input v-model="consumable.value" label="Initial Value"
											hide-details></v-number-input>
									</v-col>
									<v-col cols="6">
										<v-text-field v-model="consumable.title" label="Title" "
										hide-details></v-text-field>
								</v-col>
								<v-col cols=" 12">
											<v-textarea v-model="consumable.desc" label="Description"
												hide-details></v-textarea>
									</v-col>
								</v-row>
							</v-container>
							<v-divider />

						</v-list-group>
						<v-list-item v-if="!data.consumables" title="No consumables set..."></v-list-item>
						<v-divider />
					</v-list>
				</v-card-text>
			</v-card>
		</v-defaults-provider>



	</div>
</template>

<style scoped lang="less">
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
