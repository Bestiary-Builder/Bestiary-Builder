<script setup lang="ts">
import type { Ref } from "vue";
import type { Attack } from "~/shared";
import { inject, onUnmounted, ref, watch } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import TypeHintedEditor from "@/components/FormInputs/TypeHintedEditor.vue";

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
		<v-row density="comfortable">
			<v-col cols="12">
				<SectionHeader title="Attack" />
			</v-col>

			<v-col cols="12">
				<TypeHintedEditor v-model="currentEffect.attackBonus" label="Attack Bonus" />
			</v-col>

			<v-col cols="12">
				<SectionHeader title="Additional Options" />
			</v-col>

			<v-col cols="6">
				<v-select v-model="currentEffect.adv" label="Advantage (optional)" title="Advantage" :items="[
					{ title: 'Flat', value: '0' },
					{ title: 'Advantage', value: '1' },
					{ title: 'Elven Advantage', value: '2' },
					{ title: 'Disadvantage', value: '-1' },
					isCustom
						? { title: 'Custom', value: currentEffect.adv }
						: { title: 'Custom', value: 'custom' },
				]" @update:model-value="handleChange" />
			</v-col>

			<v-col cols="6">
				<template v-if="isCustom">
					<TypeHintedEditor v-model="currentEffect.adv" label="Custom Advantage" />
				</template>
			</v-col>
		</v-row>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
