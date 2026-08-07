<script setup lang="ts">
import type { Ref } from "vue";
import type { Target } from "~/shared";
import { computed, inject, watch } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<Target>>("currentEffect");
const currentContext = inject<Ref<string[]>>("currentContext");

const isButton = computed(() => currentContext!.value.includes("buttons"));
const isIAttack = computed(() => currentContext!.value.includes("attacks"));

watch(() => currentEffect!.value?.target, () => {
	if (!currentEffect!.value?.target)
		currentEffect!.value.target = 1;
});

const hasAllTarget = computed(() => {
	if (isButton.value && isIAttack.value && (currentContext!.value.indexOf("attacks") > currentContext!.value.indexOf("buttons")))
		return true;

	return !isButton.value;
});

if (currentEffect?.value.target === "all")
	currentEffect.value.target = "each";

useDataCleanup(currentEffect, ["sortBy"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Target" />
		<div class="two-wide">
			<v-select v-model="currentEffect.target" label="Target" title="Target" :items="[
				...(hasAllTarget ? [{ title: 'Each/All', value: 'each' }] : []),
				{ title: 'Self/Caster', value: 'self' },
				...(!isButton ? [{ title: 'Position', value: Number(currentEffect.target) ? currentEffect.target : 1 }] : []),
				...(isIAttack ? [{ title: 'Parent', value: 'parent' }] : []),
				...(isIAttack ? [{ title: 'Children', value: 'children' }] : []),
			]" />
			<v-number-input v-if="Number(currentEffect.target)" v-model="(currentEffect.target as number)"
				label="Target Position" :min="1" variant="solo-filled" />
		</div>
		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<v-select v-model="currentEffect.sortBy" label="Sort Targets By" placeholder="User Input" title="User input"
				:items="[
					{ title: 'User Input', value: null },
					{ title: 'HP Ascending', value: 'hp_asc' },
					{ title: 'HP Desc', value: 'hp_desc' },
				]" />
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
