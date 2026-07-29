<script setup lang="ts">
import type { AttackModel, AutomationDocumentation, AutomationWithType, FeatureEntity } from "~/shared";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import YAML from "yaml";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import Markdown from "@/components/Global/Markdown.vue";
import { $toast, htmlToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { useParityHelper } from "./useParityHelpers";
import { defaultNodes } from "../VisualEditor/util";

const props = withDefaults(defineProps<{ data: AutomationWithType; creatureName?: string }>(), { creatureName: "$NAME$" });

const emit = defineEmits<{
	(e: "savedStandaloneData"): void;
}>();
const errorMessage = ref<null | string>(null);
const hasEditedName = ref(false);
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
		$toast.error("YAML contains Error. Failed to save automation");
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
			$toast.error(htmlToast(error));
			return;
		}
	}

	// save standalone to database
	const { success, error } = await useFetch<FeatureEntity>(`/api/automation/${props.data.id.toString()}/update`, "POST", props.data);

	if (!success) {
		$toast.error(error);
		return;
	}
	else {
		emit("savedStandaloneData");
	}

	$toast.success("Successfully saved automation!");
};

// Documentation context by mouse location
const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);


// Documentation helpers
const docu = ref<AutomationDocumentation>({});
const selectedDocu = ref("")
onMounted(async () => {
	const { success, data } = await useFetch<AutomationDocumentation>("/api/automationDocumentation");
	if (success)
		docu.value = data;
});

const currentDocu = computed(() => {
	if (!selectedDocu.value) return;
	return docu.value[selectedDocu.value];
});

const { updateAutomationDescFromFeatureDesc, updateFeatureDescFromAutomationDesc, showDescriptionButtons } = useParityHelper(() => props.data.description, () => automationString.value, () => props.data.automation as AttackModel | AttackModel[] | null);

// utils
const copyAutomation = async () => {
	await navigator.clipboard.writeText(automationString.value);
	$toast.success("Copied automation to clipboard!");
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
						<input id="featurename" v-model="data.name" type="text" placeholder="Enter name" :minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength" @change="hasEditedName = true">
					</LabelledComponent>
					<LabelledComponent title="Save automation" for="saveAutomation">
						<button class="btn confirm" for="saveAutotomation" @click="saveAutomation()">
							Save Automation
						</button>
					</LabelledComponent>
				</div>

				<div class="editor-field__container">
					<LabelledComponent title="Feature description" for="featuredescription">
						<textarea id="featuredescription" v-model="data.description" height="94" placeholder="Enter description" style="height: 93px" :maxlength="store.limits?.descriptionLength" />
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
				{{ showDescriptionButtons }}
				<div v-if="showDescriptionButtons && (!errorMessage || errorMessage.length === 0)">
					<hr>
					<p class="warning">
						Feature description and last automation text node do not match.
					</p>
					<p>You can update the other with the buttons here.</p>
					<div class="two-wide editor-field__container">
						<LabelledComponent title="Update from automation">
							<button class="btn" @click="updateFeatureDescFromAutomationDesc">
								Update
							</button>
						</LabelledComponent>
						<LabelledComponent title="Update from description">
							<button class="btn" @click="updateAutomationDescFromFeatureDesc">
								Update
							</button>
						</LabelledComponent>
					</div>
				</div>
			</div>
			<div class="automation-editor">
				<VueMonacoEditor v-model:value="automationString" theme="vs-dark" :options="{ wordWrap: 'on', theme: 'vs-dark', minimap: { enabled: false }, formatOnPaste: true, formatOnType: true, automaticLayout: true, scrollBeyondLastLine: false }" height="750px" language="yaml" @mount="handleMount" />
			</div>
		</div>
		<div class="documentation-container">
			<h3> Documentation</h3>
			<p> Select documentation to view:</p>
			<div>
				<select class="ghost" v-model="selectedDocu">
					<option v-for="key of Object.keys(defaultNodes)">
						{{ key }}
					</option>
				</select>
			</div>
			<div v-if="currentDocu" class="docs">
				<hr>
				<h3>Documentation: {{ selectedDocu }}</h3>
				<Markdown class="small" :text="currentDocu.desc" />

				<div>
					<hr>
					<h4>Overview</h4>
					See full documentation <a :href="`https://avrae.readthedocs.io/en/stable/automation_ref.html#${currentDocu.url}`" target="_blank">here</a>.
					<VueMonacoEditor
						v-if="currentDocu?.ts"
						:value="`// Values denoted with an ? are optional.\n${currentDocu.ts}`"
						theme="vs-dark"
						:options="{ wordWrap: 'on', theme: 'vs-dark', minimap: { enabled: false }, automaticLayout: true, readOnly: true, scrollBeyondLastLine: false }"
						language="typescript"
						height="200px"
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

.highlight {
	color: orangered;
	border-left: 3px solid orangered;
	padding: 3px;
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

.docs a {
	color: orangered;
}

.documentation-container {
	margin-top: 1rem;
	display: flex;
	flex-direction: column;
	gap: .5rem;
}
</style>
