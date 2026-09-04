<script setup lang="ts">
import type { AttackModel, Automation, AutomationCollectionExtended, AutomationConsumable, FeatureEntity } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, provide, ref, useTemplateRef, watch } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { useHotkey } from "vuetify";
import EditAutomation from "@/components/Automations/EditAutomation.vue";
import ImportAutomationUtil from "@/components/Automations/ImportAutomationUtil.vue";
import ImportToCharacter from "@/components/Characters/ImportToCharacter.vue";
import Editor from "@/components/StatblockEditor/Editor.vue";
import { useToast } from "@/utils/app/toast";
import { useRecentPages } from "@/utils/app/useRecentPages";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { consumableContextHints, parseDescIntoAutomation } from "~/shared";
import { useRules } from "vuetify/labs/rules";
import type * as Monaco from 'monaco-editor'
import { loader } from '@guolao/vue-monaco-editor';
import TypeHintedEditor from "@/components/FormInputs/TypeHintedEditor.vue";
import { buildCounterOutput } from "@/components/Characters/utils";
import { getUmami } from "@/utils/app/analytics";

const $router = useRouter();
const $route = useRoute();
const data = ref<Automation>();
const collection = ref<AutomationCollectionExtended | null>(null);

const { addToast, updateToast, removeToast } = useToast();
const { updateLabel } = useRecentPages();
const EditAutomationRef = useTemplateRef("EditAutomationRef");

// load creature data
onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	const { success, data: aData, error } = await useFetch<Automation>(`/api/automation/${$route.params.id.toString()}`);
	if (success) {
		data.value = aData;
		await nextTick(() => madeChanges.value = false);
		await getCollection();
		updateLabel($route.path, data.value.name);
		removeToast(toastId);
	}
	else {
		addToast(error, { color: "error" });
		madeChanges.value = false;
		await $router.push("/error");
		removeToast(toastId);
	}
});

const madeChanges = ref(false);

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

const unwatch = watch(() => data.value, () => {
	if (collection.value == null)
		return;
	madeChanges.value = true;
	unwatch();
}, { deep: true });

onBeforeRouteUpdate(() => {
	if (isVisualEditor.value)
		return;

	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		if (!answer)
			return false;
	}
});
onBeforeRouteLeave(() => {
	if (isVisualEditor.value)
		return;

	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		if (!answer)
			return false;
	}
});

const beforeUnLoad = (event: Event) => {
	if (isVisualEditor.value)
		return;
	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		event.preventDefault();
		event.returnValue = true;
	}
};

window.addEventListener("beforeunload", beforeUnLoad);
onUnmounted(() => {
	window.removeEventListener("beforeunload", beforeUnLoad);
});

// saving
const validateAttack = async (automation: AttackModel | AttackModel[] | null): Promise<true | string> => {
	if (automation === null)
		return true;
	const { success, error } = await useFetch("/api/validate/automation", "POST", automation);
	if (success)
		return true;
	else
		return error;
};

const isSaved = ref(false);
const isSavingCreature = ref(false);

const saveAutomation = async (shouldNotify: boolean): Promise<boolean> => {
	if (!collection.value || !data.value)
		return false;

	if (!isVisualEditor.value && EditAutomationRef.value?.yamlError) {
		const message = `Error parsing automation YAML. ${EditAutomationRef.value.yamlError}`;
		if (shouldNotify)
			addToast(message, { color: "error", timeout: -1 });
		return false;
	}

	const toastId = shouldNotify ? addToast("Validating...", { loading: true }) : undefined;
	isSavingCreature.value = true;

	try {
		const validAutomation = await validateAttack(data.value.automation);
		if (validAutomation !== true) {
			if (toastId) {
				updateToast(toastId, {
					text: validAutomation,
					color: "error",
					timeout: -1,
					isHtml: true,
				});
			}
			isSavingCreature.value = false;
			return false;
		}

		if (toastId)
			updateToast(toastId, { text: "Saving..." });

		const { success, error } = await useFetch(`/api/automation/${data.value.id}/update`, "POST", data.value);
		if (!success) {
			if (toastId) {
				updateToast(toastId, {
					text: `Error saving automation. ${error}`,
					color: "error",
					timeout: -1,
				});
			}
			else {
				addToast(`Error saving automation. ${error}`, {
					color: "error",
					timeout: -1,
				});
			}
			isSavingCreature.value = false;
			return false;
		}

		isSaved.value = true;
		madeChanges.value = false;

		const unwatch = watch(
			() => data.value,
			() => {
				madeChanges.value = true;
				unwatch();
			},
			{ deep: true },
		);

		if (toastId)
			setTimeout(updateToast, 500, toastId, { text: "Saved Action.", prependIcon: "mdi:check" });
		isSavingCreature.value = false;
		updateLabel($route.path, data.value.name);
		return true;
	}
	catch (err) {
		if (toastId) {
			updateToast(toastId, {
				text: err instanceof Error ? err.message : "An unexpected error occurred.",
				color: "error",
			});
		}
		isSavingCreature.value = false;
		return false;
	}
};
useHotkey("cmd+s", async () => saveAutomation(true), { inputs: true });

