<script setup lang="ts">
import type { Ref } from "vue";
import type { Variable } from "~/shared";
import { inject, onBeforeUnmount, onMounted, watch } from "vue";
import { useRules } from "vuetify/labs/rules";
import HigherLevels from "./shared/HigherLevels.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import TypeHintedEditor from "@/components/FormInputs/TypeHintedEditor.vue";

const currentEffect = inject<Ref<Variable>>("currentEffect");

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

onMounted(() => {
	if (!Object.hasOwn(currentEffect!.value, "higher"))
		currentEffect!.value.higher = {};
});
useDataCleanup(currentEffect, ["onError", "higher"]);

const rules = useRules();
</script>

<template>
	<template v-if="currentEffect">
		<v-row dense>
			<v-col cols="12">
				<SectionHeader title="Set Variable" />
			</v-col>

			<v-col cols="6">
				<v-text-field v-model="currentEffect.name" label="Name" :rules="[rules.required()]" />
			</v-col>

			<v-col cols="6">
				<TypeHintedEditor v-model="currentEffect.value" label="Value" class="mb-4" />
			</v-col>

			<v-col cols="12">
				<SectionHeader title="Additional Options" />
			</v-col>

			<v-col cols="6">
				<TypeHintedEditor v-model="currentEffect.onError" label="On Error" />
			</v-col>

			<v-col cols="12" v-if="currentEffect.higher">
				<div>At higher levels</div>
				<HigherLevels v-model="(currentEffect.higher as Record<number, string>)" is-int-expression />
			</v-col>
		</v-row>

	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
