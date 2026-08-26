<script setup lang="ts">
import type { Ref } from "vue";
import type { Damage } from "~/shared";
import { inject, onBeforeUnmount, watch } from "vue";
import HigherLevels from "./shared/HigherLevels.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<Damage>>("currentEffect");

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
		<v-text-field v-model="currentEffect.damage" label="Damage" hint="Annotated string" />

		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<v-checkbox
				v-model="currentEffect.fixedValue" label="Whether this roll should ignore the -d argument and
					damage bonus effects." hide-details
			/>

			<v-checkbox
				v-model="currentEffect.overheal"
				label="Whether this damage should go through if it exceeds the targets hit point maximum."
				hide-details
			/>
			<v-checkbox
				v-model="currentEffect.cantripScale" label="Whether this roll should scale like a cantrip."
				hide-details
			/>

			<div>
				<div>At higher levels</div>
				<HigherLevels v-model="(currentEffect!.higher as Record<number, string>)" />
			</div>
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
