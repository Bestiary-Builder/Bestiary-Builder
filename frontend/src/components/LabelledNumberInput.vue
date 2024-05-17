<script lang="ts">
import { type PropType, defineComponent } from "vue";
import LabelledComponent from "./LabelledComponent.vue";

const isNaN = Number.isNaN;
export default defineComponent({
	components: {
		LabelledComponent
	},
	props: {
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
	},
	emits: ["update:modelValue"],
	data() {
		return {
			value: Number.NaN as any,
		};
	},
	computed: {
		increasable(): boolean {
			if (this.value == null)
				return true;
			return isNaN(this.value) || this.value < this.max;
		},

		decreasable(): boolean {
			if (this.value == null)
				return true;
			return isNaN(this.value) || this.value > this.min;
		},
		placeholder(): string {
			if (this.isClearable)
				return "Override";
			return "";
		}
	},
	watch: {
		modelValue: {
			immediate: true,
			handler(newValue, oldValue) {
				if (
					// Avoid triggering change event when created
					!(isNaN(newValue) && typeof oldValue === "undefined")
					// Avoid infinite loop
					&& newValue !== this.value
				)
					this.setValue(newValue);
			}
		}
	},
	methods: {
		isNaN,
		change(event: any) {
			this.setValue(event?.target.value);
		},
		decrease() {
			if (this.decreasable) {
				let { value } = this;
				if (value == null) {
					this.setValue(0);
					return;
				}

				if (isNaN(value))
					value = 0;

				this.setValue(value - this.step);
			}
		},
		increase() {
			if (this.increasable) {
				let { value } = this;
				if (value == null) {
					this.setValue(0);
					return;
				}
				if (isNaN(value))
					value = 0;

				this.setValue(value + this.step);
			}
		},
		setValue(value: number | null) {
			if (value == null) {
				const oldValue = this.value;
				const newValue = null;
				this.value = newValue;
				this.$emit("update:modelValue", newValue, oldValue);
				return;
			}

			const oldValue = this.value;
			let newValue = typeof value !== "number" ? Number.parseFloat(value) : value;

			if (!isNaN(newValue)) {
				if (this.min <= this.max)
					newValue = Math.min(this.max, Math.max(this.min, newValue));
			}

			this.value = newValue;

			if (newValue === oldValue) {
				// Force to override the number in the input box (#13).
				(this.$refs.input as HTMLInputElement).value = String(newValue);
			}

			this.$emit("update:modelValue", newValue, oldValue);
		},
		clear() {
			this.setValue(null);
		}
	}
});
</script>

<template>
	<LabelledComponent :title="title" :for="labelId">
		<slot />
		<div class="quantity">
			<input :id="labelId" ref="input" type="number" :name="title" :value="isNaN(value) ? '' : value" :min="min" :max="max" :step="step" inputmode="numeric">
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
