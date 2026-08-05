<script setup lang="ts">
import type { BestiaryExtended, CreatureWithStats, Statblock } from "~/shared";
import { nextTick, onMounted, onUnmounted, provide, ref, watch } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import CopyCreature from "@/components/Bestiary/CopyCreature.vue";
import ExportCreature from "@/components/Bestiary/ExportCreature.vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import DescriptionPanel from "@/components/StatblockEditor/0DescriptionPanel.vue";
import CorePanel from "@/components/StatblockEditor/1CorePanel.vue";
import StatsPanel from "@/components/StatblockEditor/2StatsPanel.vue";
import DefensesPanel from "@/components/StatblockEditor/3DefensesPanel.vue";
import FeaturesPanel from "@/components/StatblockEditor/4FeaturesPanel.vue";
import SpellcastingPanel from "@/components/StatblockEditor/5SpellcastingPanel.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { defaultStatblock } from "~/shared";
import { useHotkey } from "vuetify";

const $route = useRoute();
const $router = useRouter();

const tab = ref<number>(typeof ($route.query?.pane) === "string" ? Number.parseInt($route.query.pane) : 1);
const data = ref<Statblock>(defaultStatblock);
const rawInfo = ref<CreatureWithStats | null>(null);

const { addToast } = useToast();

// load creature data
onMounted(async () => {
	// const loader = $loading.show();
	const { success, data: cData, error } = await useFetch<CreatureWithStats>(`/api/creature/${$route.params.id.toString()}`);
	if (success) {
		data.value = (cData).stats;
		await nextTick(() => madeChanges.value = false);
		rawInfo.value = cData;
		await loadRawInfo();
		// loader.hide();
	}
	else {
		addToast(error, { color: "error" })
		madeChanges.value = false;
		await $router.push("/error");
		// loader.hide();
	}
});

// bestiary data
const bestiary = ref<BestiaryExtended | null>(null);
const isOwner = ref(false);
const isEditor = ref(false);
const shouldShowEditor = ref(false);

const loadRawInfo = async () => {
	const { success, data, error } = await useFetch<BestiaryExtended>(`/ api / bestiary / ${rawInfo.value?.bestiaryId}`);
	if (success) {
		bestiary.value = data;
		isOwner.value = store.user?.id === bestiary.value.ownerId;
		isEditor.value = (bestiary.value?.editors ?? []).map(e => e.userId).includes(store.user?.id ?? "");
		if (isOwner.value || isEditor.value)
			shouldShowEditor.value = true;

		if (!isOwner.value && !isEditor.value)
			await $router.push(`/ creature / view / ${rawInfo.value?.id}`);
	}
	else {
		addToast(error, { color: "error" });
		;
	}
};

const isSavingStatblock = ref(false)
const saveStatblock = async (shouldNotify = true): Promise<boolean> => {
	if (!rawInfo.value)
		return false;
	rawInfo.value.stats = data.value;
	isSavingStatblock.value = true

	// Send to backend
	const { success, error } = await useFetch<CreatureWithStats>(`/ api / creature / ${rawInfo.value.id.toString()} / update`, "POST", rawInfo.value);
	if (success) {
		if (shouldNotify)
			addToast("Saved stat block", { color: "success" });
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
		addToast(error, { timeout: -1 });
		if (error.includes("includes blocked words or phrases"))
			void getUmami()?.track("Blocked words", { error });
	}
	isSavingStatblock.value = false
	if (success)
		return true;
	return false;
};

provide("saveStatblock", saveStatblock);
useHotkey("cmd+s", async () => await saveStatblock(), { inputs: true })
// end of lifecycle
const madeChanges = ref(false);

const unwatch = watch(() => data.value, () => {
	if (rawInfo.value == null)
		return;
	madeChanges.value = true;
	unwatch();
}, { deep: true });

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

// doc title
watch(() => data.value.description.name, () => {
	document.title = `${data.value.description.name} | Bestiary Builder`;
}, { immediate: true });

// import
const importText = ref("");
type ImportTypes = "" | "CritterDB Creature link" | "Bestiary Builder JSON" | "5e Tools JSON";
const importType = ref<ImportTypes>("");
const notices = ref<{ [key: string]: string[] }>({});

