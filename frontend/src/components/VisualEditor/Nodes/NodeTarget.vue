<script setup lang="ts">
import type { Ref } from "vue";
import type { Target } from "~/shared";
import { computed, inject, watch } from "vue";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import LabelledNumberInput from "@/components/FormInputs/LabelledNumberInput.vue";
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
			<LabelledComponent title="Target" for="target">
				<select id="target" v-model="currentEffect.target" title="Target" class="ghost">
					<option v-if="hasAllTarget" value="each">
						Each/All
					</option>
					<option value="self">
						Self/Caster
					</option>
					<option v-if="!isButton" :value="Number(currentEffect.target) ? currentEffect.target : 1">
						Position
					</option>
					<option v-if="isIAttack" value="parent">
						Parent
					</option>
					<option v-if="isIAttack" value="children">
						Children
					</option>
				</select>
			</LabelledComponent>
			<LabelledNumberInput v-if="Number(currentEffect.target)" v-model="(currentEffect.target as number)" title="Target Position" :min="1" :step="1" :is-clearable="false" />
		</div>
		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="Sort Targets By" for="sortTargetsBy">
				<select id="sortTargetBy" v-model="currentEffect.sortBy" placeholder="User Input" title="User input" class="ghost">
					<option :value="null">
						User Input
					</option>
					<option value="hp_asc">
						HP Ascending
					</option>
					<option value="hp_desc">
						HP Desc
					</option>
				</select>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
