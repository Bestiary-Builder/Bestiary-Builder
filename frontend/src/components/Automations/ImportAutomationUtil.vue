<script setup lang="ts">
import type { AvraeCharacter } from "../Characters/utils";
import type { FeatureEntity, Id } from "~/shared";
import { onMounted, ref, watch } from "vue";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { getAvraeCharacterByUpstream, getAvraeCharacters } from "../Characters/utils";

const emit = defineEmits<{
	(e: "loadFeature", feature: FeatureEntity, apiPath: AutomationTypes): void;
}>();

const isOpen = ref(false);

const { addToast } = useToast();
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
	if (name === "")
		return;
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
	isOpen.value = false;
};

const AvraeToken = localStorage.getItem("AvraeToken");

const characters = ref<null | AvraeCharacter[]>(null);

const loading = ref(false);
const selectedCharacter = ref<null | AvraeCharacter["upstream"]>(null);
const hasFetched = ref(false);

const fetchCharacters = async () => {
	loading.value = true;
	characters.value = await getAvraeCharacters();
	loading.value = false;
};

const handleMenuOpen = async (isOpen: boolean) => {
	if (isOpen && !hasFetched.value) {
		await fetchCharacters();
		hasFetched.value = true;
	}
};

const selectedCharacterData = ref<null | AvraeCharacter>(null);

watch(() => selectedCharacter.value, async () => {
	if (selectedCharacter.value)
		selectedCharacterData.value = await getAvraeCharacterByUpstream(selectedCharacter.value);
});

const selectedAttack = ref();
watch(() => selectedAttack.value, () => {
	isOpen.value = false;
});
</script>

<template>
	<v-icon-btn
		v-tooltip="'Import Feature'" icon="mdi:database" text="Import Action" size="24"
		@click="isOpen = true"
	/>

	<v-dialog v-model="isOpen" max-width="500">
		<v-card class="text-center pa-4">
			<v-card-text>
				<v-autocomplete
					:items="loadedAutomation.srdFeatures" label="Import SRD Feature" variant="solo-filled"
					class="w-100" clearable
					@update:model-value="selected => (selectAndLoad(`srd-features/${store.user?.SRDVersion === 'SRD_2024' ? '2024' : '2014'}`, selected || ''))"
				>
					<template #item="{ props, item }">
						<v-list-item v-bind="props" density="compact" style="min-height: 28px">
							{{ (item as any).title }}
						</v-list-item>
					</template>
				</v-autocomplete>

				<v-autocomplete
					:items="loadedAutomation.basicExamples" label="Import Basic Action"
					variant="solo-filled"
					@update:model-value="selected => (selectAndLoad('basic-example', selected || ''))"
				>
					<template #item="{ props, item }">
						<v-list-item v-bind="props" density="compact" style="min-height: 28px">
							{{ (item as any).title }}
						</v-list-item>
					</template>
				</v-autocomplete>
				<v-autocomplete
					:items="loadedAutomation.myAutomation" item-title="name" item-value="id"
					label="Select From subscribed Automations " return-object variant="solo-filled"
					@update:model-value="(selected) => selected && selectAndLoad('automation', selected.name, selected.id)"
				>
					<template #item="{ props, item }">
						<v-list-item v-bind="props" density="compact" style="min-height: 28px">
							{{ (item as any).title }}
						</v-list-item>
					</template>
				</v-autocomplete>
				<div v-if="AvraeToken">
					<v-select
						v-model="selectedCharacter" :items="characters || []" :loading="loading" item-title="name"
						item-value="upstream" label="Import From Character" hide-details @update:menu="handleMenuOpen"
					>
						<template #no-data>
							<v-list-item>
								<v-list-item-title>
									{{ loading ? 'Loading characters...' : 'No characters found' }}
								</v-list-item-title>
							</v-list-item>
						</template>
					</v-select>
				</div>
				<div v-else class="text-primary">
					You can set up importing from your Avrae characters with just a button press!
					Set it up in <RouterLink to="/user">
						your user settings.
					</RouterLink>
				</div>
				<v-select
					v-if="selectedCharacterData" v-model="selectedAttack" variant="solo-filled"
					:items="selectedCharacterData.overrides.attacks" class="mt-4" item-title="name"
					label="Choose Character Attack" return-object
					@update:model-value="(selected) => selected && emit('loadFeature', { name: selected.name, description: '', automation: selected }, 'automation')"
				/>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>