const import5etools = async () => {
	if (importText.value.startsWith("___")) {
		addToast("You copied the Markdown, not the JSON", { color: "error" })
		return;
	}
	try {
		const json = JSON.parse(importText.value);
		const { success, data: cData, error } = await useFetch<{ stats: Statblock; notices: { [key: string]: string[] } }>("/api/5etools-import", "POST", json);
		if (!success)
			throw error;
		data.value = cData?.stats;
		notices.value = cData?.notices;
		importText.value = "";
		addToast(`Successfully imported ${data.value.description.name}`);
		void getUmami()?.track("Import creature from 5eTools");
	}
	catch (err) {
		addToast(err as string, { color: "error" })
	}
};

const importBestiaryBuilder = async () => {
	try {
		let creature = JSON.parse(importText.value);
		if (Array.isArray(creature))
			creature = creature[0];
		// Validate input
		const { success, error } = await useFetch("/api/validate/creature", "POST", creature);
		// Succesful?:
		if (success) {
			data.value = creature;
			notices.value = {};
			importText.value = "";
			addToast(`Successfully imported ${data.value.description.name}`);
			void getUmami()?.track("Import creature from BestiaryBuilder");
		}
		else {
			addToast(error.replaceAll("\n", "<br />"), {
				timeout: -1,
				color: "error"
			});
		}
	}
	catch (e) {
		addToast(e as string, { color: "error" })
	}
};

const importCritterDB = async () => {
	let link = importText.value.trim();
	try {
		const url = new URL(link);
		if (url.hostname !== "critterdb.com" && !url.hostname.endsWith(".critterdb.com")) {
			addToast("This is not a critterDB link. Are you sure the link is right?", { color: "error" })
			return;
		}
	}
	catch {
		addToast("Could not parse input as link", { color: "error" })
		return;
	}

	const linkEls = link.split("/");
	link = linkEls[linkEls.length - 1];

	const { success, data: cData, error } = await useFetch(`/ api / critterdbcreature / ${link}`);
	if (!success) {
		addToast(error, { color: "error" });
		;
		return;
	}

	data.value = cData as Statblock;
	addToast(`Successfully imported ${data.value.description.name}`);
	void getUmami()?.track("Import creature from CritterDB");
};

const importCreatureFromUserInput = async () => {
	if (importType.value === "5e Tools JSON")
		import5etools();
	if (importType.value === "Bestiary Builder JSON")
		await importBestiaryBuilder();
	if (importType.value === "CritterDB Creature link")
		await importCritterDB();
};

// import from CopyManager
const importCreature = async (creature: Statblock) => {
	data.value = creature;
	await saveStatblock(false);
	addToast(`Successfully imported ${data.value.description.name}`);
};

</script>