type AutomationTypes = "automation" | "basic-example" | "srd-features/2014" | "srd-features/2024";
const loadFeature = async (feature: FeatureEntity, apiPath: AutomationTypes) => {
	if (!data.value)
		return;

	data.value.description = feature.description;
	data.value.name = feature.name.substring(0, store.limits?.nameLength);

	if (apiPath === "basic-example" && feature.automation) {
		let lastNode;

		if (Array.isArray(feature.automation))
			lastNode = feature.automation[0].automation[feature.automation[0].automation.length - 1];
		else
			lastNode = feature.automation.automation[feature.automation.automation.length - 1];

		if (lastNode.type === "text") {
			if (typeof (lastNode.text) === "string")
				feature.description = lastNode.text;
			else
				feature.description = "";
		}
		else {
			feature.description = "";
		}
	}

	data.value.automation = feature.automation;
	EditAutomationRef.value?.resetVisualEditorState();

	addToast(`Successfully loaded ${feature.name}!`);
	await saveAutomation(false);
};

const generateAutomation = async () => {
	if (!data.value)
		return;
	let activationType;
	const automation = data.value.automation;
	if (automation === null) {
		activationType = 1;
	}
	else if (Array.isArray(automation)) {
		activationType = automation[0].activation_type ?? 0;
	}
	else {
		activationType = automation.activation_type ?? 0;
	}
	const result = parseDescIntoAutomation(data.value.description, data.value.name, activationType)[0];
	if (result) {
		try {
			data.value.automation = result;
		}
		catch {
			addToast("Something went wrong when generation automation", { color: "error" });
		}
	}
};

// Description parity helpers
const updateFeatureDescFromAutomationDesc = () => {
	if (!data.value)
		return;
	const auto = data.value.automation as AttackModel | AttackModel[] | null | undefined;
	if (!auto || Array.isArray(auto))
		return;
	for (let i = (auto.automation || []).length - 1; i >= 0; i--) {
		const field = auto.automation[i];
		if (field.type === "text" && data.value && typeof (field.text) === "string") {
			data.value.description = field.text;
			return;
		}
	}
};

const updateAutomationDescFromFeatureDesc = () => {
	if (!data.value)
		return;
	const auto = data.value.automation as AttackModel | AttackModel[] | null | undefined;
	if (!auto || Array.isArray(auto))
		return;
	for (let i = (auto.automation || []).length - 1; i >= 0; i--) {
		const field = auto.automation[i];
		if (field.type === "text") {
			field.text = data.value.description ?? "";
			return;
		}
	}
};

const getAutomationDescription = (): string | boolean => {
	if (!data.value)
		return "";
	const auto = data.value?.automation as AttackModel | AttackModel[] | null | undefined;
	if (!auto || Array.isArray(auto) || !auto.automation || auto.automation.length === 0)
		return false;
	for (let i = auto.automation.length - 1; i >= 0; i--) {
		const field = auto.automation[i];
		if (field?.type === "text" && typeof (field.text) === "string") {
			return field.text;
		}
	}
	return "";
};

