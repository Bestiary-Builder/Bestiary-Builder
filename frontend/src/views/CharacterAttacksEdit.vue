<script setup lang="ts">
import type { AvraeCharacter } from "@/components/Characters/utils";
import type { FeatureEntity } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { onMounted, provide, ref } from "vue";
import { useRoute } from "vue-router";
import ImportAutomationUtil
	from "@/components/Automations/ImportAutomationUtil.vue";
import { getAvraeCharacterByUpstream } from "@/components/Characters/utils";
import ButtonIcon from "@/components/Global/ButtonIcon.vue";
import Breadcrumbs from "@/components/Page/Breadcrumbs.vue";
import VisualEditor from "@/components/VisualEditor/VisualEditor.vue";
import { getUmami } from "@/utils/app/analytics";
import { $toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

const character = ref<AvraeCharacter | null>(null);
const AvraeToken = useLocalStorage("AvraeToken", "");
const $route = useRoute();

onMounted(async () => {
	if (AvraeToken)
		character.value = await getAvraeCharacterByUpstream($route.params.upstream as string);
});

const activeAttackIndex = ref<number>(-1);

const saveAttacks = async () => {
	if (!character.value)
		return;
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
		$toast.error("Cannot import a feature with empty automation.");
		return;
	}
	if (Array.isArray(feature.automation)) {
		$toast.info("Features with multiple automations will import as seperate automations");
		for (const auto of feature.automation) {
			character.value.overrides.attacks.push(auto);
		}
	}
	else {
		character.value.overrides.attacks.push(feature.automation);
	}

	activeAttackIndex.value = character.value.overrides.attacks.length - 1;
	$toast.success(`Successfully loaded ${feature.name}!`);
};

provide("setActionName", false);
provide("setActionDescription", false);
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
		<ButtonIcon icon="plus" label="Add attack" @click="addAttack" />
		<ImportAutomationUtil @load-feature="(feature : FeatureEntity) => loadFeature(feature)" />
	</Breadcrumbs>
	<div v-if="!AvraeToken" class="content">
		No Avrae Connection made. Please see <RouterLink to="/user-settings#avrae-token" style="color: orangered">
			your user settings
		</RouterLink> for how to enable this.
	</div>
	<div v-else-if="character" class="content">
		<div class="selected-container">
			<select v-model="activeAttackIndex" style="width: 250px;">
				<option :value="-1">
					No attack selected
				</option>
				<option v-for="attack, idx of character.overrides.attacks" :key="idx" :value="idx">
					{{ attack.name }}
				</option>
			</select>
			<VDropdown :distance="6" :positioning-disabled="store.isMobile">
				<ButtonIcon icon="eraser" label="Delete currently selected attack" />
				<template #popper>
					<div class="v-popper__custom-menu">
						<span> Are you sure you want to delete {{ character.overrides.attacks[activeAttackIndex].name }}? </span>
						<button v-close-popper class="btn danger" @click="character.overrides.attacks.splice(activeAttackIndex, 1); activeAttackIndex = -1">
							Confirm
						</button>
					</div>
				</template>
			</VDropdown>
		</div>
		<div style="margin-top: 2rem;">
			<VisualEditor v-if="activeAttackIndex !== -1" v-model="character.overrides.attacks[activeAttackIndex]" name="New Attack" no-list-attack />
		</div>
	</div>
</template>

<style scoped lang="less">
@import url("@/assets/styles/mixins.less");

.selected-container {
	display: flex;
	button {
		translate: 0 4px;
	}
}
</style>
