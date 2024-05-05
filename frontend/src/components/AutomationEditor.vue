<template>
	<div class="two-wide uneven">
		<div>
			<div class="editor-field__container two-wide">
				<LabelledComponent title="Feature name">
					<input type="text" id="featurename" placeholder="Enter name" v-model="data.name" @change="hasEditedName = true" />
				</LabelledComponent>
				<LabelledComponent title="Documentation">
					<div>
						<a href="https://avrae.readthedocs.io/en/stable/automation_ref.html"> Documentation</a> <br />
						<a href="https://avrae.io/dashboard/characters" v-tooltip="'Edit automation on a character to get access to the full fledged automation builder.'"> Automation Editor</a>
					</div>
				</LabelledComponent>
			</div>

			<div class="editor-field__container">
				<LabelledComponent title="Feature description">
					<textarea height="94" id="featuredescription" placeholder="Enter description" v-model="data.description" style="height: 93px" />
				</LabelledComponent>
			</div>

			<div class="editor-field__container two-wide">
				<LabelledComponent title="Save automation">
					<button class="btn confirm" @click="saveAutomation(true)" id="saveautomation">Save</button>
				</LabelledComponent>
				<LabelledComponent title="Generate">
					<button class="btn" @click="generateAutomation" v-tooltip="'Generate automation from description. May be incomplete or inaccurate. Only works for basic, to hit attacks.'" id="generate">
						Generate
						<font-awesome-icon :icon="['fas', 'circle-info']" />
					</button>
				</LabelledComponent>
			</div>

			<div class="editor-field__container two-wide" v-if="isMobile">
				<LabelledComponent title="Clear automation">
					<button class="btn danger" @click="automationString = 'null'" id="clearautomation">Clear</button>
				</LabelledComponent>
				<LabelledComponent title="Copy Automation">
					<button class="btn" @click="copyAutomation()" id="copyautomation">Copy</button>
				</LabelledComponent>
			</div>

			<hr />
			<div class="editor-field__container">
				<LabelledComponent title="Import SRD feature">
					<v-select :options="loadedAutomation.srdFeatures"  inputId="importsrdfeature" @option:selected="(selected : string) => (importAutomation('srd-feature', selected)) "/>
					<!-- <button class="btn move-down" @click="importSrdAction">Load</button> -->
				</LabelledComponent>
			</div>

			<div class="editor-field__container">
				<LabelledComponent title="Import basic example">
					<v-select :options="loadedAutomation.basicExamples" inputId="importbasicexample" @option:selected="(selected : string) => (importAutomation('basic-example', selected))"/>
					<!-- <button class="btn move-down" @click="importExample">Load</button> -->
				</LabelledComponent>
			</div>

			<div class="editor-field__container" v-if="!isStandAlone">
				<LabelledComponent title="Import custom automation">
					<v-select :options="loadedAutomation.myAutomation"  inputId="importcustomautomation" label="name" @option:selected="(selected : myAutomationSkeleton) => (importAutomation('basic-example', selected.name, selected._id))"/>
					<!-- <button class="btn move-down" @click="importCustomAutomation">Load</button> -->
				</LabelledComponent>
			</div>

			<div v-if="errorMessage">
				<hr />
				<span class="yaml-error" v-html="errorMessage"> </span>
			</div>
			<div v-if="showDescriptionButtons && (errorMessage == null || errorMessage?.length == 0)">
				<hr />
				<p class="warning">Feature description and last automation text node do not match.</p>
				<p>You can update the other with the buttons here.</p>
				<div class="two-wide editor-field__container">
					<LabelledComponent title="Update from automation">
						<button class="btn" @click="updateFeatureDescFromAutomationDesc">Update</button>
					</LabelledComponent>
					<LabelledComponent title="Update from description">
						<button class="btn" @click="updateAutomationDescFromFeatureDesc">Update</button>
					</LabelledComponent>
				</div>
			</div>
		</div>
		<div class="automation-editor">
			<VueMonacoEditor
				v-model:value="automationString"
				theme="vs-dark"
				:options="{wordWrap: 'on', theme: 'vs-dark', minimap: {enabled: false}, formatOnPaste: true, formatOnType: true, automaticLayout: true, scrollBeyondLastLine: false}"
				height="750px"
				:language="getLanguage"
				@mount="handleMount"
			/>
			<span class="save-custom-automation" @click="saveCustomAutomation()" v-if="!isStandAlone && automationString">Click to save as a reusable custom automation!</span>
		</div>
	</div>
	<div class="two-wide uneven">
		<div></div>
		<div v-if="currentDocu" class="docs">
			<hr />
			<h3>Documentation: {{ currentContext }}</h3>
			<!-- <p class="small" v-html="md.render(currentDocu.desc)" /> -->
			<Markdown class="small" :text="currentDocu.desc as string" />

			<div>
				<hr />
				<h4>Overview</h4>
				See full documentation <a :href="'https://avrae.readthedocs.io/en/stable/automation_ref.html#' + currentDocu.url" target="_blank">here</a>.
				<VueMonacoEditor
					v-if="currentDocu?.ts"
					:value="'// Values denoted with an ? are optional.\n' + currentDocu.ts"
					theme="vs-dark"
					:options="{wordWrap: 'on', theme: 'vs-dark', minimap: {enabled: false}, automaticLayout: true, readOnly: true, scrollBeyondLastLine: false}"
					language="json"
					height="200px"
				/>
			</div>
			<div v-if="currentDocu?.opt">
				<hr />
				<h4>Options</h4>
				<ul>
					<li v-for="(info, name) in currentDocu.opt">
						<span class="highlight">{{ name }}</span> 
						<Markdown :text="info" />
					</li>
				</ul>
			</div>
			<div v-if="currentDocu?.variables">
				<hr />
				<h4>Exposed Variables</h4>
				<ul>
					<li v-for="(info, name) in currentDocu.variables">
						<span class="highlight">{{ name }}</span> 
						[<code>{{ info.type }}</code>] 
						<Markdown :text="info.desc" />
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {defineComponent, shallowRef, ref, onUnmounted, defineProps, withDefaults, defineEmits, onMounted, watch, computed} from "vue";
import {VueMonacoEditor} from "@guolao/vue-monaco-editor";
import YAML from "yaml";
import {toast, handleApiResponse, type error} from "@/main";
import {Id, type FeatureEntity, type Automation} from "~/shared";
import LabelledComponent from "./LabelledComponent.vue";
import Markdown from "./Markdown.vue";
import Modal from "./Modal.vue";
import {parseDescIntoAutomation} from "@/parser/utils";
import {isMobile} from "@/main";

