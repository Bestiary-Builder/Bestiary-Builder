<script setup lang="ts">
import { type Ref, inject, onBeforeUnmount, watch } from "vue";
import HigherLevels from "./shared/HigherLevels.vue";
import IntExpression from "./shared/IntExpression.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { Variable } from "~/shared";

const currentEffect = inject<Ref<Variable>>("currentEffect");
const _currentContext = inject<Ref<string[]>>("currentContext");

watch(() => currentEffect!.value?.higher, () => {
	for (const index in currentEffect!.value.higher) {
		const toIndex = Number.parseInt(index);
		if (currentEffect!.value.higher[toIndex] === "")
			delete currentEffect!.value.higher[toIndex];
	}
}, { deep: true });

onBeforeUnmount(() => {
	if (!Object.values(currentEffect!.value.higher || {}).some(x => x !== ""))
		delete currentEffect!.value.higher;
});

if (!Object.hasOwn(currentEffect!.value, "higher"))
	currentEffect!.value.higher = {};

useDataCleanup(currentEffect, ["onError"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Set Variable" />
		<div class="two-wide">
			<LabelledComponent title="Name*" for="name">
				<input id="name" v-model="currentEffect.name" type="text" :class="{ required: currentEffect.name.length === 0 }">
			</LabelledComponent>
		</div>
		<LabelledComponent title="Value*" for="value">
			<div class="input-wrapper">
				<input id="value" v-model="currentEffect.value" type="text" :class="{ required: currentEffect.value.length === 0 }"> <IntExpression />
			</div>
		</LabelledComponent>

		<SectionHeader title="Additional Options" />

		<div class="two-wide">
			<LabelledComponent title="On Error" for="error">
				<div class="input-wrapper">
					<input id="error" v-model="currentEffect.onError" type="text"> <IntExpression />
				</div>
			</LabelledComponent>
			<LabelledComponent title="At higher levels" for="higherLevels">
				<HigherLevels v-model="(currentEffect.higher as Record<number, string>)" is-int-expression />
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
