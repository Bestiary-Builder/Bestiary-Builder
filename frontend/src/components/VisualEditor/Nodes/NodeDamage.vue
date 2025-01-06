<script setup lang="ts">
import { type Ref, inject, onBeforeUnmount, watch } from "vue";
import HigherLevels from "./shared/HigherLevels.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import AnnotatedString from "./shared/AnnotatedString.vue";
import { useDataCleanup } from "./shared/utils";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { Damage } from "~/shared";

const currentEffect = inject<Ref<Damage>>("currentEffect");
const _currentContext = inject<Ref<string[]>>("currentContext");

watch(() => currentEffect?.value.higher, () => {
	for (const index in currentEffect?.value.higher) {
		const toIndex = Number.parseInt(index);
		if (currentEffect?.value.higher[toIndex] === "")
			delete currentEffect?.value.higher[toIndex];
	}
}, { deep: true });

onBeforeUnmount(() => {
	if (!Object.values(currentEffect?.value.higher || {}).some(x => x !== ""))
		delete currentEffect?.value.higher;
});

if (!Object.hasOwn(currentEffect!.value, "higher"))
	currentEffect!.value.higher = {};

useDataCleanup(currentEffect, ["overheal", "cantripScale", "fixedValue"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Damage" />
		<LabelledComponent title="Damage" for="damage">
			<div class="input-wrapper">
				<textarea id="damage" v-model="currentEffect.damage" type="text" /><AnnotatedString />
			</div>
		</LabelledComponent>
		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="Allow Overheal" for="overheal">
				<span><input id="overheal" v-model="currentEffect.overheal" type="checkbox"> <label for="overheal">Whether this damage should allow a target to exceed its hit point maximum.</label>  </span>
			</LabelledComponent>
			<LabelledComponent title="Scales like Cantrip" for="cantripScale">
				<span><input id="cantripScale" v-model="currentEffect.cantripScale" type="checkbox"> <label for="cantripScale"> Whether this roll should scale like a cantrip. </label> </span>
			</LabelledComponent>
			<LabelledComponent title="Fixed value" for="fixedValue">
				<span> <input id="fixedValue" v-model="currentEffect.fixedValue" type="checkbox"> <label for="fixedValue"> Whether this roll should ignore the <span style="display: inline-block">-d</span> argument and damage bonus effects.</label> </span>
			</LabelledComponent>
			<LabelledComponent title="At higher levels" for="higherLevels">
				<HigherLevels v-model="(currentEffect!.higher as Record<number, string>)" />
			</LabelledComponent>
		</div>
		{{ currentEffect }}
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
