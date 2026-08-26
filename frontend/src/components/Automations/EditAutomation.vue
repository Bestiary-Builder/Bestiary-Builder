<script setup lang="ts">
import type { AttackModel, AutomationDocumentation } from "~/shared";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import { watchDebounced } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref, shallowRef, useTemplateRef, watch } from "vue";
import YAML from "yaml";
import Markdown from "@/components/Global/Markdown.vue";
import VisualEditor from "@/components/VisualEditor/VisualEditor.vue";
import { useToast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";

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

const automationString = ref(YAML.stringify(props.modelValue ?? null));
const yamlError = ref<string | null>(null);
let suppressNextModelSync = false;

watchDebounced(automationString, () => {
	if (props.isVisualEditor)
		return;
	try {
		const parsed = YAML.parse(automationString.value);
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
		automationString.value = YAML.stringify(newVal ?? null);
}, { deep: true });

const toggleEditor = () => {
	if (props.isVisualEditor) {
		// switching TO yaml mode
		automationString.value = YAML.stringify(props.modelValue ?? null);
		yamlError.value = null;
		emit("update:isVisualEditor", false);
	}
	else {
		// switching TO visual mode — must be valid yaml first
		try {
			const parsed = YAML.parse(automationString.value);
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

const currentDocu = computed(() => docu.value[currentContext.value]);
</script>

<template>
	<div v-if="!isVisualEditor" class="editor pt-4">
		<VueMonacoEditor
			v-model:value="automationString" theme="vs-dark"
			:options="{ wordWrap: 'on', theme: 'vs-dark', minimap: { enabled: false }, formatOnPaste: true, formatOnType: true, automaticLayout: true, scrollBeyondLastLine: false }"
			height="800px" language="yaml" @mount="handleMount"
		/>
		<small v-if="yamlError" style="color: rgb(var(--v-theme-error))">{{ yamlError }}</small>

		<div v-if="currentDocu" class="docs">
			<hr>
			<h3>Documentation: {{ currentContext }}</h3>
			<Markdown class="small" :text="currentDocu.desc" />

			<div>
				<hr>
				<h4>Overview</h4>
				See full documentation <a
					:href="`https://avrae.readthedocs.io/en/stable/automation_ref.html#${currentDocu.url}`"
					target="_blank"
				>here</a>.
				<VueMonacoEditor
					v-if="currentDocu?.ts"
					:value="`// Values denoted with an ? are optional.\n${currentDocu.ts}`" theme="vs-dark"
					:options="{ wordWrap: 'on', theme: 'vs-dark', minimap: { enabled: false }, automaticLayout: true, readOnly: true, scrollBeyondLastLine: false }"
					language="typescript" height="200px"
				/>
			</div>
			<div v-if="currentDocu?.opt">
				<hr>
				<h4>Options</h4>
				<ul>
					<li v-for="(info, name) in currentDocu.opt" :key="name">
						<span class="highlight">{{ name }}</span>
						<Markdown :text="info" />
					</li>
				</ul>
			</div>
			<div v-if="currentDocu?.variables">
				<hr>
				<h4>Exposed Variables</h4>
				<ul>
					<li v-for="(info, name) in currentDocu.variables" :key="name">
						<span class="highlight">{{ name }}</span>
						[<code>{{ info.type }}</code>]
						<Markdown :text="info.desc" />
					</li>
				</ul>
			</div>
		</div>
	</div>
	<div v-else style="margin-top: 2rem">
		<VisualEditor
			ref="VisualEditorRef" v-model="visualEditorModel" :name="name || ''"
			:no-list-attack="noListAttack"
		/>
	</div>
</template>

<style scoped lang="less">
.editor {
	margin-top: 1rem;
}

a {
	color: rgb(var(--v-theme-primary));
}
</style>