const props = withDefaults(defineProps<{data: FeatureEntity | Automation, isStandAlone?: boolean, creatureName?: string}>(), { isStandAlone: false, creatureName: "$NAME$"})

const errorMessage = ref<null | string>(null);

const hasEditedName = ref(false);


const emit  = defineEmits<{
	(e: 'savedStandaloneData',): void
}>()



// Imported automation helpers
interface myAutomationSkeleton {
	name: string,
	_id: Id
}
interface LoadedAutomation {
	basicExamples: string[];
	srdFeatures: string[];
	myAutomation: myAutomationSkeleton[]
}

const loadedAutomation = ref<LoadedAutomation>({
	basicExamples: [],
	srdFeatures: [],
	myAutomation: []
})

const loadImportedAutomation = (apiPath: string, saveTo: keyof LoadedAutomation) => {
	fetch(`api/${apiPath}`).then(async (response: any) => {
		const result = await handleApiResponse<string[]>(response);
		// @ts-ignore
		if (result.success) loadedAutomation.value[saveTo] = result.data;
		else {
			loadedAutomation.value[saveTo] = [];
			toast.error((result.data as error).error)
		}
	})
}

onMounted(() => {
	loadImportedAutomation('basic-examples/list', 'basicExamples')
	loadImportedAutomation('srd-features/list', 'srdFeatures')
	loadImportedAutomation('my-automations', 'myAutomation')
})

