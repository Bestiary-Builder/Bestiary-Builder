<script setup lang="ts">
import { type Ref, inject, onBeforeUnmount, watch } from "vue";
import HigherLevels from "./shared/HigherLevels.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import AnnotatedString from "./shared/AnnotatedString.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { Roll } from "~/shared";

const currentEffect = inject<Ref<Roll>>("currentEffect");
const _currentContext = inject<Ref<string[]>>("currentContext");

watch(() => currentEffect?.value.cantripScale, async () => {
	if (!currentEffect?.value.cantripScale)
		delete currentEffect!.value.cantripScale;
});

watch(() => currentEffect?.value.hidden, async () => {
	if (!currentEffect?.value.hidden)
		delete currentEffect!.value.hidden;
});

watch(() => currentEffect?.value.displayName, async () => {
	if (currentEffect?.value.displayName === "")
		delete currentEffect.value.displayName;
});

watch(() => currentEffect?.value.fixedValue, async () => {
	if (!currentEffect?.value.fixedValue)
		delete currentEffect!.value.fixedValue;
});

watch(() => currentEffect?.value.higher, () => {
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
		<SectionHeader title="Roll" />
		<div class="two-wide">
			<LabelledComponent title="Name*" for="name">
				<input id="name" v-model="currentEffect.name" type="text">
			</LabelledComponent>
			<LabelledComponent title="Dice*" for="dice">
				<div class="input-wrapper">
					<input id="dice" v-model="currentEffect.dice" type="text"><AnnotatedString />
				</div>
			</LabelledComponent>
		</div>

		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="Display name" for="displayName">
				<input id="displayName" v-model="currentEffect.displayName" type="text">
			</LabelledComponent>
			<LabelledComponent title="Fixed value" for="fixedValue">
				<span> <input id="fixedValue" v-model="currentEffect.fixedValue" type="checkbox"> <label for="fixedValue"> Whether this roll should ignore the <span style="display: inline-block">-d</span> argument and damage bonus effects.</label> </span>
			</LabelledComponent>
			<LabelledComponent title="Hidden" for="hidden">
				<span><input id="hidden" v-model="currentEffect.hidden" type="checkbox"> <label for="overheal">Whether to display the roll in the Meta field, or to apply any bonuses from the -d argument.</label>  </span>
			</LabelledComponent>
		</div>

		<SectionHeader title="Spell Options" />
		<div class="two-wide">
			<LabelledComponent title="At higher levels" for="higherLevels">
				<HigherLevels v-model="(currentEffect.higher as Record<number, string>)" />
			</LabelledComponent>
			<LabelledComponent title="Scales like Cantrip" for="cantripScale">
				<span><input id="cantripScale" v-model="currentEffect.cantripScale" type="checkbox"> <label for="cantripScale"> Whether this roll should scale like a cantrip. </label> </span>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
