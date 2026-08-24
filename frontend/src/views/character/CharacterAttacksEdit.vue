<script setup lang="ts">
import type { AvraeCharacter } from "@/components/Characters/utils";
import type { FeatureEntity } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { onMounted, provide, ref, useTemplateRef } from "vue";
import { useRoute } from "vue-router";
import ImportAutomationUtil
	from "@/components/Automations/ImportAutomationUtil.vue";
import { getAvraeCharacterByUpstream } from "@/components/Characters/utils";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";
import { useHotkey } from "vuetify";
import { store } from "@/utils/store";
import EditAutomation from "@/components/Automations/EditAutomation.vue";
import { useRecentPages } from "@/utils/app/useRecentPages";

const character = ref<AvraeCharacter | null>(null);
const AvraeToken = useLocalStorage("AvraeToken", "");
const $route = useRoute();
const { updateLabel } = useRecentPages()

const { addToast, updateToast } = useToast()
onMounted(async () => {
	if (AvraeToken) {
		character.value = await getAvraeCharacterByUpstream($route.params.upstream as string);
		if (character.value)
			updateLabel($route.path, character.value.name);
	}
});

const activeAttackIndex = ref<number>(-1);
const isSavingAttacks = ref(false)
const saveAttacks = async () => {
	if (!character.value)
		return;
	const attacks = character.value.overrides.attacks;
	if (!attacks) {
		addToast("No attacks.");
		return;
	}
	isSavingAttacks.value = true
	const toasterId = addToast("Waiting on the Avrae API...", { loading: true });
	const { success, error } = await useFetch(`/api/character/${character.value.upstream}/attacks/set`, "POST", attacks);

	if (success) {
		setTimeout(() => updateToast(toasterId, { text: `Successfully updated your attacks`, prependIcon: 'mdi-check' }), 250);
		void getUmami()?.track("Imported Attack to Avrae");
	}
	else {
		updateToast(toasterId, { text: error, color: "error" });
	}

	isSavingAttacks.value = false
};

useHotkey("cmd+s", async () => await saveAttacks(), { inputs: true })

const addAttack = () => {
	if (!character.value)
		return;
	character.value.overrides.attacks.push({ _v: 2, name: "New attack", automation: [] });
	activeAttackIndex.value = character.value.overrides.attacks.length - 1;
};

const loadFeature = async (feature: FeatureEntity) => {
	if (!character.value)
		return;

	if (!character.value.overrides.attacks)
		character.value.overrides.attacks = [];

	if (feature.automation === null) {
		addToast("Automation has no feature", { color: "error" })
		return;
	}
	if (Array.isArray(feature.automation)) {
		addToast("Features with multiple automations will import as seperate automations");
		for (const auto of feature.automation) {
			character.value.overrides.attacks.push(auto);
		}
	}
	else {
		character.value.overrides.attacks.push(feature.automation);
	}

	activeAttackIndex.value = character.value.overrides.attacks.length - 1;
	addToast(`Successfully loaded ${feature.name}!`, { color: "success" });
};

provide("setActionName", false);
provide("setActionDescription", false);

const EditAutomationRef = useTemplateRef("EditAutomationRef");
const isVisualEditor = ref(store.user?.preferredEditor === "Visual");
</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: '/characters',
			text: 'My Characters',
			isCurrent: false
		},
		{
			path: '',
			text: character ? character.name : 'Character',
			isCurrent: true
		}
	]">
		<v-icon-btn icon="mdi:content-save" text="Save attacks" :class="{ inverted: !isSavingAttacks }"
			@click="saveAttacks" size="24" :loading="isSavingAttacks" v-tooltip="'Save attacks (CTRL+S)'" />
		<v-icon-btn icon="mdi:plus" text="Add attack" @click="addAttack" size="24" v-tooltip="'Add attack'" />
		<v-icon-btn size="24" icon="mdi:code-block-braces" text="Change editor"
			@click="EditAutomationRef?.toggleEditor()" v-tooltip="'Change editor'" />
		<ImportAutomationUtil @load-feature="(feature: FeatureEntity) => loadFeature(feature)" />
	</Breadcrumbs>
	<div v-if="!AvraeToken" class="content">
		No Avrae Connection made. Please see <RouterLink to="/user-settings#avrae-token" style="color: orangered">
			your user settings
		</RouterLink> for how to enable this.
	</div>
	<div v-else-if="character" class="content">
		<div class="selected-container">
			<select v-model="activeAttackIndex">
				<option :value="-1">
					Select an attack
				</option>
				<option v-for="attack, idx of character.overrides.attacks" :key="idx" :value="idx">
					{{ attack.name }}
				</option>
			</select>
			<DropdownMenu>
				<template #activator="{ props }">
					<v-icon-btn icon="mdi:trash" text="Delete currently selected attack" v-bind="props"
						:disabled="activeAttackIndex < 0" />
				</template>
				<v-card min-width="300" class="text-center pb-2">
					<v-card-text>
						Are you sure you want to delete <br>{{ character.overrides.attacks[activeAttackIndex].name }}?
					</v-card-text>
					<v-card-actions>
						<v-btn size="large" color="red" class="mx-auto"
							@click="character.overrides.attacks.splice(activeAttackIndex, 1); activeAttackIndex = -1">
							Confirm
						</v-btn>
					</v-card-actions>
				</v-card>
			</DropdownMenu>
		</div>
		<div class="mt-8">
			<EditAutomation ref="EditAutomationRef" v-model="character.overrides.attacks[activeAttackIndex]"
				v-model:is-visual-editor="isVisualEditor" :name="character.name" no-list-attack
				v-if="activeAttackIndex > -1" />
			<div v-else>
				No attack selected.
			</div>
		</div>
	</div>
	<div v-else class="content">
		Loading...
	</div>
</template>