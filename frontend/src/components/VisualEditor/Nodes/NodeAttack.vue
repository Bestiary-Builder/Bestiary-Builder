<script setup lang="ts">
import { type Ref, inject, onUnmounted, ref, watch } from "vue";
import IntExpression from "./shared/IntExpression.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { Attack } from "~/shared";

const currentEffect = inject<Ref<Attack>>("currentEffect");
const _currentContext = inject<Ref<string[]>>("currentContext");

watch(() => currentEffect?.value?.attackBonus, () => {
	if (currentEffect?.value?.attackBonus === "")
		delete currentEffect?.value.attackBonus;
});

if (currentEffect!.value && !Object.hasOwn(currentEffect!.value, "adv"))
	currentEffect!.value.adv = "0";

onUnmounted(() => {
	if (currentEffect?.value?.adv === "0")
		delete currentEffect?.value.adv;
});

const isCustom = ref(false);

const handleChange = () => {
	if (currentEffect?.value.adv === "custom") {
		isCustom.value = true;
		currentEffect.value.adv = "";
	}
	else {
		isCustom.value = false;
	}
};

useDataCleanup(currentEffect, ["attackBonus"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Attack" />
		<LabelledComponent title="Attack Bonus" for="attackBonus">
			<div class="input-wrapper">
				<input id="attackBonus" v-model="currentEffect.attackBonus" type="text"> <IntExpression />
			</div>
		</LabelledComponent>
		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="Advantage (optional)" for="advantage">
				<select id="advantage" v-model="currentEffect.adv" title="Advantage" class="ghost" @change="handleChange">
					<option value="0">
						Flat
					</option>
					<option value="1">
						Advantage
					</option>
					<option value="2">
						Elven Advantage
					</option>
					<option value="-1">
						Disadvantage
					</option>
					<option v-if="!isCustom" value="custom">
						Custom
					</option>
					<option v-else :value="currentEffect.adv">
						Custom
					</option>
				</select>
			</LabelledComponent>
			<LabelledComponent v-if="isCustom" title="Custom Advantage" for="customAdvantage">
				<div class="input-wrapper">
					<input id="customAdvantage" v-model="currentEffect.adv" type="text"> <IntExpression />
				</div>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
