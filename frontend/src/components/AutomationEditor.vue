<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import YAML from "yaml";
import LabelledComponent from "./LabelledComponent.vue";
import Markdown from "./Markdown.vue";
import { useFetch } from "@/utils/utils";
import { toast } from "@/utils/app/toast";
import { type Automation, type AutomationDocumentation, type FeatureEntity, type Id, parseDescIntoAutomation } from "~/shared";
import { store } from "@/utils/store";

const props = withDefaults(defineProps<{ data: FeatureEntity | Automation; isStandAlone?: boolean; creatureName?: string }>(), { isStandAlone: false, creatureName: "$NAME$" });

const emit = defineEmits<{
	(e: "savedStandaloneData"): void;
}>();

const errorMessage = ref<null | string>(null);

const hasEditedName = ref(false);

// unfinished
const _isVisualEditor = ref(false);

// Imported automation helpers
interface myAutomationSkeleton {
	name: string;
	_id: Id;
}
interface LoadedAutomation {
	basicExamples: string[];
	srdFeatures: string[];
	myAutomation: myAutomationSkeleton[];
}

const loadedAutomation = ref<LoadedAutomation>({
	basicExamples: [],
	srdFeatures: [],
	myAutomation: []
});

const loadImportedAutomation = async (apiPath: string, saveTo: keyof LoadedAutomation) => {
	const { success, data, error } = await useFetch<string[] & myAutomationSkeleton[]>(`/api/${apiPath}`);
	if (success) {
		loadedAutomation.value[saveTo] = data;
	}
	else {
		loadedAutomation.value[saveTo] = [];
		toast.error(error);
	}
};

onMounted(async () => {
	await loadImportedAutomation("basic-examples/list", "basicExamples");
	await loadImportedAutomation("srd-features/list", "srdFeatures");
	await loadImportedAutomation("my-automations", "myAutomation");
});

type ImportedData = FeatureEntity | Automation;
const importAutomation = async (apiPath: "automation" | "basic-example" | "srd-feature", name: string, _id: Id | null = null) => {
	const { success, data, error } = await useFetch(`/api/${apiPath}/${encodeURIComponent(_id?.toString() ?? name)}`);
	let feature: ImportedData | null = null;
	if (!success) {
		toast.error(`Error: ${error}`);
		return;
	}
	feature = data as ImportedData | null;

	if (!feature) {
		toast.error(`Error: Failed to import ${name}`);
		return;
	}

	if (props.data.name === "New Feature" || !hasEditedName.value) {
		if (apiPath === "srd-feature" && feature.name.includes(" - "))
			props.data.name = feature.name.split("-").slice(1).join("-").trim();
		else props.data.name = feature.name;
	}

	if (feature.description)
		props.data.description = feature.description.replaceAll("$NAME$", props.creatureName);

	// For basic examples, description is not set on the main object but only as the last text node in the automation.
	if (!feature.description && apiPath === "basic-example" && feature.automation && !Array.isArray(feature.automation)) {
		// @ts-expect-error Automation is untyped.
		props.data.description = feature.automation.automation[feature.automation.automation.length - 1].text;
	}

	if (Array.isArray(feature.automation)) {
		for (const feat of feature.automation) {
			if (apiPath === "srd-feature" && (feat.name as string).includes(" - "))
				feat.name = (feat.name as string).split("-").slice(1).join("-").trim();
		}
	}

	automationString.value = YAML.stringify(feature.automation);
	await saveAutomation(false);
};

// Automation
const automationString = ref("");
onMounted(() => {
	automationString.value = YAML.stringify(props.data.automation) ?? YAML.stringify(null);
});

watch(automationString, () => validateYaml());

