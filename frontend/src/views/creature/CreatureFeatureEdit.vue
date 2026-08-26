<script setup lang="ts">
import type { AttackModel, BestiaryResponse, CreatureResponse, FeatureEntity, Features, Statblock } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { computed, nextTick, onMounted, onUnmounted, provide, ref, useTemplateRef, watch } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { useHotkey } from "vuetify";
import EditAutomation from "@/components/Automations/EditAutomation.vue";
import ImportAutomationUtil from "@/components/Automations/ImportAutomationUtil.vue";
import ImportToCharacter from "@/components/Characters/ImportToCharacter.vue";
import Editor from "@/components/StatblockEditor/Editor.vue";
import { useToast } from "@/utils/app/toast";
import { useRecentPages } from "@/utils/app/useRecentPages";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { parseDescIntoAutomation } from "~/shared";

const $router = useRouter();
const $route = useRoute();
const type = $route.params.type as keyof Features;
const aid = $route.params.aid as any;
const data = ref<Statblock>();
const rawInfo = ref<CreatureResponse | null>(null);

const { addToast, updateToast, removeToast } = useToast();
const { updateLabel } = useRecentPages();
const EditAutomationRef = useTemplateRef("EditAutomationRef");

// load creature data
onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	const { success, data: cData, error, status } = await useFetch<CreatureResponse>(`/api/creature/${$route.params.id.toString()}`);
	if (success) {
		data.value = (cData).stats;
		await nextTick(() => madeChanges.value = false);
		rawInfo.value = cData;
		if (!await loadRawInfo()) {
			removeToast(toastId);
			return;
		}
		await getBestiary();
		updateLabel($route.path, data.value.description.name);
		removeToast(toastId);
	}
	else {
		addToast(error, { color: "error" });
		madeChanges.value = false;
		await $router.push(status === 401 || status === 404 ? "/404" : "/error");
		removeToast(toastId);
	}
});

const madeChanges = ref(false);

// ownership
const isOwner = ref(false);
const isEditor = ref(false);
const loadRawInfo = async () => {
	const { success, data, error, status } = await useFetch<BestiaryResponse>(`/api/bestiary/${rawInfo.value?.bestiaryId}`);
	if (success) {
		bestiary.value = data;
		isOwner.value = bestiary.value.permissionLevel === "owner";
		isEditor.value = bestiary.value.permissionLevel === "editor";

		if (!isOwner.value && !isEditor.value)
			await $router.push(`/creature/view/${rawInfo.value?.id}`);
		return true;
	}
	else {
		addToast(error, { color: "error" });
		if (status === 401 || status === 404)
			await $router.replace("/404");
		return false;
	}
};

const unwatch = watch(() => data.value, () => {
	if (rawInfo.value == null)
		return;
	madeChanges.value = true;
	unwatch();
}, { deep: true });

onBeforeRouteUpdate(() => {
	if (isVisualEditor.value)
		return;

	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		if (!answer)
			return false;
	}
});
onBeforeRouteLeave(() => {
	if (isVisualEditor.value)
		return;

	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		if (!answer)
			return false;
	}
});

const beforeUnLoad = (event: Event) => {
	if (isVisualEditor.value)
		return;
	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		event.preventDefault();
		event.returnValue = true;
	}
};

window.addEventListener("beforeunload", beforeUnLoad);
onUnmounted(() => {
	window.removeEventListener("beforeunload", beforeUnLoad);
});

const bestiary = ref<BestiaryResponse | null>(null);

const getBestiary = async () => {
	const { success, data, error, status } = await useFetch<BestiaryResponse>(`/api/bestiary/${rawInfo.value?.bestiaryId}`);
	if (!success) {
		bestiary.value = null;
		addToast(error, { color: "error" });
		if (status === 401 || status === 404)
			await $router.replace("/404");
		return;
	}
	bestiary.value = data;
};