const showDescriptionButtons = computed(() => {
	if (!data.value)
		return;
	const desc = data.value.description;
	const autoDesc = getAutomationDescription();
	if (Array.isArray(data.value.automation) || !desc || !autoDesc)
		return false;
	if (desc !== autoDesc)
		return true;
	return false;
});

const isVisualEditor = ref(store.user?.preferredEditor === "Visual");

const parityOptions = useLocalStorage("featureEditParityOptions", {
	updateName: true,
	updateDescription: true,
});

watch(() => data.value?.name, (newName) => {
	if (isVisualEditor.value && parityOptions.value.updateName) {
		const automation = data.value?.automation as AttackModel | AttackModel[] | null;
		if (!automation)
			return;
		if (Array.isArray(automation))
			automation[0].name = newName || "";
		else
			automation.name = newName || "";
	}
});

watch(() => data.value?.description, (newDesc) => {
	if (isVisualEditor.value && parityOptions.value.updateDescription) {
		const automation = data.value?.automation as AttackModel | AttackModel[] | null;
		if (!automation)
			return;
		let auto = automation;
		if (Array.isArray(automation))
			auto = automation[0];

		for (const field of ((auto as AttackModel)?.automation || []).reverse() || []) {
			if (field.type === "text") {
				field.text = newDesc || "";
				(auto as AttackModel).automation.reverse();
				return;
			}
		}
	}
});

const setName = (newName: string) => {
	if (!data.value)
		return;
	data.value.name = newName;
};

const setDesc = (setDesc: string) => {
	if (!data.value)
		return;
	data.value.description = setDesc;
};

provide("setActionName", setName);
provide("setActionDescription", setDesc);

const addConsumable = () => {
	if (data.value?.consumables === null)
		data.value.consumables = []
	data.value?.consumables.push({
		name: 'New Counter',
		title: null,
		minv: '0',
		maxv: null,
		value: null,
		display_type: 'default',
		reset: null,
		reset_to: null,
		reset_by: null,
		desc: null,
		live_id: null,
		ddb_source_feature_id: null,
		ddb_source_feature_type: null,
	})
}

const rules = useRules()

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


let providerDisposable: Monaco.IDisposable | undefined

const registerProvider = (monaco: typeof Monaco) => {
	providerDisposable = monaco.languages.registerCompletionItemProvider('python', {
		triggerCharacters: ['.'],
		provideCompletionItems: (model, position) => {
			const word = model.getWordUntilPosition(position)
			const range = {
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: word.startColumn,
				endColumn: word.endColumn,
			}


			const suggestions = consumableContextHints.map((v) => ({
				label: v.name,
				kind: monaco.languages.CompletionItemKind.Variable,
				detail: `${v.detail}`,
				documentation: v.doc,
				insertText: v.name,
				range,
			}))

			return { suggestions }
		},
	})
}

onMounted(async () => {
	const monaco = await loader.init()
	registerProvider(monaco)
})

onBeforeUnmount(() => {
	providerDisposable?.dispose()
})

