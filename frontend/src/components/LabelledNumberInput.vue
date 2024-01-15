<template>
<LabelledComponent :title="title" :id="id">
    <slot></slot>
    <div class="quantity">
        <input 
            ref="input"
            type="number"
            :name="title"
            :value="isNaN(value) ? '' : value" 
            :min="min" 
            :max="max" 
            :step="step"
            inputmode="numeric" 
            :id="title.toLowerCase().replaceAll(' ', '')+id" 
            @change="change"
            :placeholder="placeholder"
        />
        <div class="quantity-nav">
            <div class="quantity-button quantity-up" @click.prevent="increase" :aria-label="`Increase ${title} by ${step}`">+</div>
            <div class="quantity-button quantity-down" @click.prevent="decrease" :aria-label="`Decrease ${title} by ${step}`">-</div>
        </div>
        <span v-if="isClearable" class="delete-button" @click="clear" :aria-label="`Clear override of ${title}`"><font-awesome-icon :icon="['fas', 'trash']" /></span>
    </div>
</LabelledComponent>
</template>

<script lang="ts">
import { defineComponent, type Prop, type PropType } from 'vue';
import LabelledComponent from './LabelledComponent.vue';
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
        }
    },
    emits: [
        'update:modelValue',
    ],
    data() {
        return {
            value: NaN as any,
            id: this.$.uid
        }
    },
    methods: {
        isNaN,
        change(event: any) {
            this.setValue(event?.target.value)
        },
        decrease() {
            if (this.decreasable) {
                let { value } = this;
                if (value == null) {
                    this.setValue(0)
                    return;
                }

                if (isNaN(value)) {
                    value = 0;
                }

                this.setValue(value - this.step);
            }
        },
        increase() {
            if (this.increasable) {
                let { value } = this;
                if (value == null) {
                    this.setValue(0)
                    return;
                }
                if (isNaN(value)) {
                value = 0;
                }

                this.setValue(value + this.step);
            }
        },
        setValue(value: number | null) {
            if (value == null) {
                const oldValue = this.value;
                let newValue = null
                this.value = newValue
                this.$emit('update:modelValue', newValue, oldValue);
                return;
            }

            const oldValue = this.value;
            let newValue = typeof value !== 'number' ? parseFloat(value) : value;

            if (!isNaN(newValue)) {
                if (this.min <= this.max) {
                    newValue = Math.min(this.max, Math.max(this.min, newValue));
                }
            }

            this.value = newValue;

            if (newValue === oldValue) {
                // Force to override the number in the input box (#13).
                (this.$refs.input as HTMLInputElement).value = String(newValue);
            }

            this.$emit('update:modelValue', newValue, oldValue);
        },
        clear() {
            this.setValue(null)
        }
    },
    computed: {
        increasable(): boolean {
            if (this.value == null) return true
            return isNaN(this.value) || this.value < this.max;
        },

        decreasable(): boolean {
            if (this.value == null) return true
            return isNaN(this.value) || this.value > this.min;
        },
        placeholder() : string {
            if (this.isClearable) return "Override"
            return ""
        }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newValue, oldValue) {
        if (
          // Avoid triggering change event when created
          !(isNaN(newValue) && typeof oldValue === 'undefined')

          // Avoid infinite loop
          && newValue !== this.value
        ) {
          this.setValue(newValue);
        }
      },
    },
  },
})

</script>

<style scoped lang="less">
@import url("@/assets/number-input.less");
</style>