// saving
const validateAttack = async (automation: any): Promise<true | string> => {
	if (automation === null)
		return true;
	const { success, error } = await useFetch("/api/validate/automation", "POST", automation);
	if (success)
		return true;
	else
		return error;
};

const isSaved = ref(false);
const isSavingCreature = ref(false);

const saveStatblock2 = async (shouldNotify: boolean): Promise<boolean> => {
	if (!rawInfo.value || !data.value)
		return false;

	if (!isVisualEditor.value && EditAutomationRef.value?.yamlError) {
		const message = `Error parsing automation YAML. ${EditAutomationRef.value.yamlError}`;
		if (shouldNotify)
			addToast(message, { color: "error", timeout: -1 });
		return false;
	}

	rawInfo.value.stats = data.value;
	const toastId = shouldNotify ? addToast("Validating...", { loading: true }) : undefined;
	isSavingCreature.value = true;

	try {
		const validAutomation = await validateAttack(data.value.features[type][aid].automation);
		if (validAutomation !== true) {
			if (toastId) {
				updateToast(toastId, {
					text: validAutomation,
					color: "error",
					timeout: -1,
					isHtml: true,
				});
			}
			isSavingCreature.value = false;
			return false;
		}

		if (toastId)
			updateToast(toastId, { text: "Saving..." });

		const { permissionLevel: _, ...creature } = rawInfo.value;
		const { success, error } = await useFetch<CreatureResponse>(`/api/creature/${creature.id}/update`, "POST", creature);
		if (!success) {
			if (toastId) {
				updateToast(toastId, {
					text: `Error saving statblock. ${error}`,
					color: "error",
					timeout: -1,
				});
			}
			else {
				addToast(`Error saving statblock. ${error}`, {
					color: "error",
					timeout: -1,
				});
			}
			isSavingCreature.value = false;
			return false;
		}

		isSaved.value = true;
		madeChanges.value = false;

		const unwatch = watch(
			() => data.value,
			() => {
				madeChanges.value = true;
				unwatch();
			},
			{ deep: true },
		);

		if (toastId)
			setTimeout(updateToast, 500, toastId, { text: "Saved action!", prependIcon: "mdi-check" });
		isSavingCreature.value = false;
		updateLabel($route.path, data.value.description.name);
		return true;
	}
	catch (err) {
		if (toastId) {
			updateToast(toastId, {
				text: err instanceof Error ? err.message : "An unexpected error occurred.",
				color: "error",
			});
		}
		isSavingCreature.value = false;
		return false;
	}
};
useHotkey("cmd+s", async () => saveStatblock2(true), { inputs: true });

type AutomationTypes = "automation" | "basic-example" | "srd-features/2014" | "srd-features/2024";
const loadFeature = async (feature: FeatureEntity, apiPath: AutomationTypes) => {
	if (!data.value)
		return;

	feature.description = feature.description.replaceAll("$NAMECAPITALNOUN$", `${data.value.description.isProperNoun ? "" : "The "}${data.value.description.isProperNoun ? data.value.description.name : data.value.description.name.toLowerCase()}`);
	feature.description = feature.description.replaceAll("$NAMELOWERNOUN$", `${data.value.description.isProperNoun ? "" : "the "}${data.value.description.isProperNoun ? data.value.description.name : data.value.description.name.toLowerCase()}`);

	data.value.features[type][aid] = feature;

	if (apiPath === "basic-example" && feature.automation) {
		let lastNode;

		if (Array.isArray(feature.automation))
			lastNode = feature.automation[0].automation[feature.automation[0].automation.length - 1];
		else
			lastNode = feature.automation.automation[feature.automation.automation.length - 1];

		if (lastNode.type === "text") {
			if (typeof (lastNode.text) === "string")
				feature.description = lastNode.text;
			else
				feature.description = "";
		}
		else {
			feature.description = "";
		}

		data.value.features[type][aid] = feature;
	}
	EditAutomationRef.value?.resetVisualEditorState();
	addToast(`Successfully loaded ${feature.name}!`);
	await saveStatblock2(false);
};

