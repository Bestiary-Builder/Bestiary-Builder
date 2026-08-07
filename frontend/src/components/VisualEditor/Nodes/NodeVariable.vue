<script setup lang="ts">
import type { Ref } from "vue";
import type { Variable } from "~/shared";
import { inject, onBeforeUnmount, onMounted, watch } from "vue";
import HigherLevels from "./shared/HigherLevels.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import { useRules } from "vuetify/labs/rules";

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

onMounted(() => {
	if (!Object.hasOwn(currentEffect!.value, "higher"))
		currentEffect!.value.higher = {};
});
useDataCleanup(currentEffect, ["onError"]);

const rules = useRules()
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Set Variable" />
		<div class="two-wide mb-4">
			<v-text-field v-model="currentEffect.name" label="Name" :rules="[rules.required()]" />
		</div>
		<div>
			<v-text-field v-model="currentEffect.value" label="Value" :rules="[rules.required()]"
				hint="IntExpression" />
		</div>

		<SectionHeader title="Additional Options" />

		<div class="two-wide">
			<div>
				<v-text-field v-model="currentEffect.onError" label="On Error" hint="IntExpression" />
			</div>
			<div v-if="currentEffect.higher">
				<div>At higher levels</div>
				<HigherLevels v-model="(currentEffect.higher as Record<number, string>)" is-int-expression />
			</div>
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
