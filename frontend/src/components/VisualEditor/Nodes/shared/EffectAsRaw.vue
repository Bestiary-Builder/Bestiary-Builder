<script lang="ts" setup>
import { type Ref, computed, inject, toRaw } from "vue";

const currentEffect = inject<Ref<any>>("currentEffect");

const sanitizedEffect = computed(() => {
	if (!currentEffect || !currentEffect.value)
		return {};
	const input = structuredClone(toRaw(currentEffect.value));
	if (Object.hasOwn(input, "effects")) {
		if (Object.hasOwn(input, "type") && input.type !== "ieffect2")
			input.effects = ["..."];
	}
	if (Object.hasOwn(input, "onFalse"))
		input.onFalse = ["..."];
	if (Object.hasOwn(input, "onTrue"))
		input.onTrue = ["..."];
	if (Object.hasOwn(input, "fail"))
		input.fail = ["..."];
	if (Object.hasOwn(input, "success"))
		input.success = ["..."];
	if (Object.hasOwn(input, "hit"))
		input.hit = ["..."];
	if (Object.hasOwn(input, "miss"))
		input.miss = ["..."];
	return input;
});
</script>

<template>
	<details v-if="currentEffect">
		<summary> Show effect as JSON</summary>
		<div>
			{{ JSON.stringify(sanitizedEffect, null, 2) }}
		</div>
	</details>
</template>

<style scoped>
div {
	white-space: pre;
	max-width: 100%;
	text-wrap: wrap;
}
</style>