const generateAutomation = async () => {
	if (!data.value)
		return;
	const result = parseDescIntoAutomation(data.value.features[type][aid].description, data.value.features[type][aid].name, 0)[0];
	if (result) {
		try {
			data.value.features[type][aid].automation = result;
		}
		catch {
			addToast("Something went wrong when generation automation", { color: "error" });
		}
	}
};

// Description parity helpers
const updateFeatureDescFromAutomationDesc = () => {
	const auto = data.value?.features[type][aid].automation as AttackModel | AttackModel[] | null | undefined;
	if (!auto || Array.isArray(auto))
		return;
	for (let i = (auto.automation || []).length - 1; i >= 0; i--) {
		const field = auto.automation[i];
		if (field.type === "text" && data.value) {
			data.value.features[type][aid].description = field.text as string;
			return;
		}
	}
};

const updateAutomationDescFromFeatureDesc = () => {
	const auto = data.value?.features[type][aid].automation as AttackModel | AttackModel[] | null | undefined;
	if (!auto || Array.isArray(auto))
		return;
	for (let i = (auto.automation || []).length - 1; i >= 0; i--) {
		const field = auto.automation[i];
		if (field.type === "text") {
			field.text = data.value?.features[type][aid].description ?? "";
			return;
		}
	}
};

