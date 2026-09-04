<script setup lang="ts">
import type { AvraeCharacter } from "../Characters/utils";
import type { FeatureEntity, Id } from "~/shared";
import { reactive, ref, watch } from "vue";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { getAvraeCharacterByUpstream, getAvraeCharacters } from "../Characters/utils";
import { useLazyOptions } from "@/utils/app/useLazyOptions";

const emit = defineEmits<{
	(e: "loadFeature", feature: FeatureEntity, apiPath: AutomationTypes): void;
}>();

const isOpen = ref(false);

const { addToast } = useToast();

type AutomationTypes = "automation" | "basic-example" | "srd-features/2014" | "srd-features/2024";
interface myAutomationSkeleton {
	name: string;
	id: Id;
}

const fetchList = async <T>(apiPath: string): Promise<T[]> => {
	const { success, data, error } = await useFetch<T[]>(`/api/${apiPath}`);
	if (!success)
		throw new Error(error);
	return data;
};

const onListError = (error: unknown) =>
	addToast(error instanceof Error ? error.message : String(error), { color: "error" });

// reactive() unwraps the composable's refs so the template (and this
// script) can use srdFeatures.items / .loading directly, no .value needed
const srdFeatures = reactive(useLazyOptions<string>(
	() => fetchList(`srd-features/${store.user?.SRDVersion === "SRD_2024" ? "2024" : "2014"}/list`),
	{ onError: onListError },
));

const basicExamples = reactive(useLazyOptions<string>(
	() => fetchList("basic-examples/list"),
	{ onError: onListError },
));

const myAutomation = reactive(useLazyOptions<myAutomationSkeleton>(
	() => fetchList("my-automations"),
	{ onError: onListError },
));

const avraeCharacters = reactive(useLazyOptions<AvraeCharacter>(
	async () => (await getAvraeCharacters()) ?? [],
	{ onError: onListError },
));

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

const selectedCharacter = ref<null | AvraeCharacter["upstream"]>(null);
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
	<v-icon-btn v-tooltip="'Import Feature'" icon="mdi:database" text="Import Action" size="24"
		@click="isOpen = true" />

	<v-dialog v-model="isOpen" max-width="500">
		<v-card class="text-center pa-4">
			<v-card-text>
				<v-autocomplete :items="srdFeatures.items" :loading="srdFeatures.loading" label="Import SRD Feature"
					variant="solo-filled" class="w-100" clearable @update:menu="srdFeatures.handleMenuOpen"
					@update:model-value="selected => (selectAndLoad(`srd-features/${store.user?.SRDVersion === 'SRD_2024' ? '2024' : '2014'}`, selected || ''))">
					<template #item="{ props, item }">
						<v-list-item v-bind="props" density="compact" style="min-height: 28px">
							{{ (item as any).title }}
						</v-list-item>
					</template>
					<template #no-data>
						<v-list-item>
							<v-list-item-title>
								{{ srdFeatures.loading ? 'Loading...' : 'No features found' }}
							</v-list-item-title>
						</v-list-item>
					</template>
				</v-autocomplete>

				<v-autocomplete :items="basicExamples.items" :loading="basicExamples.loading"
					label="Import Basic Action" variant="solo-filled" @update:menu="basicExamples.handleMenuOpen"
					@update:model-value="selected => (selectAndLoad('basic-example', selected || ''))">
					<template #item="{ props, item }">
						<v-list-item v-bind="props" density="compact" style="min-height: 28px">
							{{ (item as any).title }}
						</v-list-item>
					</template>
					<template #no-data>
						<v-list-item>
							<v-list-item-title>
								{{ basicExamples.loading ? 'Loading...' : 'No examples found' }}
							</v-list-item-title>
						</v-list-item>
					</template>
				</v-autocomplete>

				<v-autocomplete :items="myAutomation.items" :loading="myAutomation.loading" item-title="name"
					item-value="id" label="Select From subscribed Automations " return-object variant="solo-filled"
					@update:menu="myAutomation.handleMenuOpen"
					@update:model-value="(selected) => selected && selectAndLoad('automation', selected.name, selected.id)">
					<template #item="{ props, item }">
						<v-list-item v-bind="props" density="compact" style="min-height: 28px">
							{{ (item as any).title }}
						</v-list-item>
					</template>
					<template #no-data>
						<v-list-item>
							<v-list-item-title>
								{{ myAutomation.loading ? 'Loading...' : 'No automations found' }}
							</v-list-item-title>
						</v-list-item>
					</template>
				</v-autocomplete>

				<div v-if="AvraeToken">
					<v-select v-model="selectedCharacter" :items="avraeCharacters.items"
						:loading="avraeCharacters.loading" item-title="name" item-value="upstream"
						label="Import From Character" hide-details @update:menu="avraeCharacters.handleMenuOpen">
						<template #no-data>
							<v-list-item>
								<v-list-item-title>
									{{ avraeCharacters.loading ? 'Loading characters...' : 'No characters found' }}
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
				<v-select v-if="selectedCharacterData" v-model="selectedAttack" variant="solo-filled"
					:items="selectedCharacterData.overrides.attacks" class="mt-4" item-title="name"
					label="Choose Character Attack" return-object
					@update:model-value="(selected) => selected && emit('loadFeature', { name: selected.name, description: '', automation: selected }, 'automation')" />
			</v-card-text>
		</v-card>
	</v-dialog>
</template>