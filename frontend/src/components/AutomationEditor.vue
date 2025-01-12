<script setup lang="ts">
import { defineComponent, h, markRaw, onMounted, provide, ref } from "vue";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import YAML from "yaml";
import { toast } from "vue-sonner";
import LabelledComponent from "./LabelledComponent.vue";
import Markdown from "./Markdown.vue";
import VisualEditor from "./VisualEditor/VisualEditor.vue";
import { useFetch } from "@/utils/utils";
import { type AttackModel, type Automation, type FeatureEntity, type Id, parseDescIntoAutomation } from "~/shared";
import { store } from "@/utils/store";

const { data, isStandAlone = false, creatureName = "$NAME$" } = defineProps<{ data: FeatureEntity | Automation; isStandAlone?: boolean; creatureName?: string }>();

const emit = defineEmits<{
	(e: "savedStandaloneData"): void;
}>();

const hasEditedName = ref(false);

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
	const { success, data: fData, error } = await useFetch(`/api/${apiPath}/${encodeURIComponent(_id?.toString() ?? name)}`);
	let feature: ImportedData | null = null;
	if (!success) {
		toast.error(`Error: ${error}`);
		return;
	}
	feature = fData as ImportedData | null;

	if (!feature) {
		toast.error(`Error: Failed to import ${name}`);
		return;
	}

	if (data.name === "New Feature" || !hasEditedName.value) {
		if (apiPath === "srd-feature" && feature.name.includes(" - "))
			data.name = feature.name.split("-").slice(1).join("-").trim();
		else data.name = feature.name;
	}

	if (feature.description)
		data.description = feature.description.replaceAll("$NAME$", creatureName);

	// For basic examples, description is not set on the main object but only as the last text node in the automation.
	if (!feature.description && apiPath === "basic-example" && feature.automation && !Array.isArray(feature.automation)) {
		const lastNode = feature.automation.automation[feature.automation.automation.length - 1];
		if (lastNode.type === "text" && typeof (lastNode.text) === "string")
			data.description = lastNode.text;
	}

	if (Array.isArray(feature.automation)) {
		for (const feat of feature.automation) {
			if (apiPath === "srd-feature" && feat.name.includes(" - "))
				feat.name = feat.name.split("-").slice(1).join("-").trim();
		}
	}

	automation.value = feature.automation;
	await saveAutomation(false);
};

// Automation
const automation = ref<null | AttackModel | AttackModel[]>(data.automation);
provide("automation", automation);
onMounted(() => {
	automation.value = data.automation || null;
});

// watch(automation, () => validateYaml());

const saveAutomation = async (shouldNotify = false) => {
	// validate it as valid avrae automation
	const { error } = await useFetch("/api/validate/automation", "POST", automation.value);

	if (shouldNotify && error) {
		const CustomDiv = defineComponent({
			setup() {
				return () =>
					h("div", {
						innerHTML: error
					});
			}
		});
		toast(markRaw(CustomDiv), { duration: 0, });
		toast.error(error);
		return;
	}

	if (isStandAlone && "_id" in data) {
		// save standalone to database
		const { success, error } = await useFetch<FeatureEntity>(`/api/automation/${data._id?.toString()}/update`, "POST", data);
		if (success && shouldNotify) {
			emit("savedStandaloneData");
		}
		else if (!success) {
			if (shouldNotify)
				toast.error(`${data.name || "Unnamed feature"}: ${error}`);
			return;
		}
	}

	if (shouldNotify)
		toast.success("Successfully saved automation!");
};

const generateAutomation = async () => {
	const result = parseDescIntoAutomation(data.description, data.name, 0)[0];
	if (result) {
		try {
			automation.value = result;
			await saveAutomation(false);
		}
		catch {
			toast.error("Something went when generating automation!");
		}
	}
};
</script>

<template>
	<div class="vertical-container">
		<div class="two-wide">
			<div class="two-wide">
				<div class="editor-field__container">
					<LabelledComponent title="Feature name" for="featurename">
						<input id="featurename" v-model="data.name" type="text" placeholder="Enter name" :minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength" @change="hasEditedName = true">
					</LabelledComponent>
					<LabelledComponent title="Save automation" for="saveautomation">
						<button id="saveautomation" class="btn confirm" @click="saveAutomation(true)">
							Save
						</button>
					</LabelledComponent>
				</div>
				<div class="editor-field__container">
					<LabelledComponent title="Generate" for="generate">
						<button id="generate" v-tooltip="'Generate automation from description. May be incomplete or inaccurate. Only works for basic, to hit attacks.'" class="btn" @click="generateAutomation">
							Generate
							<font-awesome-icon :icon="['fas', 'circle-info']" />
						</button>
					</LabelledComponent>
				</div>
			</div>
			<div class="two-wide">
				<div class="editor-field__container">
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
				</div>

				<div class="editor-field__container">
					<LabelledComponent title="Feature description" for="featuredescription">
						<textarea id="featuredescription" v-model="data.description" height="94" placeholder="Enter description" style="height: 135px; max-height: 135px; resize: none;" :maxlength="store.limits?.descriptionLength" />
					</LabelledComponent>
				</div>
			</div>
		</div>
		<hr>
		<div>
			<VisualEditor v-model="automation" :name="data.name" />
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
	.two-wide,
	.two-wide.uneven {
		gap: 1rem;
		grid-template-columns: 1fr;
	}
}

@media screen and (max-width: 1200px) {
	.two-wide.uneven {
		gap: 1rem;
		grid-template-columns: 1fr 2fr;
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

.vertical-container {
	width: 100%;

	.two-wide {
		margin-bottom: 0.75rem;
	}
	.editor-field__container {
		gap: 0;
		margin-bottom: 0;
	}
}

.docs-container {
	width: 100%;
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
