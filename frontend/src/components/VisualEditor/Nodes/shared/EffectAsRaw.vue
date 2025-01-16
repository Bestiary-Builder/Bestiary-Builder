<script lang="ts" setup>
defineProps<{ currentEffect: any }>();
const sanitizedEffect = (effect: any) => {
	if (!effect)
		return {};
	const input = JSON.parse(JSON.stringify(effect));
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
	if (Object.hasOwn(input, "buttons"))
		input.buttons = ["..."];
	if (Object.hasOwn(input, "attacks"))
		input.attacks = ["..."];
	return input;
};
</script>

<template>
	<details v-if="currentEffect">
		<summary> Show effect as JSON</summary>
		<div>
			{{ sanitizedEffect(currentEffect) }}
		</div>
	</details>
</template>

<style scoped>
div {
	white-space: pre;
	max-width: 100%;
	text-wrap: wrap;
	font-family: monospace;
}

summary {
	font-size: smaller;
}
</style>
