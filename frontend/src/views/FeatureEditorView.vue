<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { computed, nextTick, onMounted, onUnmounted, provide, ref, shallowRef, useTemplateRef, watch } from "vue";
import YAML from "yaml";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import { type AutomationDocumentation, type BestiaryExtended, type CreatureWithStats, type FeatureEntity, type Features, type Id, type Statblock, parseDescIntoAutomation } from "~/shared";
import { $loading } from "@/utils/app/loading";
import { useFetch } from "@/utils/utils";
import { toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import LabelledComponent from "@/components/LabelledComponent.vue";
import Markdown from "@/components/Markdown.vue";
import VisualEditor from "@/components/VisualEditor/VisualEditor.vue";

const $router = useRouter();
const $route = useRoute();
const type = $route.params.type as keyof Features;
const aid = $route.params.aid as any;
const data = ref<Statblock>();
const rawInfo = ref<CreatureWithStats | null>(null);

const visualEditorRef = useTemplateRef("VisualEditorRef");
// load creature data
onMounted(async () => {
	const loader = $loading.show();
	const { success, data: cData, error } = await useFetch<CreatureWithStats>(`/api/creature/${$route.params.id.toString()}`);
	if (success) {
		data.value = (cData).stats;
		await nextTick(() => madeChanges.value = false);
		rawInfo.value = cData;
		await loadRawInfo();
		await getBestiary();
		automationString.value = YAML.stringify(data.value.features[type][aid].automation) ?? YAML.stringify(null);

		loader.hide();
	}
	else {
		toast.error(`Error: ${error}`);
		madeChanges.value = false;
		await $router.push("/error");
		loader.hide();
	}
});

const madeChanges = ref(false);

// ownership
const isOwner = ref(false);
const isEditor = ref(false);
const shouldShowEditor = ref(false);
const loadRawInfo = async () => {
	const { success, data, error } = await useFetch<BestiaryExtended>(`/api/bestiary/${rawInfo.value?.bestiaryId}`);
	if (success) {
		bestiary.value = data;
		isOwner.value = store.user?.id === bestiary.value.ownerId;
		isEditor.value = (bestiary.value?.editors ?? []).map(e => e.userId).includes(store.user?.id ?? "");
		if (isOwner.value || isEditor.value)
			shouldShowEditor.value = true;
	}
	else {
		toast.error(error);
	}
};

const unwatch = watch(() => data.value,	() => {
	if (rawInfo.value == null)
		return;
	madeChanges.value = true;
	unwatch();
},	{ deep: true });

onBeforeRouteUpdate(() => {
	// just in case the user manages to navigate to a page that also uses StatblockEditorView
	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		if (!answer)
			return false;
	}
});
onBeforeRouteLeave(() => {
	// when the user leaves this route
	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		if (!answer)
			return false;
	}
});

const beforeUnLoad = (event: Event) => {
	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		event.preventDefault();
		event.returnValue = true;
	}
};

window.addEventListener("beforeunload", beforeUnLoad);
onUnmounted(() => {
	window.removeEventListener("beforeunload", beforeUnLoad);
});

const bestiary = ref<BestiaryExtended | null>(null);

async function getBestiary() {
	// Request bestiary info
	const { success, data, error } = await useFetch<BestiaryExtended>(`/api/bestiary/${rawInfo.value?.bestiaryId}`);
	if (!success) {
		bestiary.value = null;
		toast.error(error);
		return;
	}
	bestiary.value = data;
}

// saving
const isSaved = ref(false);
const saveStatblock = async (shouldNotify: boolean) => {
	if (!rawInfo.value || !data.value)
		return;
	rawInfo.value.stats = data.value;
	let loader;
	if (shouldNotify)
		loader = $loading.show();
	// Send to backend
	const { success, error } = await useFetch<CreatureWithStats>(`/api/creature/${rawInfo.value.id.toString()}/update`, "POST", rawInfo.value);
	if (success) {
		isSaved.value = true;
		if (shouldNotify)
			toast.success("Saved stat block");
		madeChanges.value = false;
		// watch data only once, as traversing the object deeply is expensive.
		const unwatch = watch(
			() => data.value,
			() => {
				madeChanges.value = true;
				unwatch();
			},
			{ deep: true }
		);
	}
	else {
		toast.error(`Error saving statblock. ${error}`, { duration: 10000 });
	}
	if (loader)
		loader.hide();
};