const saveAutomation = async (shouldNotify = false) => {
	// if standalone: saving commits the change to the database
	// if not standalone: saving saves automation into the FeatureEntity object so it is preserved between opening/closen and dragging features, but not to the database
	let parsed: Automation["automation"] = null;
	try {
		parsed = YAML.parse(automationString.value);
	}
	catch {
		if (shouldNotify)
			toast.error("YAML contains Error. Failed to save automation");
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
			if (shouldNotify)
				toast.error(error);
			return;
		}
	}

	if (props.isStandAlone && "_id" in props.data) {
		// save standalone to database
		const { success, error } = await useFetch<FeatureEntity>(`/api/automation/${props.data._id?.toString()}/update`, "POST", props.data);
		if (success && shouldNotify) {
			emit("savedStandaloneData");
		}
		else if (!success) {
			if (shouldNotify)
				toast.error(`${props.data.name || "Unnamed feature"}: ${error}`);
			return;
		}
	}
	else {
		// save not standalone into statblock object, but not commited to db.
		props.data.automation = parsed;
	}

	if (shouldNotify)
		toast.success("Successfully saved automation!");
};

// Documentation context by mouse location
const currentContext = ref("");

const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);
const cursorPosition = ref(0);

const ourInterval = setInterval(() => {
	cursorPosition.value = editorRef.value?.getModel().getOffsetAt(editorRef.value?.getPosition());
}, 1000);

onUnmounted(() => {
	clearInterval(ourInterval);
});

watch(cursorPosition, () => getContext());

