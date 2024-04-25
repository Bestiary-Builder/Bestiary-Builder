<template>
	<LabelledComponent :title="title" :id="id">
		<slot></slot>
		<div class="quantity">
			<input ref="input" type="number" :name="title" :value="isNaN(value) ? '' : value" :min="minimum" :max="maximum" :step="isSteppable ? 'any' : step" inputmode="numeric" :id="title.toLowerCase().replaceAll(' ', '') + id" @change="change" :placeholder="placeholder" />
			<div class="quantity-nav">
				<div class="quantity-button quantity-up" @click.prevent="increase" :aria-label="`Increase ${title} by ${isSteppable ? '1 step':step}`">+</div>
				<div class="quantity-button quantity-down" @click.prevent="decrease" :aria-label="`Decrease ${title} by ${isSteppable ? '1 step':step}`">-</div>
			</div>
			<span v-if="isClearable" class="delete-button" @click="clear" :aria-label="`Clear override of ${title}`"><font-awesome-icon :icon="['fas', 'trash']" /></span>
		</div>
	</LabelledComponent>
</template>

<script lang="ts">
import {defineComponent, type Prop, type PropType} from "vue";
import LabelledComponent from "./LabelledComponent.vue";
const isNaN = Number.isNaN || window.isNaN;
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
			default: Infinity
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
			type: Number as PropType<Number | null>,
			default: NaN
		},
		steps: {
			type: Array as PropType<number[] | null>,
			required: false,
			default: null
		}
	},
	emits: ["update:modelValue"],
	data() {
		return {
			value: NaN as any,
			id: this.$.uid
		};
	},
	methods: {
		isNaN,
		change(event: any) {
			this.setValue(event?.target.value);
		},
		decrease() {
			if (this.decreasable) {
				let {value} = this;
				if (value == null) {
					this.setValue(0);
					return;
				}

				if (isNaN(value)) {
					value = 0;
				}

				const newValue = this.isSteppable ? this.steps![this.steps!.indexOf(this.nearestStepDown)-1] : value-this.step

				this.setValue(newValue)
			}
		},
		increase() {
			if (this.increasable) {
				let {value} = this;
				if (value == null) {
					this.setValue(0);
					return;
				}
				if (isNaN(value)) {
					value = 0;
				}
			
				const newValue = this.isSteppable ? this.steps![this.steps!.indexOf(this.nearestStepUp)+1] : value+this.step

				this.setValue(newValue)
			}
		},
		setValue(value: number | null) {
			if (value == null) {
				const oldValue = this.value;
				let newValue = null;
				this.value = newValue;
				this.$emit("update:modelValue", newValue, oldValue);
				return;
			}

			const oldValue = this.value;
			let newValue = typeof value !== "number" ? parseFloat(value) : value;

			if (!isNaN(newValue)) {
				if (this.minimum <= this.maximum) {
					newValue = Math.min(this.maximum, Math.max(this.minimum, newValue));
				}
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
	},
	computed: {
		increasable(): boolean {
			if (this.value == null) return true;
			return isNaN(this.value) || this.value < this.maximum;
		},
		decreasable(): boolean {
			if (this.value == null) return true;
			return isNaN(this.value) || this.value > this.minimum;
		},
		isSteppable(): boolean{
			return this.steps != null && this.steps.length > 0
		},
		minimum(): number{
			if (this.isSteppable){
				return this.steps![0]
			} else {
				return this.min
			}
		},
		maximum(): number{
			if (this.isSteppable){
				return this.steps![this.steps!.length-1]
			} else {
				return this.max
			}
		},
		nearestStepDown(): number{
			if (!this.isSteppable) return this.step

			let minimumDifference = Math.abs(this.value - this.steps![0])
			let nearestValue = this.value

			for (const step of this.steps!){
				const difference = Math.abs(this.value - step)
				if (difference <= minimumDifference){
					minimumDifference = difference
					nearestValue = step
				}
			}

			return nearestValue
		},
		nearestStepUp(): number{
			if (!this.isSteppable) return this.step

			let minimumDifference = Math.abs(this.value - this.steps![0])
			let nearestValue = this.value

			for (const step of this.steps!){
				const difference = Math.abs(this.value - step)
				if (difference < minimumDifference){
					minimumDifference = difference
					nearestValue = step
				}
			}

			return nearestValue
		},
		placeholder(): string {
			if (this.isClearable) return "Override";
			return "";
		}
	},
	watch: {
		modelValue: {
			immediate: true,
			handler(newValue, oldValue) {
				if (
					// Avoid triggering change event when created
					!(isNaN(newValue) && typeof oldValue === "undefined") &&
					// Avoid infinite loop
					newValue !== this.value
				) {
					this.setValue(newValue);
				}
			}
		}
	}
});
</script>

<style scoped lang="less">
@import url("@/assets/styles/number-input.less");
</style>
