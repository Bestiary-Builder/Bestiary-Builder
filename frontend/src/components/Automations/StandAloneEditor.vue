<script setup lang="ts">
import type { AutomationWithType, FeatureEntity } from "~/shared";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import { onMounted, ref, shallowRef, watch } from "vue";
import YAML from "yaml";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

const props = withDefaults(defineProps<{ data: AutomationWithType; creatureName?: string }>(), { creatureName: "$NAME$" });

const emit = defineEmits<{
	(e: "savedStandaloneData"): void;
}>();

const errorMessage = ref<null | string>(null);
const hasEditedName = ref(false);

const { addToast } = useToast()
// Automation
const automationString = ref("");
onMounted(() => {
	automationString.value = YAML.stringify(props.data.automation) ?? YAML.stringify(null);
});

watch(automationString, () => validateYaml());

const saveAutomation = async () => {
	let parsed: AutomationWithType["automation"] = null;
	try {
		parsed = YAML.parse(automationString.value);
	}
	catch {
		addToast("YAML contains Error. Failed to save automation", { color: "error" });
		return;
	}
	// parsed == null
	if (!parsed) {
		props.data.automation = null;
	}
	else {
		// validate it as valid avrae automation
		const { success, error } = await useFetch("/api/validate/automation", "POST", parsed);
		if (success) {
			props.data.automation = parsed;
		}
		else {
			addToast(error, { color: "error" });
			return;
		}
	}

	// save standalone to database
	const { success, error } = await useFetch<FeatureEntity>(`/api/automation/${props.data.id.toString()}/update`, "POST", props.data);

	if (!success) {
		addToast(error, { color: "error" });

		if (error.includes("includes blocked words or phrases"))
			void getUmami()?.track("Blocked words", { error });
		return;
	}
	else {
		emit("savedStandaloneData");
	}

	addToast("Successfully saved automation!", { color: "success" });
};

// Documentation context by mouse location
const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);

// utils
const copyAutomation = async () => {
	await navigator.clipboard.writeText(automationString.value);
	addToast("Copied automation to clipboard!");
};

const validateYaml = () => {
	try {
		YAML.parse(automationString.value);
		errorMessage.value = null;
		return true;
	}
	catch (err) {
		errorMessage.value = err as string;
		return false;
	}
};
</script>

<template>
	<div>
		<div class="">
			<div>
				<div class="editor-field__container two-wide">
					<LabelledComponent title="Feature name" for="featurename">
						<input id="featurename" v-model="data.name" type="text" placeholder="Enter name"
							:minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength"
							@change="hasEditedName = true">
					</LabelledComponent>
					<LabelledComponent title="Save automation" for="saveAutomation">
						<button class="btn confirm" for="saveAutotomation" @click="saveAutomation()">
							Save Automation
						</button>
					</LabelledComponent>
				</div>

				<div class="editor-field__container">
					<LabelledComponent title="Feature description" for="featuredescription">
						<textarea id="featuredescription" v-model="data.description" height="94"
							placeholder="Enter description" style="height: 93px"
							:maxlength="store.limits?.descriptionLength" />
					</LabelledComponent>
				</div>

				<div v-if="store.isMobile" class="editor-field__container two-wide">
					<LabelledComponent title="Clear automation" for="clearautomation">
						<button id="clearautomation" class="btn danger" @click="automationString = 'null'">
							Clear
						</button>
					</LabelledComponent>
					<LabelledComponent title="Copy Automation" for="copyautomation">
						<button id="copyautomation" class="btn" @click="copyAutomation()">
							Copy
						</button>
					</LabelledComponent>
				</div>
				<hr>
				<div v-if="errorMessage">
					<hr>
					<span class="yaml-error" v-html="errorMessage" />
				</div>
			</div>
			<div class="automation-editor">
				<VueMonacoEditor v-model:value="automationString" theme="vs-dark"
					:options="{ wordWrap: 'on', theme: 'vs-dark', minimap: { enabled: false }, formatOnPaste: true, formatOnType: true, automaticLayout: true, scrollBeyondLastLine: false }"
					height="750px" language="yaml" @mount="handleMount" />
			</div>
		</div>
	</div>
</template>

<style scoped lang="less">
.automation-editor {
	max-width: 1fr;
}

a {
	color: orangered;
}

.two-wide {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;

	&.uneven {
		grid-template-columns: 1fr 2fr;
		max-width: 100%;
	}
}

.three-wide {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr 1fr;
}

@media screen and (max-width: 1080px) {
	.three-wide {
		grid-template-columns: 1fr 1fr;
	}
}

@media screen and (max-width: 950px) {

	.three-wide,
	.two-wide {
		gap: 1rem;
		grid-template-columns: 1fr;
	}
}

@media screen and (max-width: 1660px) {
	.two-wide.uneven {
		gap: 1rem;
		grid-template-columns: 1fr 1fr;
	}
}

@media screen and (max-width: 1200px) {
	.two-wide.uneven {
		gap: 1rem;
		grid-template-columns: 1fr;
	}
}

.editor-field__container {
	display: grid;
	gap: 1rem 2rem;
	margin-bottom: 1rem;

	.flow-vertically {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;

		.button-container p {
			display: flex;
			justify-content: space-between;
		}
	}

	.editor-field__title .text {
		font-weight: bold;
		text-decoration: underline;
	}

	textarea {
		min-height: 46px;
		height: 46px;
	}
}

.save-custom-automation {
	cursor: pointer;
	transition: color ease-in-out 0.2s;

	&:hover {
		color: orangered;
	}
}
</style>

<style lang="less">
// html comes in from the validation api through v-html, therefore is not in scope.
.yaml-error {
	color: var(--color-destructive);
	display: flex;
	flex-direction: column;
	font-weight: bold;
}

.validation-error-header {
	margin: 0 0 0.5em 0;
}

.validation-error-list {
	margin: 0 0 0.25em 0;
}

.validation-error-item {
	margin: 0;
}
</style>