// Imported automation helpers
interface myAutomationSkeleton {
	name: string;
	id: Id;
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

type ImportedData = FeatureEntity;
const importAutomation = async (apiPath: "automation" | "basic-example" | "srd-feature", name: string, _id: Id | null = null) => {
	if (!data.value)
		return;
	const { success, data: iData, error } = await useFetch(`/api/${apiPath}/${encodeURIComponent(_id?.toString() ?? name)}`);
	let feature: ImportedData | null = null;
	if (!success) {
		toast.error(`Error: ${error}`);
		return;
	}
	feature = iData as ImportedData | null;

	if (!feature) {
		toast.error(`Error: Failed to import ${name}`);
		return;
	}

	feature.description.replaceAll("$NAME$", data.value.description.name);
	data.value.features[type][aid] = feature;

	if (apiPath === "basic-example" && feature.automation && !Array.isArray(feature.automation)) {
		const lastNode = feature.automation.automation[feature.automation.automation.length - 1];
		if (lastNode.type === "text") {
			if (typeof (lastNode.text) === "string")
				feature.description = lastNode.text;
			else
				feature.description = "";
		}
		else {
			feature.description = "";
		}

		automationString.value = YAML.stringify(feature.automation);
		data.value.features[type][aid] = feature;
	}
	if (visualEditorRef.value) {
		visualEditorRef.value.currentEffect = null;
		visualEditorRef.value.currentContext = [];
	}
	await saveStatblock(false);
};

const generateAutomation = async () => {
	if (!data.value)
		return;
	const result = parseDescIntoAutomation(data.value.features[type][aid].description, data.value.features[type][aid].name, 0)[0];
	if (result) {
		try {
			data.value.features[type][aid].automation = result;
			automationString.value = YAML.stringify(result);
		}
		catch {
			toast.error("Something went when generating automation!");
		}
	}
};

const copyAutomation = async () => {
	await navigator.clipboard.writeText(automationString.value);
	toast.success("Copied automation to clipboard!");
};

const automationString = ref("");
const automationStringValidated = ref(true);

watch(automationString, async () => {
	automationStringValidated.value = false;
	isSaved.value = false;
	await validateYaml();
});

const validateYaml = async () => {
	if (!data.value)
		return;
	try {
		const parsed = YAML.parse(automationString.value);
		data.value.features[type][aid].automation = parsed;
		automationStringValidated.value = true;
		await saveStatblock(false);
	}
	catch (err) {

	}
};

// monaco editor
const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);
// Documentation context by mouse location
const currentContext = ref("");
const cursorPosition = ref(0);

