<script setup lang="ts">
import type { FeatureEntity, Id } from "~/shared";
import { onMounted, ref } from "vue";
import { $toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

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
	if (name === '') return;
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
console.log(loadedAutomation.value.myAutomation)
</script>

<template>

	<DropdownMenu>
		<template #activator="{ props }">
			<v-icon-btn icon="mdi:database" text="Import Action" size="24" v-bind="props" />
		</template>
		<v-card width="500" mi class="text-center pb-2">
			<v-card-text>

				<v-autocomplete :items="loadedAutomation.srdFeatures" label="Import SRD Feature"
					@update:model-value="selected => (selectAndLoad(`srd-features/${store.user?.SRDVersion === 'SRD_2024' ? '2024' : '2014'}`, selected || ''))"
					variant="solo-filled" class="w-100" clearable>
					<template #item="{ props, item }">
						<v-list-item v-bind="props" density="compact" style="min-height: 28px">
							{{ (item as any).title }}
						</v-list-item>
					</template>
				</v-autocomplete>

				<v-autocomplete :items="loadedAutomation.basicExamples" label="Import basic Action"
					@update:model-value="selected => (selectAndLoad('basic-example', selected || ''))"
					variant="solo-filled">
					<template #item="{ props, item }">
						<v-list-item v-bind="props" density="compact" style="min-height: 28px">
							{{ (item as any).title }}
						</v-list-item>
					</template>
				</v-autocomplete>
				<v-autocomplete :items="loadedAutomation.myAutomation" item-title="name" item-value="id"
					label="Select an item" return-object
					@update:model-value="(selected) => selected && selectAndLoad('automation', selected.name, selected.id)"
					variant="solo-filled">
					<template #item="{ props, item }">
						<v-list-item v-bind="props" density="compact" style="min-height: 28px">
							{{ (item as any).title }}
						</v-list-item>
					</template>
				</v-autocomplete>
				<!-- <v-select :items="loadedAutomation.myAutomation"
					@option:selected="(selected: myAutomationSkeleton) => (selectAndLoad('automation', selected.name, selected.id))"
					label="Import Custom Automation" /> -->
			</v-card-text>

		</v-card>
	</DropdownMenu>
</template>