type ImportedData = FeatureEntity | Automation
const importAutomation = async (apiPath: 'automation' | 'basic-example' | 'srd-feature' , name: string, _id : Id | null = null) => {
	fetch(`/api/${apiPath}/` + encodeURIComponent(_id?.toString() ?? name)).then(async (response: any) => {
		let feature : ImportedData | null = null;

		let result = await handleApiResponse<ImportedData | null>(response);
		if (!result.success) {
			toast.error("Error: " + (result.data as error).error);
			return;
		} 
		feature = result.data as ImportedData | null;

		if (!feature) {
			toast.error(`Error: Failed to import ${name}`)
			return;
		};

		if (props.data.name == "New Feature" || !hasEditedName.value) {
			if (apiPath == 'srd-feature' && feature.name.includes(" - ")) props.data.name = feature.name.split("-").slice(1).join("-").trim();
			else props.data.name = feature.name;
		}
		
		if (feature.description) {
			props.data.description = feature.description.replaceAll("$NAME$", props.creatureName);
		}


		if (Array.isArray(feature.automation)) {
			for (let feat of feature.automation) {
				feat.name = feat.name.split("-").slice(1).join("-").trim() ?? feat.name;
			}
		} 

		automationString.value = YAML.stringify(feature.automation);
		saveAutomation(false);

		toast.success("Successfully loaded: " + feature.name);
	});
}

// Automation
const automationString = ref("")
onMounted(() => {
	automationString.value = YAML.stringify(props.data.automation) ?? YAML.stringify(null);
})


watch(automationString, () => {
	validateYaml();
	// TODO: check if this is the best approach to handle these cases.
	if (props.data.name == "New Feature" || props.data.description == "") {
		try {
			let parsedAutomation = YAML.parse(automationString.value);
			if (Array.isArray(parsedAutomation)) {
				if (parsedAutomation.length > 0) parsedAutomation = parsedAutomation[0];
				else return;
			}

			if (parsedAutomation.name && props.data.name == "New Feature") props.data.name = parsedAutomation.name.replace(" (1H)", "").replace(" (2H)", "");

			if (parsedAutomation.automation && props.data.description == "") {
				for (let type in parsedAutomation.automation) {
					if (parsedAutomation.automation[type]["type"] == "text") {
						props.data.description = parsedAutomation.automation[type]["text"];
						break;
					}
				}
			}
		} catch {}
	}
})

	
const saveAutomation = (shouldNotify = false) => {
	//
}
// export default defineComponent({

// 		saveAutomation(shouldNotify = false) {
// 			try {
// 				let parsed = YAML.parse(this.automationString);
// 				if (parsed || parsed == null) {
// 					fetch("/api/validate/automation", {
// 						method: "POST",
// 						headers: {
// 							"Content-Type": "application/json"
// 						},
// 						body: JSON.stringify({
// 							data: parsed
// 						})
// 					})
// 						.then((response) => response.json())
// 						.then((data) => {
// 							// null is valid automation in our db, but not in the validator. Accept it here as valid.
// 							if (parsed != null && !data.success) {
// 								if (shouldNotify) toast.error("YAML contains Error, did not save automation");
// 								this.errorMessage = data.error;
// 							} else {
// 								this.data.automation = YAML.parse(this.automationString);
// 								if (this.isStandAlone) {
// 									fetch(`/api/automation/${this.data._id}/update`, {
// 										method: "POST",
// 										headers: {
// 											"Content-Type": "application/json"
// 										},
// 										body: JSON.stringify({
// 											data: this.data
// 										})
// 									}).then(async (response: any) => {
// 										let result = await handleApiResponse<FeatureEntity>(response);
// 										if (result.success && shouldNotify) {
// 											toast.success("Saved Automation!");
// 											this.$emit("savedStandaloneData");
// 										} else if (!result.success) {
// 											toast.error(`${this.data.name}:` + (result.data as error).error);
// 										}
// 									});
// 								}
// 								if (shouldNotify && !this.isStandAlone) toast.success("Saved Automation!");
// 							}
// 						});
// 				}
// 			} catch (err) {
// 				if (shouldNotify) toast.error("YAML contains Error, did not save automation");
// 			}
// 		},

