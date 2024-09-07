<script setup lang="ts">
import { type Ref, inject, ref, watch } from "vue";
import IntExpression from "./shared/IntExpression.vue";
import { useDataCleanup } from "./shared/utils";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { Counter, SpellSlotReference } from "~/shared";

const currentEffect = inject<Ref<Counter>>("currentEffect");
const _currentContext = inject<Ref<string[]>>("currentContext");

const counterType = ref("cc");

watch(counterType, (newValue: string) => {
	if (newValue === "cc")
		currentEffect!.value.counter = "";
	  else if (newValue === "ss")
		currentEffect!.value.counter = { slot: 1 };
	else if (newValue === "abi")
		currentEffect!.value.counter = { id: 0, typeId: 0 };
}, { immediate: true });

if (!Object.hasOwn(currentEffect!.value, "errorBehaviour"))
	currentEffect!.value.errorBehaviour = "warn";

watch(() => currentEffect!.value?.errorBehaviour, () => {
	if (currentEffect!.value?.errorBehaviour === "warn")
		delete currentEffect!.value.errorBehaviour;
});

useDataCleanup(currentEffect, ["allowOverflow", "fixedValue"]);
</script>

<template>
	<template v-if="currentEffect">
		<h3> Use Counter Node</h3>
		<div class="two-wide">
			<LabelledComponent title="Counter Type" for="counterType">
				<select id="counterType" v-model="counterType" title="Error Behaviour" class="ghost">
					<option value="cc">
						Custom Counter
					</option>
					<option value="ss">
						Spell Slot
					</option>
					<option value="abi">
						Ability
					</option>
				</select>
			</LabelledComponent>
			<LabelledComponent v-if="counterType === 'cc' " title="Counter Name*" for="counterName">
				<input id="counterName" v-model="currentEffect.counter" type="text" :class="{ required: (currentEffect.counter as string).length === 0 }">
			</LabelledComponent>
			<LabelledComponent v-if="counterType === 'ss' " title="Slot Level*" for="slotLevel">
				<div class="input-wrapper">
					<input id="slotLevel" v-model="(currentEffect.counter as SpellSlotReference).slot" type="text" :class="{ required: (currentEffect.counter as SpellSlotReference).slot.toString().length === 0 }"> <IntExpression />
				</div>
			</LabelledComponent>
			<LabelledComponent v-if="counterType === 'abi' " title="Ability Reference" for="abilityReference">
				<span style="color: var(--color-destructive)"> Ability Reference is not implemented in this editor.</span>
			</LabelledComponent>
			<LabelledComponent v-if="counterType !== 'abi'" title="Amount" for="amount">
				<div class="input-wrapper">
					<input id="amount" v-model="currentEffect.amount" type="text"><IntExpression />
				</div>
			</LabelledComponent>
		</div>

		<hr>
		<h4> Additional Options</h4>
		<div class="two-wide">
			<LabelledComponent title="Allow Overflow" for="allowOverflow">
				<span><input id="allowOverflow" v-model="currentEffect.allowOverflow" type="checkbox"> <label for="allowOverflow"> If False, attempting to overflow/underflow a counter (i.e. use more charges than available or add charges exceeding max) will error instead of clipping to bounds. </label> </span>
			</LabelledComponent>
			<LabelledComponent title="Fixed value" for="fixedValue">
				<span> <input id="fixedValue" v-model="currentEffect.fixedValue" type="checkbox"> <label for="fixedValue"> Whether this roll should ignore the <span style="display: inline-block">-d</span> argument and damage bonus effects.</label> </span>
			</LabelledComponent>
			<LabelledComponent title="Error Behaviour" for="error">
				<select id="error" v-model="currentEffect.errorBehaviour" title="Error Behaviour" class="ghost">
					<option value="warn">
						Warn
					</option>
					<option value="raise">
						Raise
					</option>
					<option value="ignore">
						Ignore
					</option>
				</select>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
