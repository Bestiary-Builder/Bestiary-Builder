<script setup lang="ts">
import type { FeatureEntity, Id } from "~/shared";
import { onMounted, ref } from "vue";
import { $toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import LabelledComponent from "../FormInputs/LabelledComponent.vue";

const emit = defineEmits<{
	(e: "loadFeature", feature: FeatureEntity, apiPath: AutomationTypes): void;
}>();

// Imported automation helpers
type AutomationTypes = "automation" | "basic-example" | "srd-features/2014" | "srd-features/2024";
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
		$toast.error(error);
	}
};

onMounted(async () => {
	if (store.user?.SRDVersion === "SRD_2024")
		await loadImportedAutomation("srd-features/2024/list", "srdFeatures");

	else
		await loadImportedAutomation("srd-features/2014/list", "srdFeatures");

	await loadImportedAutomation("basic-examples/list", "basicExamples");
	await loadImportedAutomation("my-automations", "myAutomation");
});

const selectAndLoad = async (apiPath: AutomationTypes, name: string, _id: Id | null = null) => {
	const { success, data: iData, error } = await useFetch(`/api/${apiPath}/${encodeURIComponent(_id?.toString() ?? name)}`);
	let feature: FeatureEntity | null = null;
	if (!success) {
		$toast.error(`Error: ${error}`);
		return;
	}
	feature = iData as FeatureEntity | null;

	if (!feature) {
		$toast.error(`Error: Failed to import ${name}`);
		return;
	}

	emit("loadFeature", feature, apiPath);
};
</script>

<template>
	<VDropdown :distance="6" :positioning-disabled="store.isMobile">
		<button v-tooltip="'Import actions'" aria-label="Import actions">
			<font-awesome-icon :icon="['fas', 'database']" />
		</button>
		<template #popper>
			<div class="v-popper__custom-menu">
				<div class="editor-field__container" style="min-width: 400px">
					<LabelledComponent title="Import SRD feature" for="importsrdfeature">
						<v-select :options="loadedAutomation.srdFeatures" input-id="importsrdfeature" @option:selected="(selected : string) => (selectAndLoad(`srd-features/${store.user?.SRDVersion === 'SRD_2024' ? '2024' : '2014'}`, selected)) " />
					</LabelledComponent>
				</div>

				<div class="editor-field__container">
					<LabelledComponent title="Import basic template" for="importbasicexample">
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