const getAutomationDescription = (): string | boolean => {
	const auto = data.value?.features[type][aid].automation as AttackModel | AttackModel[] | null | undefined;
	if (!auto || Array.isArray(auto) || !auto.automation || auto.automation.length === 0)
		return false;
	for (let i = auto.automation.length - 1; i >= 0; i--) {
		const field = auto.automation[i];
		if (field?.type === "text" && typeof (field.text) === "string") {
			return field.text;
		}
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

const isVisualEditor = ref(store.user?.preferredEditor === "Visual");

const toNavigateTo = ref([-1, -1]);

watch(toNavigateTo, async () => {
	const didSave = await saveStatblock2(false);
	if (didSave)
		await $router.push(`/creature/edit/${rawInfo.value?.id}/${toNavigateTo.value[0]}/${toNavigateTo.value[1]}`);
	else
		addToast("Could not open other action because this did not save correctly.", { color: "error" });
	$router.go(0);
});

const parityOptions = useLocalStorage("featureEditParityOptions", {
	updateName: true,
	updateDescription: true,
});

watch(() => data.value?.features[type][aid].name, (newName) => {
	if (isVisualEditor.value && parityOptions.value.updateName) {
		const automation = data.value?.features[type][aid].automation as AttackModel | AttackModel[] | null;
		if (!automation)
			return;
		if (Array.isArray(automation))
			automation[0].name = newName || "";
		else
			automation.name = newName || "";
	}
});

watch(() => data.value?.features[type][aid].description, (newDesc) => {
	if (isVisualEditor.value && parityOptions.value.updateDescription) {
		const automation = data.value?.features[type][aid].automation as AttackModel | AttackModel[] | null;
		if (!automation)
			return;
		let auto = automation;
		if (Array.isArray(automation))
			auto = automation[0];

		for (const field of ((auto as AttackModel)?.automation || []).reverse() || []) {
			if (field.type === "text") {
				field.text = newDesc || "";
				(auto as AttackModel).automation.reverse();
				return;
			}
		}
	}
});

const setName = (newName: string) => {
	if (!data.value)
		return;
	data.value.features[type][aid].name = newName;
};

const setDesc = (setDesc: string) => {
	if (!data.value)
		return;
	data.value.features[type][aid].description = setDesc;
};

provide("setActionName", setName);
provide("setActionDescription", setDesc);
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: `/bestiary/edit/${rawInfo?.bestiaryId}`,
				text: bestiary?.name || 'Unnamed Bestiary',
				isCurrent: false
			},
			{
				path: `/creature/edit/${$route.params.id}?pane=5`,
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
		<v-icon-btn
			v-if="madeChanges && (isOwner || isEditor)" v-tooltip="'Save feature (CTRL+S)'"
			icon="mdi:content-save" text="Save creature" :class="{ inverted: !isSavingCreature }" size="24"
			:loading="isSavingCreature" @click="saveStatblock2(true)"
		/>
		<v-icon-btn
			v-tooltip="'Generate automation from description. May be incomplete or inaccurate. Only works for basic, to hit attacks.'"
			icon="fa7-solid:wand-sparkles"
			text="Generate automation from description. May be incomplete or inaccurate. Only works for basic, to hit attacks."
			size="24" @click="generateAutomation"
		/>
		<v-icon-btn
			v-tooltip="'Change editor'" size="24" icon="mdi:code-block-braces" text="Change editor"
			@click="EditAutomationRef?.toggleEditor()"
		/>
		<ImportAutomationUtil @load-feature="(feature, apiPath) => loadFeature(feature, apiPath)" />
		<ImportToCharacter :automation="data?.features[type][aid].automation ?? null" />
		<v-icon-btn
			v-if="data && store.isMobile" v-tooltip="'Clear automation'" icon="mdi:delete"
			text="Clear automation" size="24" @click="data.features[type][aid].automation = {}"
		/>
		<v-icon-btn
			v-if="data && store.isMobile" v-tooltip="'Copy automation'" icon="mdi:content-copy"
			text="Copy automation" size="24" @click="EditAutomationRef?.copyAutomation()"
		/>
	</Breadcrumbs>
	<div v-if="data" class="content">
		<div class="pa-0">
			<v-row>
				<v-col cols="4">
					<v-text-field
						v-model="data.features[type][aid].name" type="text" label="Feature name"
						:minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength" variant="outlined"
						hide-details
					/>
					<span v-if="isVisualEditor">
						<input v-model="parityOptions.updateName" type="checkbox" style="scale: .7; translate: 0 4px">
						<small style="font-size: x-small;"> <i>Updates the name of the first action in the automation
							structure to this text while enabled.</i> </small>
					</span>
					<div style="margin-top: 1rem;">
						<select v-model="toNavigateTo" class="ghost w-100" placeholder="Open other attack">
							<option :value="[-1, -1]" disabled selected>
								Open another action
							</option>
							<template v-for="aType, name in data.features" :key="name">
								<optgroup v-if="aType.length > 0" :label="name">
									<option v-for="action, index in aType" :key="index" :value="[name, index]">
										{{ action.name }}
									</option>
								</optgroup>
							</template>
						</select>
					</div>

					<div v-if="!isVisualEditor && showDescriptionButtons" class="mt-4">
						<b> Descriptions: </b>
						<span style="color: rgb(var(--v-theme-error))"> Don't match. </span>
						<p
							style="text-decoration: underline; font-size: smaller; cursor: pointer;"
							@click="updateAutomationDescFromFeatureDesc"
						>
							Update from feature
						</p>
						<p
							style="text-decoration: underline; font-size: smaller; cursor: pointer"
							@click="updateFeatureDescFromAutomationDesc"
						>
							Update from automation
						</p>
					</div>
				</v-col>
				<v-col cols="8">
					<Editor v-model="data.features[type][aid].description" :height="100" />
					<span v-if="isVisualEditor" class="sub-action">
						<input v-model="parityOptions.updateDescription" type="checkbox">
						<small> <i>Updates the last text node of the first action in the automation structure to this
							text
							while
							enabled.</i> </small>
					</span>
				</v-col>
			</v-row>
		</div>
		<EditAutomation
			ref="EditAutomationRef" v-model="data.features[type][aid].automation"
			v-model:is-visual-editor="isVisualEditor" :name="data.features[type][aid].name" :no-list-attack="false"
		/>
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

a {
	color: rgb(var(--v-theme-primary));
}

.sub-action {
	line-height: 0.7;

	small {
		font-size: x-small;
	}

	input[type="checkbox"] {
		scale: 0.7;
		translate: 0 4px;
	}
}
</style>