const copySingleCounter = (consumable: AutomationConsumable) => {
	const output = buildCounterOutput(consumable);
	navigator.clipboard.writeText(output);
	addToast(`Copied counter "${consumable.name}" to clipboard.`);
	void getUmami()?.track("Copy single counter");
}
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
		<v-icon-btn v-if="madeChanges && (isOwner || isEditor)" v-tooltip="'Save feature (CTRL+S)'"
			icon="mdi:content-save" text="Save creature" :class="{ inverted: !isSavingCreature }" size="24"
			:loading="isSavingCreature" @click="saveAutomation(true)" />
		<v-icon-btn
			v-tooltip="'Generate automation from description. May be incomplete or inaccurate. Only works for basic, to hit attacks.'"
			icon="fa7-solid:wand-sparkles"
			text="Generate automation from description. May be incomplete or inaccurate. Only works for basic, to hit attacks."
			size="24" @click="generateAutomation" />
		<v-icon-btn v-tooltip="'Change editor'" size="24" icon="mdi:code-block-braces" text="Change editor"
			@click="EditAutomationRef?.toggleEditor()" />
		<ImportAutomationUtil @load-feature="(feature, apiPath) => loadFeature(feature, apiPath)" />
		<ImportToCharacter :automation="data?.automation || null" :consumables="data?.consumables || null" />
		<v-icon-btn v-if="data && store.isMobile" v-tooltip="'Clear automation'" icon="mdi:delete"
			text="Clear automation" size="24" @click="data.automation = null" />
		<v-icon-btn v-if="data && store.isMobile" v-tooltip="'Copy automation'" icon="mdi:content-copy"
			text="Copy automation" size="24" @click="EditAutomationRef?.copyAutomation()" />
	</Breadcrumbs>
	<div v-if="data" class="content">
		<div class="pa-0">
			<v-row>
				<v-col cols="4">
					<v-text-field v-model="data.name" type="text" label="Feature name"
						:minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength" hide-details />
					<span v-if="isVisualEditor">
						<input v-model="parityOptions.updateName" type="checkbox" style="scale: .7; translate: 0 4px">
						<small style="font-size: x-small;"> <i>Updates the name of the first action in the automation
								structure to this text while enabled.</i> </small>
					</span>

					<v-text-field v-model="data.tag" label="Tag" class="mt-4"
						hint="Use this to organize your automations on the collection page." />


					<div v-if="!isVisualEditor && showDescriptionButtons" class="mt-4">
						<b class="mt-4"> Descriptions: </b>
						<span style="color: rgb(var(--v-theme-error))"> Don't match. </span>
						<p style="text-decoration: underline; font-size: smaller; cursor: pointer;"
							@click="updateAutomationDescFromFeatureDesc">
							Update from feature
						</p>
						<p style="text-decoration: underline; font-size: smaller; cursor: pointer"
							@click="updateFeatureDescFromAutomationDesc">
							Update from automation
						</p>
					</div>
				</v-col>
				<v-col cols="8">
					<Editor v-model="data.description" :height="115" />
					<span v-if="isVisualEditor" class="sub-action">
						<input v-model="parityOptions.updateDescription" type="checkbox">
						<small> <i>Updates the last text node of the first action in the automation structure to this
								text
								while
								enabled.</i> </small>
					</span>
				</v-col>
			</v-row>
		</div>

		<EditAutomation ref="EditAutomationRef" v-model="data.automation" v-model:is-visual-editor="isVisualEditor"
			:name="data.name" />

		<v-card title="Custom Counters" class="pa-4 d-flex flex-column"
			subtitle="You can define Custom Counters for Avrae Characters here. Importing this action will import this Custom Counter too."
			bg-color="surface-light" color="surface-light">
			<v-card-text class="flex-grow-1" bg-color="surface-light">
				<v-list density="compact" class="text-left my-4" max-height="1000">
					<v-list-group v-for="consumable, idx of data.consumables">
						<template #activator="{ props, isOpen }">
							<v-list-item v-bind="props" :title="consumable.name" :subtitle="consumable.desc || ''">
								<template #append>

									<v-icon-btn text="Copy counter" icon="$avrae"
										@click.stop="copySingleCounter(consumable)" />
									<v-icon-btn text="Delete counter" icon="mdi:delete"
										@click.stop="data.consumables?.splice(idx, 1)" />

									<v-icon icon="mdi:chevron-down" :class="{ 'rotate-180': isOpen }"
										class="transition-transform" />
								</template>
							</v-list-item>
						</template>
						<v-container class="pa-4">
							<v-row density="comfortable">
								<v-col cols="6">
									<v-text-field v-model="consumable.name"
										:rules="[rules.required(), rules.minLength(1)]" label="Name"></v-text-field>
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

					<v-list-item title="Add Consumable" prepend-icon="mdi:plus" @click="addConsumable"
						v-if="!data.consumables || data.consumables.length < 16" />
				</v-list>
			</v-card-text>
		</v-card>
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

:deep(.v-card-item) {
	padding: 0;
}

.transition-transform {
	transition: transform 0.2s ease;
}

.rotate-180 {
	transform: rotate(180deg);
}
</style>
