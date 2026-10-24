<script setup lang="ts">
import type { AvraeCharacter } from "../Characters/utils";
import type { AttackModel, Automation, AutomationCollection, FeatureEntity, Id } from "~/shared";
import { computed, reactive, ref, watch } from "vue";
import { useToast } from "@/utils/app/toast";
import { useLazyAsync, useLazyOptions } from "@/utils/app/useLazyOptions";
import { store } from "@/utils/store";
import { sendToAvraeLogin, useFetch } from "@/utils/utils";
import ImportToCharacter from "../Characters/ImportToCharacter.vue";
import { getAvraeCharacterByUpstream, getAvraeCharacters } from "../Characters/utils";

type Props
	= | { currentDataType: "fromCreature"; currentData: FeatureEntity | null }
		| { currentDataType: "fromCharacter"; currentData: AttackModel | null }
		| { currentDataType: "fromAutomation"; currentData: Automation | null };

const { currentData, currentDataType } = defineProps<Props>();
const emit = defineEmits<{
	(e: "loadFeature", feature: FeatureEntity): void;
}>();

const isOpen = ref(false);

const { addToast, updateToast } = useToast();

type AutomationTypes = "automation" | "srd-features/2014" | "srd-features/2024";
interface myAutomationSkeletonGroup {
	[key: string]: {
		name: string;
		id: Id;
	}[];
}

const fetchList = async <T>(apiPath: string): Promise<T> => {
	const { success, data, error } = await useFetch<T>(`/api/${apiPath}`);
	if (!success)
		throw new Error(error);

	return data;
};

const onListError = (error: unknown) =>
	addToast(error instanceof Error ? error.message : String(error), { color: "error" });

const srdFeatures = reactive(useLazyOptions<string>(
	async () => fetchList(`srd-features/${store.user?.SRDVersion === "SRD_2024" ? "2024" : "2014"}/list`),
	{ onError: onListError },
));

const myAutomation = reactive(useLazyAsync<myAutomationSkeletonGroup>(
	async () => fetchList("my-automations/list"),
	{},
	{ onError: onListError },
));

const avraeCharacters = reactive(useLazyOptions<AvraeCharacter>(
	async () => (await getAvraeCharacters()) ?? [],
	{ onError: onListError },
));

