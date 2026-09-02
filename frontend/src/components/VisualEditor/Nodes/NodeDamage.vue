<script setup lang="ts">
import type { Ref } from "vue";
import type { Damage } from "~/shared";
import { inject, onBeforeUnmount, watch } from "vue";
import HigherLevels from "./shared/HigherLevels.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import TypeHintedEditor from "@/components/FormInputs/TypeHintedEditor.vue";

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
		<v-row density="comfortable">
			<v-col cols="12">
				<SectionHeader title="Damage" />
			</v-col>

			<v-col cols="6">
				<TypeHintedEditor v-model="currentEffect.damage" label="Damage" is-annotated-string />
			</v-col>

			<v-col cols="12">
				<SectionHeader title="Additional Options" />
			</v-col>

			<v-col cols="6">
				<v-checkbox v-model="currentEffect.fixedValue" label="Whether this roll should ignore the -d argument and
					damage bonus effects." hide-details />
			</v-col>

			<v-col cols="6">
				<v-checkbox v-model="currentEffect.overheal"
					label="Whether this damage should go through if it exceeds the targets hit point maximum."
					hide-details />
			</v-col>
			<v-col cols="6">
				<v-checkbox v-model="currentEffect.cantripScale" label="Whether this roll should scale like a cantrip."
					hide-details />
			</v-col>

			<v-col cols="6">
				<div>At higher levels</div>
				<HigherLevels v-model="(currentEffect!.higher as Record<number, string>)" />
			</v-col>
		</v-row>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
