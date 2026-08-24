<script setup lang="ts">
import type { FeatureEntity, Id } from "~/shared";
import { onMounted, ref } from "vue";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

const isOpen = ref(false);

const { addToast } = useToast()
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
		addToast(error, { color: "error" });
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
		addToast(error, { color: "error" });
		return;
	}
	feature = iData as FeatureEntity | null;

	if (!feature) {
		addToast(`Failed to import ${name}. No feature data found.`, { color: "error" });
		return;
	}

	emit("loadFeature", feature, apiPath);
	isOpen.value = false
};
</script>

<template>

	<DropdownMenu v-model="isOpen">
		<template #activator="{ props }">
			<v-icon-btn icon="mdi:database" text="Import Action" size="24" v-bind="props"
				v-tooltip="'Import Feature'" />
		</template>
		<v-card width="500" class="text-center pa-4">
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
			</v-card-text>
		</v-card>
	</DropdownMenu>
</template>
