<script setup lang="ts">
import type { Ref } from "vue";
import type { TempHP } from "~/shared";
import { inject, onBeforeUnmount, watch } from "vue";
import HigherLevels from "./shared/HigherLevels.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<TempHP>>("currentEffect");

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

useDataCleanup(currentEffect, ["cantripScale"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Temp HP" />
		<div>
			<v-text-field v-model="currentEffect.amount" label="Amount" hint="AnnotatedString" />
		</div>
		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<v-checkbox v-model="currentEffect.cantripScale" label="Whether this roll should scale like a cantrip."
				hide-details />
			<div>
				<div>At higher levels</div>
				<HigherLevels v-model="(currentEffect.higher as Record<number, string>)" />
			</div>
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