const ourInterval = setInterval(() => {
	if (!prefersVisualEditor.value)
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
	for (const field of (auto?.automation || []).reverse() || []) {
		if (field.type === "text" && data.value) {
			data.value.features[type][aid].description = field.text;
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
	for (const field of (auto?.automation || []).reverse() || []) {
		if (field.type === "text") {
			field.text = data.value?.features[type][aid].description;
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
	if (!data.value?.features[type][aid].automation || !auto || auto?.automation?.length === 0)
		return false;
	for (const field of auto?.automation?.reverse() || []) {
		if (field?.type === "text")
			return field.text;
	}
	return "";
};

const showDescriptionButtons = computed(() => {
	if (!data.value)
		return;
	const desc = data.value.features[type][aid].description;
	const autoDesc = getAutomationDescription();
	if (Array.isArray(data.value.features[type][aid].automation) || !desc || !autoDesc)
		return false;
	if (desc !== autoDesc)
		return true;
	return false;
});

const prefersVisualEditor = ref(store.user?.preferredEditor === "Visual");

const changeEditor = () => {
	if (data.value) {
		if (prefersVisualEditor.value)
			automationString.value = YAML.stringify(data.value.features[type][aid].automation);
		else
			data.value.features[type][aid].automation = YAML.parse(automationString.value);
	}
	prefersVisualEditor.value = !prefersVisualEditor.value;
};
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: `/bestiary-viewer/${rawInfo?.bestiaryId}`,
				text: bestiary?.name || 'Unnamed Bestiary',
				isCurrent: false
			},
			{
				path: `/statblock-editor/${$route.params.id}`,
				text: data?.description.name.substring(0, 30) || 'Unnamed Creature',
				isCurrent: false
			},
			{
				path: '',
				text: data?.features[$route.params.type as keyof Features][$route.params.aid as any].name.substring(0, 30) || 'Action',
				isCurrent: true
			}
		]"
	>
		<button v-if="isOwner || isEditor" v-tooltip="'Save'" class="inverted" aria-label="Save creature" @click="saveStatblock(true)">
			<font-awesome-icon :icon="['fas', 'save']" />
		</button>
		<button v-tooltip="'Generate automation from description. May be incomplete or inaccurate. Only works for basic, to hit attacks.'" aria-label="Generate automation" @click="generateAutomation">
			<font-awesome-icon :icon="['fas', 'wand-sparkles']" />
		</button>

		<button v-tooltip="'Swap editors'" aria-label="Generate automation" @click="changeEditor">
			<font-awesome-icon :icon="['fas', 'rotate']" />
		</button>
		<VDropdown :distance="6" :positioning-disabled="store.isMobile">
			<button v-tooltip="'Import actions'" aria-label="Import actions">
				<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
			</button>
			<template #popper>
				<div class="v-popper__custom-menu">
					<div class="editor-field__container" style="min-width: 400px">
						<LabelledComponent title="Import SRD feature" for="importsrdfeature">
							<v-select :options="loadedAutomation.srdFeatures" input-id="importsrdfeature" @option:selected="(selected : string) => (importAutomation('srd-feature', selected)) " />
						</LabelledComponent>
					</div>

					<div class="editor-field__container">
						<LabelledComponent title="Import basic example" for="importbasicexample">
							<v-select :options="loadedAutomation.basicExamples" input-id="importbasicexample" @option:selected="(selected : string) => (importAutomation('basic-example', selected))" />
						</LabelledComponent>
					</div>

					<div v-if="true" class="editor-field__container">
						<LabelledComponent title="Import custom automation" for="importcustomautomation">
							<v-select :options="loadedAutomation.myAutomation" input-id="importcustomautomation" label="name" @option:selected="(selected : myAutomationSkeleton) => (importAutomation('automation', selected.name, selected.id))" />
						</LabelledComponent>
					</div>
				</div>
			</template>
		</VDropdown>

		<button v-if="data && store.isMobile" @click="data.features[type][aid].automation = {}">
			<font-awesome-icon :icon="['fas', 'trash']" />
		</button>
		<button v-if="data && store.isMobile" @click="copyAutomation">
			<font-awesome-icon :icon="['fas', 'copy']" />
		</button>
	</Breadcrumbs>
	<div v-if="data" class="content">
		<div class="editor-field__container two-wide uneven">
			<div>
				<LabelledComponent title="Feature name" for="featurename">
					<input id="featurename" v-model="data.features[type][aid].name" type="text" placeholder="Enter name" :minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength">
				</LabelledComponent>
				<div style="margin-top: .5rem">
					<b> Status: </b>
					<span v-if="!automationStringValidated" style="color: var(--color-destructive)"> Automation invalid. </span>
					<span v-else-if="isSaved"> Saved <font-awesome-icon style="color: var(--color-success)" :icon="['fas', 'save']" />
					</span>
					<span v-else> Saving...</span>
				</div>
				<div v-if="showDescriptionButtons">
					<b> Descriptions: </b>
					<span style="color: var(--color-destructive)"> Don't match. </span>
					<p style="text-decoration: underline; font-size: smaller; cursor: pointer;" @click="updateAutomationDescFromFeatureDesc">
						Update from feature
					</p>
					<p style="text-decoration: underline; font-size: smaller; cursor: pointer" @click="updateFeatureDescFromAutomationDesc">
						Update from automation
					</p>
				</div>
			</div>

			<LabelledComponent title="Feature description" for="featuredescription">
				<textarea id="featuredescription" v-model="data.features[type][aid].description" height="94" placeholder="Enter description" style="height: 93px" :maxlength="store.limits?.descriptionLength" />
			</LabelledComponent>
		</div>
		<div v-if="!prefersVisualEditor" class="editor">
			<VueMonacoEditor v-model:value="automationString" theme="vs-dark" :options="{ wordWrap: 'on', theme: 'vs-dark', minimap: { enabled: false }, formatOnPaste: true, formatOnType: true, automaticLayout: true, scrollBeyondLastLine: false }" height="500px" language="yaml" @mount="handleMount" />
		</div>
		<div v-else style="margin-top: 2rem">
			<VisualEditor ref="VisualEditorRef" v-model="data.features[type][aid].automation" :name="data.features[type][aid].name" />
		</div>
		<div v-if="!prefersVisualEditor">
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
	</div>
</template>

<style scoped lang="less">
.two-wide {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;

	&.uneven {
		grid-template-columns: 1fr 2fr;
		max-width: 100%;
	}
}

.editor {
	margin-top: 1rem;
}

a {
	color: orangered;
}
</style>
