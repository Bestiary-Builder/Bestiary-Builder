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
	label: {
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
}, { immediate: true });

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

		setValue(value.value - 1);
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

		setValue(value.value + 1);
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
	<div class="quantity" :class="{ clearable: isClearable }">
		<div class="quantity-button" :aria-label="`Decrease ${label}`" @click.prevent="decrease">
			<font-awesome-icon :icon="['fa', 'minus']" />
		</div>
		<input :id="labelId" ref="input" :value="isNaN(value) ? '' : value" type="number" :name="label" :min="min" :max="max" inputmode="numeric" @change="change">
		<div class="quantity-button" :aria-label="`Increase ${label}`" @click.prevent="increase">
			<font-awesome-icon :icon="['fa', 'plus']" />
		</div>
		<div v-if="isClearable" class="quantity-button">
			<font-awesome-icon :icon="['fas', 'eraser']" @click="clear" />
		</div>
	</div>
</template>

<style scoped lang="less">
.quantity {
	grid-template-columns: 1fr 2fr 1fr;
	display: grid;
	&.clearable {
		grid-template-columns: 1fr 2fr 1fr 1fr;
	}
}

.quantity input {
	background-color: var(--color-surface-0);
	width: 100%;
	height: 32px;
	line-height: 1.25;
	font-size: 0.9rem;
	display: block;
	text-align: center;
	padding: 0;
	margin: auto;
	border: 1px solid rgb(60, 63, 68);
	color: white;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

input[type="number"] {
	-moz-appearance: textfield;
	appearance: textfield;
}

.quantity-button {
	margin: auto;
	font-size: 0.8em;
}
</style>
