<script setup lang="ts">
import type { Pair } from "yaml";
import type { AttackModel, AutomationDocumentation } from "~/shared";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import { useLocalStorage, watchDebounced } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch } from "vue";
import { useRoute } from "vue-router";
import { isSeq, parse, stringify } from "yaml";
import VisualEditor from "@/components/VisualEditor/VisualEditor.vue";
import { useThemePersistence } from "@/utils/app/theme";
import { useToast } from "@/utils/app/toast";
import { useOnboardingTour } from "@/utils/app/useOnboardingTour.js";
import { useFetch } from "@/utils/utils";
import AutomationDocumentationView from "./AutomationDocumentation.vue";

type AutomationValue = AttackModel | AttackModel[] | null;

const props = defineProps<{
	modelValue: AutomationValue;
	isVisualEditor: boolean;
	name?: string;
	noListAttack?: boolean;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: AutomationValue];
	"update:isVisualEditor": [value: boolean];
}>();

const { addToast } = useToast();

const visualEditorRef = useTemplateRef("VisualEditorRef");

// visual editor v-model proxy — can't bind v-model directly to a prop
const visualEditorModel = computed({
	get: () => props.modelValue,
	set: (val: AutomationValue) => emit("update:modelValue", val),
});

// sort states for automation strings
const rankEntry = (pair: Pair): number => {
	const key = (pair.key as { value?: unknown })?.value ?? pair.key;
	if (key === "type")
		return 0;
	if (key === "label")
		return 0;
	if (isSeq(pair.value))
		return 2;
	return 1;
};

const sortMapEntries = (a: Pair, b: Pair): number => rankEntry(a) - rankEntry(b);

const automationString = ref(stringify(props.modelValue ?? null, { sortMapEntries }));

const yamlError = ref<string | null>(null);
let suppressNextModelSync = false;

watchDebounced(automationString, () => {
	if (props.isVisualEditor)
		return;
	try {
		const parsed = parse(automationString.value);
		yamlError.value = null;
		suppressNextModelSync = true;
		emit("update:modelValue", parsed);
	}
	catch (err) {
		yamlError.value = err instanceof Error ? err.message : "Invalid YAML";
	}
}, { debounce: 400 });

// keep automationString in sync when modelValue changes from outside
// (loading a feature, generating automation, clearing it, description-parity edits)

watch(() => props.modelValue, (newVal) => {
	if (suppressNextModelSync) {
		suppressNextModelSync = false;
		return;
	}
	if (!props.isVisualEditor)
		automationString.value = stringify(newVal ?? null, { sortMapEntries });
}, { deep: true });

const toggleEditor = () => {
	if (props.isVisualEditor) {
		// switching TO yaml mode
		automationString.value = stringify(props.modelValue ?? null, { sortMapEntries });
		yamlError.value = null;
		emit("update:isVisualEditor", false);
	}
	else {
		// switching TO visual mode — must be valid yaml first
		try {
			const parsed = parse(automationString.value);
			emit("update:modelValue", parsed);
			emit("update:isVisualEditor", true);
		}
		catch (err) {
			addToast(`Error parsing automation YAML. ${err instanceof Error ? err.message : "An unexpected error occurred."}`, {
				timeout: 10000,
				color: "error",
			});
		}
	}
};

const copyAutomation = async () => {
	await navigator.clipboard.writeText(automationString.value);
	addToast("Copied automation to clipboard!");
};

const resetVisualEditorState = () => {
	if (visualEditorRef.value) {
		visualEditorRef.value.currentEffect = null;
		visualEditorRef.value.currentContext = [];
	}
};

defineExpose({
	toggleEditor,
	copyAutomation,
	resetVisualEditorState,
	yamlError,
});

// monaco
const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);

// documentation-by-cursor-position
const currentContext = ref("");
const cursorPosition = ref(0);

const cursorInterval = setInterval(() => {
	if (!props.isVisualEditor)
		cursorPosition.value = editorRef.value?.getModel()?.getOffsetAt(editorRef.value?.getPosition());
}, 1000);

onUnmounted(() => clearInterval(cursorInterval));

watch(cursorPosition, () => getContext());

