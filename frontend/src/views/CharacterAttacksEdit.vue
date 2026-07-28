<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import ButtonIcon from "@/components/Global/ButtonIcon.vue";
import Breadcrumbs from "@/components/Page/Breadcrumbs.vue";
import { getUmami } from "@/utils/app/analytics";
import { $toast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import VisualEditor from "@/components/VisualEditor/VisualEditor.vue";
import type { FeatureEntity } from "~/shared";
import ImportAutomationUtil
	from "@/components/Automations/ImportAutomationUtil.vue";

const character = ref();
const AvraeToken = useLocalStorage("AvraeToken", "");
const $route = useRoute();

const getAvraeCharacters = async () => {
	const toasterId = $toast.loading("Getting character data from Avrae...");
	const { success, data, error } = await useFetch("/api/character/list");
	if (success) {
		getUmami()?.track("Loaded Avrae Characters");
		character.value = (data as any[]).find(char => char.upstream === $route.params.upstream);
		$toast.dismiss(toasterId);
	}
	else {
		$toast.error(error, { id: toasterId });
	}
};
onMounted(async () => {
	if (AvraeToken)
		await getAvraeCharacters();
});

const activeAttackIndex = ref<number>(-1);

const saveAttacks = async () => {
	const attacks = character.value.overrides.attacks;
	if (!attacks) {
		$toast.info("No attacks.");
		return;
	}

	const toasterId = $toast.loading("Waiting on the Avrae API...");
	const { success, error } = await useFetch(`/api/character/${character.value.upstream}/attacks/set`, "POST", attacks);

	if (success) {
		$toast.success(`Successfully updated your attacks`, { id: toasterId });
		getUmami()?.track("Imported Attack to Avrae");
	}
	else {
		$toast.error(error, { id: toasterId });
	}
};

const loadFeature = async (feature: FeatureEntity) => {
	if (!character.value.overrides.attacks)
		character.value.overrides.attacks = 0;

	if (Array.isArray(feature.automation)) {
		$toast.info("cannot import cause array");
		return;
	}

	character.value.overrides.attacks.push(feature.automation);
	activeAttackIndex.value = character.value.overrides.attacks.length - 1;
	$toast.success(`Successfully loaded ${feature.name}!`);
};
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: '/characters',
				text: 'My Characters',
				isCurrent: false
			},
			{
				path: '',
				text: character ? character.name : '',
				isCurrent: true
			}
		]"
	>
		<ButtonIcon icon="save" label="Save attacks" inverted @click="saveAttacks" />
		<ButtonIcon icon="plus" label="Add attack" @click="character.overrides.attacks.push({ _v: 2, name: 'New attack', automation: null }); activeAttackIndex = character.overrides.attacks.length - 1" />
		<ImportAutomationUtil @load-feature="(feature : FeatureEntity) => loadFeature(feature)" />
	</Breadcrumbs>
	<div v-if="!AvraeToken" class="content">
		<LabelledComponent title="Avrae Token">
			<div class="preview-container">
				<input v-model="AvraeToken" type="text">
			</div>
			<small> Instructions go here. </small>
		</LabelledComponent>
	</div>
	<div v-else-if="character" class="content">
		<div>
			<div class="info-container">
				<b> {{ character.name }}</b>
				<span> Level {{ character.levels.total_level }}</span>
			</div>
			<select v-model="activeAttackIndex" style="margin-top: .5rem;">
				<option :value="-1">
					No attack selected
				</option>
				<option v-for="attack, idx of character.overrides.attacks" :key="idx" :value="idx">
					{{ attack.name }}
				</option>
			</select>
		</div>
		<button v-if="activeAttackIndex > -1" class="btn danger" style="margin-top: .5rem" @click="character.overrides.attacks.splice(activeAttackIndex, 1); activeAttackIndex = -1">
			Remove attack
		</button>
		<div style="margin-top: 2rem;">
			<VisualEditor v-if="activeAttackIndex !== -1" v-model="character.overrides.attacks[activeAttackIndex]" name="New Attack" no-list-attack />
			<p> No attack selected.</p>
		</div>
	</div>
</template>

<style scoped lang="less">
@import url("@/assets/styles/mixins.less");

.info-container {
	display: flex;
	gap: 0.5rem;
	flex-direction: column;
}
</style>
