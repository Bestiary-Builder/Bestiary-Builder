<script setup lang="ts">
import type { Ref } from "vue";
import type { Attack } from "~/shared";
import { inject, onUnmounted, ref, watch } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<Attack>>("currentEffect");

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
		<v-text-field label="Attack Bonus" v-model="currentEffect.attackBonus" hint="IntExpression" />

		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<v-select v-model="currentEffect.adv" label="Advantage (optional)" title="Advantage" :items="[
				{ title: 'Flat', value: '0' },
				{ title: 'Advantage', value: '1' },
				{ title: 'Elven Advantage', value: '2' },
				{ title: 'Disadvantage', value: '-1' },
				isCustom
					? { title: 'Custom', value: currentEffect.adv }
					: { title: 'Custom', value: 'custom' },
			]" @update:model-value="handleChange" />
			<template v-if="isCustom">
				<v-text-field label="Custom Advantage" v-model="currentEffect.adv" hint="IntExpression" />
			</template>
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
