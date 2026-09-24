<script setup lang="ts">
import type * as Monaco from "monaco-editor";
import type { AutomationDocumentation } from "~/shared";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import { computed, onMounted, ref, watch } from "vue";
import { useThemePersistence } from "@/utils/app/theme";
import { useFetch } from "@/utils/utils";
import Markdown from "../Global/Markdown.vue";

// Documentation helpers
const docu = ref<AutomationDocumentation>({});
const model = defineModel<string>();

const internalValue = ref(model.value);
watch(() => model.value, (newValue) => {
	internalValue.value = newValue;
});

onMounted(async () => {
	const { success, data } = await useFetch<AutomationDocumentation>("/api/automationDocumentation");
	if (success)
		docu.value = data;
});

const currentDocu = computed(() => {
	if (!internalValue.value)
		return;
	return docu.value[internalValue.value];
});

const { monacoTheme } = useThemePersistence();

const editorOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
	wordWrap: "on",
	minimap: { enabled: false },
	automaticLayout: true,
	readOnly: true,
	scrollBeyondLastLine: false,
	quickSuggestions: false,
	suggestOnTriggerCharacters: false,
	parameterHints: { enabled: false },
	hover: { enabled: "off" },
};

const options = [
	{ title: "Target", value: "target" },
	{ title: "Attack", value: "attack" },
	{ title: "Save", value: "save" },
	{ title: "Damage", value: "damage" },
	{ title: "TempHP", value: "temphp" },
	{ title: "IEffect", value: "ieffect2" },
	{ title: "Passive Effects", value: "PassiveEffects" },
	{ title: "Attack Interaction", value: "attackroot" },
	{ title: "Button Interaction", value: "buttonroot" },
	{ title: "Attack Root", value: "noderoot" },
	{ title: "Remove IEffect", value: "remove_ieffect" },
	{ title: "Roll", value: "roll" },
	{ title: "Text", value: "text" },
	{ title: "Set Variable", value: "variable" },
	{ title: "Condition", value: "condition" },
	{ title: "Use Counter", value: "counter" },
	{ title: "Cast Spell", value: "spell" },
	{ title: "Check", value: "check" },
];
</script>

<template>
	<div class="documentation-container">
		<v-select v-model="internalValue" :items="options" label="Choose option to view" density="comfortable"
			hide-details variant="outlined" max-width="500px" />
		<div v-if="currentDocu" class="docs">
			<Markdown class="small" :text="currentDocu.desc" />
			<div>
				See full documentation <a
					:href="`https://avrae.readthedocs.io/en/stable/automation_ref.html#${currentDocu.url}`"
					target="_blank">here</a>.
				<VueMonacoEditor v-if="currentDocu?.ts"
					:value="`// Values denoted with an ? are optional.\ninterface ${currentDocu.class} ${currentDocu.ts}`"
					:theme="monacoTheme" :options="editorOptions" language="typescript" height="200px" class="mt-4" />
			</div>
			<div v-if="currentDocu?.opt">
				<h4>Options</h4>
				<v-divider thickness="2" />
				<ul>
					<li v-for="(info, name) in currentDocu.opt" :key="name">
						<span class="highlight">{{ name }}</span>
						<Markdown :text="info" />
					</li>
				</ul>
			</div>
			<div v-if="currentDocu?.variables" id="exposedVariables">
				<h4>Exposed Variables</h4>
				<v-divider thickness="2" />
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
</template>

<style scoped>
.docs {
	gap: 1rem;
	display: flex;
	flex-direction: column;
}

.docs a {
	color: rgb(var(--v-theme-primary));
}

.documentation-container {
	margin-top: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.highlight {
	color: rgb(var(--v-theme-primary));
	border-left: 3px solid rgb(var(--v-theme-primary));
	padding: 3px;
}

ul li {
	line-height: 1.7rem;
}
</style>