const getContext = () => {
	const textToTraverse = automationString.value;
	let buffer = "";
	let type = "";
	let startingPosition = cursorPosition.value;

	// if the user has their cursor on the word type, it would begin the buffer in that word and would not be able to detect it.
	// Therefore before we start we check if the immediate vicinity of our cursor includes type:. if it does, start 6 characters later so we can properly extract the type.
	// clamp slices to string min and max, to be sure it doesn't go out of range
	const closeVicinity = textToTraverse.slice(Math.max(startingPosition - 6, 0), Math.min(startingPosition + 6, textToTraverse.length));
	if (closeVicinity.includes("type:"))
		startingPosition += 6;

	// from our position in the string we go backwards until we find the first type: string.
	// Then we get our first word after that type:
	// Works both with yaml or json string
	// Assumes that type: is always at the beginning of a node, and that a user does not have type: in a text field
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

// Documentation helpers
const docu = ref<AutomationDocumentation>({});

onMounted(async () => {
	const { success, data } = await useFetch<AutomationDocumentation>("/api/automationDocumentation");
	if (success)
		docu.value = data;
});

const currentDocu = computed(() => {
	return docu.value[currentContext.value];
});

// Description parity helpers
const updateFeatureDescFromAutomationDesc = () => {
	let auto;
	try {
		auto = YAML.parse(automationString.value);
	}
	catch {
		return;
	}
	if (Array.isArray(auto))
		return;
	for (const field of auto?.automation?.reverse() || []) {
		if (field.type === "text") {
			props.data.description = field.text;
			return;
		}
	}
};

const updateAutomationDescFromFeatureDesc = () => {
	let auto;
	try {
		auto = YAML.parse(automationString.value);
	}
	catch {
		return;
	}
	if (Array.isArray(auto))
		return;
	for (const field of auto?.automation?.reverse() || []) {
		if (field.type === "text") {
			field.text = props.data.description;
			auto.automation.reverse();
			automationString.value = YAML.stringify(auto);
			return;
		}
	}
};

const getAutomationDescription = (): string | boolean => {
	let auto;
	try {
		auto = YAML.parse(automationString.value);
	}
	catch {
		return false;
	}
	if (Array.isArray(auto))
		return false;
	if (!props.data.automation || !auto || auto?.automation?.length === 0)
		return false;
	for (const field of auto?.automation?.reverse() || []) {
		if (field?.type === "text")
			return field.text;
	}
	return "";
};

const showDescriptionButtons = computed(() => {
	const desc = props.data.description;
	const autoDesc = getAutomationDescription();
	if (Array.isArray(props.data.automation) || !desc || !autoDesc)
		return false;
	if (desc !== autoDesc)
		return true;
	return false;
});

// utils
const copyAutomation = async () => {
	await navigator.clipboard.writeText(automationString.value);
	toast.success("Copied automation to clipboard!");
};

const generateAutomation = async () => {
	const result = parseDescIntoAutomation(props.data.description, props.data.name, 0)[0];
	if (result) {
		try {
			automationString.value = YAML.stringify(result);
			await saveAutomation(false);
		}
		catch {
			toast.error("Something went when generating automation!");
		}
	}
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

// If a user saves automation from a non-standalone editor into their automations.
const saveCustomAutomation = async () => {
	if (props.isStandAlone)
		return;
	const { success, error } = await useFetch(`/api/automation/add`, "POST", { name: props.data.name, description: props.data.description, automation: props.data.automation });
	if (success) {
		await loadImportedAutomation("my-automations", "myAutomation");
		toast.success("Successfully added automation!");
	}
	else { toast.error(error); }
};
</script>

<template>
	<div class="two-wide uneven">
		<div>
			<div class="editor-field__container two-wide">
				<LabelledComponent title="Feature name" for="featurename">
					<input id="featurename" v-model="data.name" type="text" placeholder="Enter name" :minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength" @change="hasEditedName = true">
				</LabelledComponent>
				<LabelledComponent title="Documentation">
					<div>
						<a href="https://avrae.readthedocs.io/en/stable/automation_ref.html"> Documentation</a> <br>
						<a v-tooltip="'Edit automation on a character to get access to the full fledged automation builder.'" href="https://avrae.io/dashboard/characters"> Automation Editor</a>
					</div>
				</LabelledComponent>
			</div>

			<div class="editor-field__container">
				<LabelledComponent title="Feature description" for="featuredescription">
					<textarea id="featuredescription" v-model="data.description" height="94" placeholder="Enter description" style="height: 93px" :maxlength="store.limits?.descriptionLength" />
				</LabelledComponent>
			</div>

			<div class="editor-field__container two-wide">
				<LabelledComponent title="Save automation" for="saveautomation">
					<button id="saveautomation" class="btn confirm" @click="saveAutomation(true)">
						Save
					</button>
				</LabelledComponent>
				<LabelledComponent title="Generate" for="generate">
					<button id="generate" v-tooltip="'Generate automation from description. May be incomplete or inaccurate. Only works for basic, to hit attacks.'" class="btn" @click="generateAutomation">
						Generate
						<font-awesome-icon :icon="['fas', 'circle-info']" />
					</button>
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
			<div class="editor-field__container">
				<LabelledComponent title="Import SRD feature" for="importsrdfeature">
					<v-select :options="loadedAutomation.srdFeatures" input-id="importsrdfeature" @option:selected="(selected : string) => (importAutomation('srd-feature', selected)) " />
				</LabelledComponent>
			</div>

			<div class="editor-field__container">
				<LabelledComponent title="Import basic example" for="importbasicexample">
					<v-select :options="loadedAutomation.basicExamples" input-id="importbasicexample" @option:selected="(selected : string) => (importAutomation('basic-example', selected))" />
				</LabelledComponent>
			</div>

			<div v-if="!isStandAlone" class="editor-field__container">
				<LabelledComponent title="Import custom automation" for="importcustomautomation">
					<v-select :options="loadedAutomation.myAutomation" input-id="importcustomautomation" label="name" @option:selected="(selected : myAutomationSkeleton) => (importAutomation('automation', selected.name, selected._id))" />
				</LabelledComponent>
			</div>

			<div v-if="errorMessage">
				<hr>
				<span class="yaml-error" v-html="errorMessage" />
			</div>
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
			<!-- <LabelledComponent title="Change Editors" @click="isVisualEditor = !isVisualEditor"> -->
			<VueMonacoEditor v-model:value="automationString" theme="vs-dark" :options="{ wordWrap: 'on', theme: 'vs-dark', minimap: { enabled: false }, formatOnPaste: true, formatOnType: true, automaticLayout: true, scrollBeyondLastLine: false }" height="750px" language="yaml" @mount="handleMount" />
			<!-- <TreeRoot v-else :data="automationString" /> -->
			<!-- </LabelledComponent> -->
			<span v-if="!isStandAlone && automationString" class="save-custom-automation" @click="saveCustomAutomation()">Click to save as a reusable custom automation!</span>
		</div>
	</div>
	<div class="two-wide uneven">
		<div />
		<div v-if="currentDocu" class="docs">
			<hr>
			<h3>Documentation: {{ currentContext }}</h3>
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
</style>
