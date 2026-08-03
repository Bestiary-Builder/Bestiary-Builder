<script setup lang="ts">
import { computed } from "vue";

const { label } = defineProps<{ label: string }>();
const model = defineModel<number | null>();
const values = [
	0.125,
	0.25,
	0.5,
	...Array.from({ length: 30 }, (_, i) => i + 1),
];

const labels: Record<number, string> = {
	0.125: "1/8",
	0.25: "1/4",
	0.5: "1/2",
};

function formatValue(value: number) {
	return labels[value] ?? String(value);
}

const internalValue = computed<number | string | null>({
	// @ts-ignore
	get() {
		return model.value;
	},
	set(value: any) {
		if (value === null || value === "") {
			model.value = null;
			return;
		}

		const number = Number(value);

		model.value
			= Number.isFinite(number) && number >= 0
				? number
				: null;
	},
});

const rules = [
	(value: unknown) =>
		value === null || Number(value) >= 0 || "Must be zero or greater",
];
</script>

<template>
	<v-combobox
		v-model="internalValue" :items="values" :item-title="formatValue" :rules="rules"
		type="number" :label
	/>
</template>