const myCollections = reactive(useLazyOptions<AutomationCollection>(
	async () => fetchList("automation-collection/personal"),
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

	emit("loadFeature", feature);
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

const groupedAutomatedItems = computed(() => {
	const output = [];

	for (const [collection, items] of Object.entries(myAutomation.data)) {
		output.push({ type: "subheader", title: collection });
		for (const item of items) {
			output.push({ title: item.name, id: item.id });
		}
	}
	return output;
});

const copyAutomation = async () => {
	try {
		switch (currentDataType) {
			case "fromCharacter":
				await navigator.clipboard.writeText(JSON.stringify(currentData, null, 2));
				break;
			case "fromCreature":
			case "fromAutomation":
				await navigator.clipboard.writeText(JSON.stringify(currentData?.automation, null, 2));
				break;
		}
		addToast("Copied automation!");
	}
	catch { }
};

const addToAutomationCollection = async (collection: AutomationCollection | null) => {
	if (currentData === null) {
		addToast("No automation set.");
		return;
	}
	if (!collection) {
		addToast("No collection found.");
		return;
	}

	const toastId = addToast("Adding automation to collection...", { loading: true });
	try {
		let preparedData: Partial<Automation> | null = null;
		switch (currentDataType) {
			case "fromCharacter":
				preparedData = { name: currentData.name, automation: currentData.automation };
				break;
			case "fromCreature":
			case "fromAutomation":
				preparedData = currentData;
				break;
		}

		if (!preparedData) {
			addToast("No automation set.");
			return;
		}

		const { success, error } = await useFetch(`/api/automation/add`, "POST", { automation: preparedData, collectionId: collection.id });

		if (error)
			updateToast(toastId, { text: error, color: "error" });

		if (success)
			updateToast(toastId, { text: `Successfully added action to ${collection.name}!`, color: "success" });
	}
	catch (err) {
		updateToast(toastId, { text: err instanceof Error ? err.message : "An unexpected error occurred.", color: "error" });
	}
};
</script>

<template>
	<v-icon-btn
		v-tooltip="'Manage Source Data'" icon="mdi:database" text="Import Action" size="24"
		@click="isOpen = true"
	/>

	<v-dialog v-model="isOpen" max-width="700" scrollable>
		<v-card class="pa-4" title="Manage Source Data" prepend-icon="mdi:database">
			<v-card-text>
				<v-row density="comfortable">
					<v-col>
						<div class="d-flex align-center w-100 my-2">
							<v-divider class="flex-grow-1" />
							<span class="mx-4 text-medium-emphasis text-no-wrap">Import Action</span>
							<v-divider class="flex-grow-1" />
						</div>
					</v-col>
					<v-col cols="12">
						<v-autocomplete
							:items="srdFeatures.items" :loading="srdFeatures.loading" label="From SRD Data"
							variant="solo-filled" clearable
							:hint="`SRD ${store.user?.SRDVersion === 'SRD_2024' ? '2024' : '2014'}. Change in settings.`"
							persistent-hint prepend-inner-icon="mdi:book-open-variant"
							@update:menu="srdFeatures.handleMenuOpen"
							@update:model-value="selected => (selectAndLoad(`srd-features/${store.user?.SRDVersion === 'SRD_2024' ? '2024' : '2014'}`, selected || ''))"
						>
							<template #item="{ props, item }">
								<v-list-item density="compact" style="min-height: 28px">
									<v-list-item-title v-bind="props">
										{{ item }}
									</v-list-item-title>
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
					</v-col>
					<v-col cols="12">
						<v-autocomplete
							:items="groupedAutomatedItems" :loading="myAutomation.loading"
							item-title="title" label="From Subscribed Automation Collections" variant="solo-filled"
							return-object prepend-inner-icon="$automationCollection"
							hide-details @update:menu="myAutomation.handleMenuOpen"
							@update:model-value="(selected) => selected && selectAndLoad('automation', selected.title, selected.id)"
						>
							<template #item="{ props, item }">
								<v-list-item density="compact" style="min-height: 28px">
									<v-list-item-title v-bind="props">
										{{ item.title }}
									</v-list-item-title>
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
					</v-col>
					<v-col cols="12">
						<div v-if="AvraeToken">
							<v-autocomplete
								v-model="selectedCharacter" :items="avraeCharacters.items"
								:loading="avraeCharacters.loading" item-title="name" item-value="upstream"
								label="From Avrae Character" hide-details prepend-inner-icon="$avrae"
								variant="solo-filled" clearable
								@update:menu="avraeCharacters.handleMenuOpen"
							>
								<template #item="{ props, item }">
									<v-list-item
										density="compact" style="min-height: 28px" v-bind="props"
										:title="item.name"
									/>
								</template>

								<template #no-data>
									<v-list-item>
										<v-list-item-title>
											{{ avraeCharacters.loading ? 'Loading characters...' : 'No characters found'
											}}
										</v-list-item-title>
									</v-list-item>
								</template>
							</v-autocomplete>
						</div>
						<div v-else>
							Or login with Avrae to import an action from a character.
							<br>
							<v-btn
								color="#9c27b0" prepend-icon="$avrae" variant="flat"
								@click.prevent="sendToAvraeLogin($route.path)"
							>
								Login with Avrae
							</v-btn>
						</div>
					</v-col>
					<v-col v-if="selectedCharacterData" cols="12">
						<v-select
							v-model="selectedAttack" variant="solo-filled"
							:items="selectedCharacterData.overrides.attacks" item-title="name"
							label="Choose Character Attack" return-object
							hide-details
							@update:model-value="(selected) => selected && emit('loadFeature', { name: selected.name, description: '', automation: selected })"
						/>
					</v-col>

					<v-col cols="12">
						<div class="d-flex align-center w-100 my-2">
							<v-divider class="flex-grow-1" />
							<span class="mx-4 text-medium-emphasis text-no-wrap">Add to Avrae Character</span>
							<v-divider class="flex-grow-1" />
						</div>
					</v-col>

					<ImportToCharacter
						:automation="currentDataType === 'fromCharacter' ? currentData : currentData?.automation"
						:consumables="currentDataType === 'fromAutomation' ? currentData?.consumables : null"
						render-inputs-only
					/>

					<v-col cols="12">
						<div class="d-flex align-center my-2 w-100">
							<v-divider class="flex-grow-1" />
							<span class="mx-4 text-medium-emphasis text-no-wrap">Export Action</span>
							<v-divider class="flex-grow-1" />
						</div>
					</v-col>

					<v-col cols="12">
						<v-autocomplete
							:items="myCollections.items" :loading="myCollections.loading"
							label="To Automation Collection" variant="solo-filled" clearable
							hide-details item-title="name" prepend-inner-icon="$automationCollection" return-object
							@update:menu="myCollections.handleMenuOpen"
							@update:model-value="selected => addToAutomationCollection(selected)"
						>
							<template #item="{ props, item }">
								<v-list-item density="compact" style="min-height: 28px">
									<v-list-item-title v-bind="props">
										{{ item.name }}
									</v-list-item-title>
								</v-list-item>
							</template>
							<template #no-data>
								<v-list-item>
									<v-list-item-title>
										{{ myCollections.loading ? 'Loading...' : 'No collections found' }}
									</v-list-item-title>
								</v-list-item>
							</template>
						</v-autocomplete>
					</v-col>
					<v-col cols="12">
						<v-btn class="w-100" prepend-icon="mdi:content-copy" size="large" @click="copyAutomation">
							Copy Automation	to Clipboard
						</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
			<v-card-actions>
				<v-btn @click="isOpen = false">
					Close
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
