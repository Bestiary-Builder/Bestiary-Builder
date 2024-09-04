<script setup lang="ts">
import { type Ref, inject, onBeforeUnmount, watch } from "vue";
import HigherLevels from "./shared/HigherLevels.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { TempHP } from "~/shared";

const currentEffect = inject<Ref<TempHP>>("currentEffect");
const _currentContext = inject<Ref<string[]>>("currentContext");

watch(() => currentEffect!.value?.cantripScale, async () => {
	if (!currentEffect!.value?.cantripScale)
		delete currentEffect!.value.cantripScale;
});

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
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Temp HP" />
		<LabelledComponent title="Amount" for="amount">
			<input id="amount" v-model="currentEffect.amount" type="text">
		</LabelledComponent>
		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="Scales like Cantrip" for="cantripScale">
				<span><input id="cantripScale" v-model="currentEffect.cantripScale" type="checkbox"> <label for="cantripScale"> Whether this roll should scale like a cantrip. </label> </span>
			</LabelledComponent>
			<LabelledComponent title="At higher levels" for="higherLevels">
				<HigherLevels v-model="(currentEffect.higher as Record<number, string>)" />
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