// });


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

watch(cursorPosition, () => getContext())

const getContext = () => {
	const textToTraverse = automationString.value;
	let buffer = "";
	let type = "";
	let startingPosition = cursorPosition.value;

	// if the user has their cursor on the word type, it would begin the buffer in that word and would not be able to detect it.
	// Therefore before we start we check if the immediate vicinity of our cursor includes type:. if it does, start 6 characters later so we can properly extract the type.
	// clamp slices to string min and max, to be sure it doesn't go out of range
	const closeVicinity = textToTraverse.slice(Math.max(startingPosition - 6, 0), Math.min(startingPosition + 6, textToTraverse.length));
	if (closeVicinity.includes("type:")) startingPosition += 6;

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
}

// Documentation helpers
// TODO: type documentation
const docu = ref<Record<string, unknown>>({});

onMounted(() => {
	fetch("/api/automationDocumentation").then(async (response: any) => {
		let result = await handleApiResponse<Record<string, unknown>>(response);
		if (result.success) docu.value = result.data as Record<string, unknown>;
		else docu.value = {};
	})
})

const currentDocu = computed(() => {
	return docu.value[currentContext.value] as Record<string, unknown>;
})



// Description parity helpers
const updateFeatureDescFromAutomationDesc = () => {
	let auto;
	try {
		auto = YAML.parse(automationString.value);
	} catch {
		return;
	}
	if (Array.isArray(auto)) return;
	for (let field of auto?.automation?.reverse() || []) {
		if (field["type"] == "text") {
			props.data.description = field["text"];
			return;
		}
	}
}

const updateAutomationDescFromFeatureDesc = () => {
	let auto;
	try {
		auto = YAML.parse(automationString.value);
	} catch {
		return;
	}
	if (Array.isArray(auto)) return;
	for (let field of auto?.automation?.reverse() || []) {
		if (field["type"] == "text") {
			field["text"] = props.data.description;
			auto.automation.reverse();
			automationString.value = YAML.stringify(auto);
			return;
		}
	}
}

const getAutomationDescription = () : string | boolean =>  {
	let auto;
	try {
		auto = YAML.parse(automationString.value);
	} catch {
		return false;
	}
	if (Array.isArray(auto)) return false;
	if (props.data.automation || !auto || auto?.automation?.length == 0) return false;
	for (let field of auto?.automation?.reverse() || []) {
		if (field["type"] == "text") {
			return field["text"];
		}
	}
	return "";
}

const showDescriptionButtons = computed(()=> {
	const desc = props.data.description;
	const autoDesc = getAutomationDescription();
	if (Array.isArray(props.data.automation) || !desc || !autoDesc) return false;
	if (desc != autoDesc) return true;
	return false;
})


// utils
const copyAutomation = () => {
	navigator.clipboard.writeText(automationString.value);
	toast.success("Copied automation to clipboard!");
}

const generateAutomation = () => {
	const result = parseDescIntoAutomation(props.data.description, props.data.name, 0)[0];
	if (result) {
		try {
			automationString.value = YAML.stringify(result);
			saveAutomation(false);
		} catch {
			toast.error("Something went when generating automation!");
		}
	}
}

const validateYaml = () => {
	try {
		YAML.parse(automationString.value);
		errorMessage.value = null;
		return true;
	} catch (err) {
		errorMessage.value = err as string;
		return false;
	}
}

const getLanguage = computed(() => {
	if (automationString.value.startsWith("{") || automationString.value.startsWith("[")) return "json";
	return "yaml";
})

const saveCustomAutomation = () => {
	fetch(`/api/automation/add`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({data: {name: props.data.name, description: props.data.description, automation: props.data.automation}})
	}).then(async (response) => {
		let result = await handleApiResponse<{}>(response);
		if (result.success) {
			loadImportedAutomation('my-automations', 'myAutomation')
			toast.success("Successfully added automation!");
		} else toast.error((result.data as error).error);
	});
}
</script>

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

.move-down {
	margin-top: 0.4rem;
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
</style>

<style lang="less">
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