<template>
	<div>
		<Breadcrumbs :routes="[
			{
				path: '/bestiaries/personal',
				text: 'My Bestiaries',
				isCurrent: false
			},
			{
				path: `/bestiary/edit/${bestiary?.id}`,
				text: bestiary?.name || 'Bestiary',
				isCurrent: false
			},
			{
				path: '',
				text: data?.description.name || 'Creature',
				isCurrent: true
			}
		]">
			<v-icon-btn v-if="madeChanges && (isOwner || isEditor)" icon="mdi:content-save" text="Save creature"
				:class="{ inverted: !isSavingStatblock }" @click="saveStatblock()" size="24"
				v-tooltip="'Save Creature (CTRL+S)'" :loading="isSavingStatblock" />

			<CopyCreature v-if="rawInfo" no-import-all :may-import="isOwner || isEditor"
				:current-creature="{ ...rawInfo, bestiaryName: bestiary?.name || '' }"
				@import-creature="(creature) => importCreature(creature)" />

			<v-dialog v-if="isOwner || isEditor" width="600">
				<template #activator="{ props }">
					<v-icon-btn text="Import Creature" icon="mdi:import" size="24" v-bind="props" />
				</template>

				<template #default="{ isActive }">
					<v-card class="text-center pb-2 pa-4" title="Import Creature">
						<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
							<v-select v-model="importType" label="Choose import type"
								:items="['Bestiary Builder JSON', '5e Tools JSON', 'CritterDB Creature link']"
								class="w-100" />
							<v-text-field v-if="importType" v-model="importText"
								:label="importType === 'CritterDB Creature link' ? 'Link' : 'JSON data'"
								class="w-100" />
							<v-spacer v-else />
							<v-btn v-if="importText" class="w-100" color="green" @click="importCreatureFromUserInput">
								Import
							</v-btn>
							<v-spacer v-else />
							<div v-if="JSON.stringify(notices) !== '{}'" class="pa-0 text-left">
								<p class="warning">
									<b>Please note the following for this import:</b>
								</p>
								<p>
									Some features may not have automation as they should, aka description only features,
									but some
									might not have imported correctly or are missing certain parts. It is recommended to
									review.
								</p>
								<div v-for="(type, index) in notices" :key="index">
									<h3 v-if="type.length > 0">
										{{ index }}
									</h3>
									<ul v-if="type.length > 0">
										<li v-for="(notice, indexInner) in type" :key="indexInner">
											{{ notice }}
										</li>
									</ul>
								</div>
							</div>
						</v-card-actions>
						<v-card-actions>
							<v-btn text="Cancel" @click="isActive.value = false; importType = ''; importText = ''" />
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>

			<ExportCreature :data="data" />
		</Breadcrumbs>
		<div class="content more-wide" :class="{ 'is-statblock-only': !shouldShowEditor }">
			<v-container class="pa-0">
				<v-row>
					<v-col :cols="store.isMobile ? 12 : 6">
						<v-sheet elevation="2" color="surface-1">
							<v-tabs v-model="tab" color="primary" style="background-color: rgba(33,33,33,1)"
								:grow="!store.isMobile" :show-arrows="store.isMobile">
								<v-tab :value="1">
									Description
								</v-tab>
								<v-tab :value="2">
									Core
								</v-tab>
								<v-tab :value="3">
									Stats
								</v-tab>
								<v-tab :value="4">
									Defenses
								</v-tab>
								<v-tab :value="5">
									Features
								</v-tab>
								<v-tab :value="6">
									Spells
								</v-tab>
							</v-tabs>
							<v-divider />
							<v-sheet color="surface-1">
								<v-tabs-window v-model="tab" class="editor-content">
									<v-tabs-window-item :value="1">
										<v-sheet color="surface-1" class="pa-4">
											<DescriptionPanel :data="data" />
										</v-sheet>
									</v-tabs-window-item>
									<v-tabs-window-item :value="2">
										<v-sheet color="surface-1" class="pa-4">
											<CorePanel :data="data" />
										</v-sheet>
									</v-tabs-window-item>
									<v-tabs-window-item :value="3">
										<v-sheet color="surface-1" class="pa-4">
											<StatsPanel :data="data" />
										</v-sheet color="surface-1">
									</v-tabs-window-item>
									<v-tabs-window-item :value="4">
										<v-sheet color="surface-1" class="pa-4">
											<DefensesPanel :data="data" />
										</v-sheet>
									</v-tabs-window-item>
									<v-tabs-window-item :value="5">
										<v-sheet color="surface-1" class="pa-4">
											<FeaturesPanel :data="data" :raw-info="rawInfo" />
										</v-sheet>
									</v-tabs-window-item>
									<v-tabs-window-item :value="6">
										<v-sheet color="surface-1" class="pa-4">
											<SpellcastingPanel :data="data" :raw-info="rawInfo" />
										</v-sheet>
									</v-tabs-window-item>
								</v-tabs-window>
							</v-sheet>
						</v-sheet>
					</v-col>

					<v-col :cols="store.isMobile ? 12 : 6">
						<v-skeleton-loader type="heading, divider, text, text, sentences, heading, text"
							v-if="rawInfo === null" />
						<StatblockRenderer v-else id="statblock" :data="data" />
					</v-col>
				</v-row>
			</v-container>
		</div>
	</div>
</template>
<style lang="less">
@import url("@/assets/styles/mixins.less");
@import url("@/components/StatblockEditor/styles/statblock-editor.less");
</style>
