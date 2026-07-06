<script setup lang="ts">
import { onMounted, ref } from "vue";
import LabelledComponent from "../FormInputs/LabelledComponent.vue";
import { toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import type { FeatureEntity, Id } from "~/shared";

const emit = defineEmits<{
	(e: "loadFeature", feature: FeatureEntity, apiPath: AutomationTypes): void;
}>();

// Imported automation helpers
type AutomationTypes = "automation" | "basic-example" | "srd-feature";
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

const selectAndLoad = async (apiPath: AutomationTypes, name: string, _id: Id | null = null) => {
	const { success, data: iData, error } = await useFetch(`/api/${apiPath}/${encodeURIComponent(_id?.toString() ?? name)}`);
	let feature: FeatureEntity | null = null;
	if (!success) {
		toast.error(`Error: ${error}`);
		return;
	}
	feature = iData as FeatureEntity | null;

	if (!feature) {
		toast.error(`Error: Failed to import ${name}`);
		return;
	}

	emit("loadFeature", feature, apiPath);
};
</script>

<template>
	<VDropdown :distance="6" :positioning-disabled="store.isMobile">
		<button v-tooltip="'Import actions'" aria-label="Import actions">
			<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
		</button>
		<template #popper>
			<div class="v-popper__custom-menu">
				asdfasfd
				<div class="editor-field__container" style="min-width: 400px">
					<LabelledComponent title="Import SRD feature" for="importsrdfeature">
						<v-select :options="loadedAutomation.srdFeatures" input-id="importsrdfeature" @option:selected="(selected : string) => (selectAndLoad('srd-feature', selected)) " />
					</LabelledComponent>
				</div>

				<div class="editor-field__container">
					<LabelledComponent title="Import basic example" for="importbasicexample">
						<v-select :options="loadedAutomation.basicExamples" input-id="importbasicexample" @option:selected="(selected : string) => (selectAndLoad('basic-example', selected))" />
					</LabelledComponent>
				</div>

				<div v-if="true" class="editor-field__container">
					<LabelledComponent title="Import custom automation" for="importcustomautomation">
						<v-select :options="loadedAutomation.myAutomation" input-id="importcustomautomation" label="name" @option:selected="(selected : myAutomationSkeleton) => (selectAndLoad('automation', selected.name, selected.id))" />
					</LabelledComponent>
				</div>
			</div>
		</template>
	</VDropdown>
</template>
