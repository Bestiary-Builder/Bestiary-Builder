<script setup lang="ts">
import { type PropType, computed, ref, useTemplateRef, watch } from "vue";
import LabelledComponent from "./LabelledComponent.vue";

const props = defineProps({
	isClearable: {
		type: Boolean,
		required: false,
		default: false
	},
	min: {
		type: Number,
		default: 0
	},
	max: {
		type: Number,
		default: Number.POSITIVE_INFINITY
	},
	step: {
		type: Number,
		required: false,
		default: 5
	},
	title: {
		type: String,
		required: true
	},
	modelValue: {
		type: Number as PropType<number | null>,
		default: Number.NaN
	},
	labelId: {
		type: String,
		required: false,
		default: ""
	}
});
const emit = defineEmits(["update:modelValue"]);

const value = ref(Number.NaN as any);

watch(() => props.modelValue, (newValue, oldValue) => {
	if (
		// Avoid triggering change event when created
		!(Number.isNaN(newValue) && typeof oldValue === "undefined")
		// Avoid infinite loop
		&& newValue !== value.value
	)
		setValue(newValue);
});

const increasable = computed(() => {
	if (value.value == null)
		return true;
	return Number.isNaN(value.value) || value.value < props.max;
});

const decreasable = computed(() => {
	if (value.value == null)
		return true;
	return Number.isNaN(value.value) || value.value > props.min;
});

function change(event: any) {
	setValue(event?.target.value);
};
function decrease() {
	if (decreasable.value) {
		if (value.value == null) {
			setValue(0);
			return;
		}

		if (Number.isNaN(value))
			value.value = 0;

		setValue(value.value - props.step);
	}
};
function increase() {
	if (increasable.value) {
		if (value.value == null) {
			setValue(0);
			return;
		}
		if (Number.isNaN(value))
			value.value = 0;

		setValue(value.value + props.step);
	}
};
const inputRef = useTemplateRef("input");
function setValue(v: number | null) {
	if (v == null) {
		const oldValue = value.value;
		const newValue = null;
		value.value = newValue;
		emit("update:modelValue", newValue, oldValue);
		return;
	}

	const oldValue = value.value;
	let newValue = typeof v !== "number" ? Number.parseFloat(v) : v;

	if (!Number.isNaN(newValue)) {
		if (props.min <= props.max)
			newValue = Math.min(props.max, Math.max(props.min, newValue));
	}

	value.value = newValue;

	if (newValue === oldValue) {
		// Force to override the number in the input box (#13).
		inputRef.value!.value = String(newValue);
	}

	emit("update:modelValue", newValue, oldValue);
};
function clear() {
	setValue(null);
};
</script>

<template>
	<LabelledComponent :title="title" :for="labelId">
		<slot />
		<div class="quantity">
			<input :id="labelId" ref="input" :value="isNaN(value) ? '' : value" type="number" :name="title" :min="min" :max="max" :step="step" inputmode="numeric" @change="change">
			<div class="quantity-nav">
				<div class="quantity-button quantity-up" :aria-label="`Increase ${title} by ${step}`" @click.prevent="increase">
					+
				</div>
				<div class="quantity-button quantity-down" :aria-label="`Decrease ${title} by ${step}`" @click.prevent="decrease">
					-
				</div>
			</div>
			<span v-if="isClearable" class="delete-button" :aria-label="`Clear override of ${title}`" @click="clear"><font-awesome-icon :icon="['fas', 'trash']" /></span>
		</div>
	</LabelledComponent>
</template>

<style scoped lang="less">
@import url("@/assets/styles/number-input.less");
</style>