const getContext = () => {
	const textToTraverse = automationString.value;
	let buffer = "";
	let type = "";
	let startingPosition = cursorPosition.value;

	const closeVicinity = textToTraverse.slice(Math.max(startingPosition - 6, 0), Math.min(startingPosition + 6, textToTraverse.length));
	if (closeVicinity.includes("type:"))
		startingPosition += 6;

	for (let i = startingPosition; i--; i < textToTraverse.length) {
		const char = textToTraverse.charAt(i);
		buffer = char + buffer;
		if (buffer.startsWith("type:")) {
			type = textToTraverse.slice(i).match(/type['"]?:\s*['"]?(\w+)['"]?/)?.[1] || "";
			break;
		}
	}

	currentContext.value = type;
};

const docu = ref<AutomationDocumentation>({});

onMounted(async () => {
	const { success, data } = await useFetch<AutomationDocumentation>("/api/automationDocumentation");
	if (success)
		docu.value = data;
});

const clear = () => {
	resetVisualEditorState();
	suppressNextModelSync = true;
	visualEditorModel.value = null;
};

const dismissed = useLocalStorage("newAutomationEditorDismissed", false);
const { startAutomationEditorWorkflow } = useOnboardingTour();

const initialize = () => {
	localStorage.setItem("automationDataStoredDuringWorkflow", JSON.stringify(visualEditorModel.value));
	suppressNextModelSync = true;
	visualEditorModel.value = { name: "Test attack", _v: 2, automation: [] };
};

const restore = () => {
	suppressNextModelSync = true;
	visualEditorModel.value = JSON.parse(localStorage.getItem("automationDataStoredDuringWorkflow") ?? "null");
};

const $route = useRoute();
const { monacoTheme } = useThemePersistence();
</script>

<template>
	<div v-if="!isVisualEditor" class="editor pt-4">
		<section>
			<VueMonacoEditor
				v-model:value="automationString" :theme="monacoTheme"
				:options="{ wordWrap: 'on', minimap: { enabled: false }, formatOnPaste: true, formatOnType: true, automaticLayout: true, scrollBeyondLastLine: false }"
				height="800px" language="yaml" @mount="handleMount"
			/>

			<small v-if="yamlError" style="color: rgb(var(--v-theme-error))">{{ yamlError }}</small>
			<v-divider class="mt-2" thickness="2" />

			<AutomationDocumentationView v-model="currentContext" />
		</section>
	</div>
	<div v-else class="mt-4">
		<v-alert
			v-if="!$route.path.includes('/character') && !dismissed" id="automation-workflow-alert"
			title="Welcome to the new Automation Editor" class="mb-4" variant="tonal"
			closable @click:close="dismissed = true" 
		>
		<template #prepend>
			<v-icon icon="mdi:creation-outline" color="primary" size="48"/>
		</template>
			<template #text>
				With update 3.0.0, you can now create Automation directly within Bestiary Builder.
				The automation editor includes smart features to make your life easier.
				You can also manage automation for your <RouterLink to="/characters"> characters. </RouterLink>
				You can also quickly import automation from and to characters to quickly iterate and test actions!
			</template>
			<template #append>
				<v-btn color="primary" @click="startAutomationEditorWorkflow" variant="elevated">
					Take the tour
				</v-btn>
			</template>
		</v-alert>
		<VisualEditor
			ref="VisualEditorRef" v-model="visualEditorModel" :name="name || ''"
			:no-list-attack="noListAttack" @clear-automation="clear" @take-tour="startAutomationEditorWorkflow"
		/>
	</div>

	<!-- These buttons allow us to interface with our state from the onboarding workflow without having to globally manage the state.
	These are clicked by the tour runner. -->
	<div style="visibility: hidden;">
		<button id="automation-workflow-initialize-data" @click="initialize" />
		<button id="automation-workflow-end-data" @click="restore" />
	</div>
</template>

<style scoped lang="less">
a {
	color: rgb(var(--v-theme-primary));
}

section {
	background-color: rgb(var(--v-theme-surface-light));
	min-height: 800px;
	padding: 1rem;
	border-radius: 4px;
	box-shadow: rgb(0 0 0 / 24%) 0 3px 8px;
}
</style>
