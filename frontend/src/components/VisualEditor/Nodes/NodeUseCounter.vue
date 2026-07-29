<script setup lang="ts">
import type { Ref } from "vue";
import type { AbilityReference, Counter, SpellSlotReference } from "~/shared";
import { inject, onMounted, ref, watch } from "vue";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import { useFetch } from "@/utils/utils";
import IntExpression from "./shared/IntExpression.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<Counter>>("currentEffect");

const counterType = ref<"cc" | "abi" | "ss">("cc");

watch(counterType, (newValue: string) => {
	if (newValue === "cc")
		currentEffect!.value.counter = "";
	else if (newValue === "ss")
		currentEffect!.value.counter = { slot: 1 };
	else if (newValue === "abi")
		currentEffect!.value.counter = { id: 0, typeId: 0 };
});

onMounted(() => {
	const counter = currentEffect?.value.counter
	if (typeof(counter) === "string") {
		counterType.value = "cc"
	} else if (typeof(counter) === "object" && Object.hasOwn(counter, "slot")) {
		counterType.value = "ss"
	} else if (typeof(counter) === "object" && Object.hasOwn(counter, "id") && Object.hasOwn(counter, "typeId")) {
		counterType.value = "abi"
	}
})

if (!Object.hasOwn(currentEffect!.value, "errorBehaviour"))
	currentEffect!.value.errorBehaviour = "warn";

watch(() => currentEffect!.value?.errorBehaviour, () => {
	if (currentEffect!.value?.errorBehaviour === "warn")
		delete currentEffect!.value.errorBehaviour;
});

const limitedUse = ref();

type ApiAbility = AbilityReference & { type: string; name: string };
onMounted(async () => {
	const { data } = await useFetch<{ success: boolean; data: ApiAbility[] }>("https://api.avrae.io/gamedata/limiteduse");
	if (!data)
		return;
	limitedUse.value = data.data.filter(x => x.type === "Limited Use");
});

useDataCleanup(currentEffect, ["allowOverflow", "fixedValue"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Use Counter" />
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
			<LabelledComponent v-if="typeof (currentEffect.counter) === 'string'" title="Counter Name*" for="counterName">
				<input id="counterName" v-model="currentEffect.counter" type="text">
				<small style="font-size: x-small"> Leave empty and set Error Behaviour to <i>Ignore</i> to take arbitrary <code>-amt #</code> input.</small>
			</LabelledComponent>
			<LabelledComponent v-else-if="typeof (currentEffect!.counter) === 'object' && Object.hasOwn(currentEffect!.counter, 'slot')" title="Slot Level*" for="slotLevel">
				<div class="input-wrapper">
					<input id="slotLevel" v-model="(currentEffect.counter as SpellSlotReference).slot" type="text" :class="{ required: (currentEffect.counter as SpellSlotReference).slot.toString().length === 0 }"> <IntExpression />
				</div>
			</LabelledComponent>
			<LabelledComponent v-else-if="typeof (currentEffect!.counter) === 'object' && Object.hasOwn(currentEffect!.counter, 'id') && Object.hasOwn(currentEffect!.counter, 'typeId')" title="Ability Reference" for="abilityReference">
				<v-select v-model="currentEffect.counter" :options="limitedUse" label="name" input-id="text" :reduce="(x : any) => ({ id: x.id, typeId: x.typeId })" />
			</LabelledComponent>
			<span v-else> Something went wrong with this node. Please delete it and recreate the counter node.</span>
			<LabelledComponent title="Amount" for="amount">
				<div class="input-wrapper">
					<input id="amount" v-model="currentEffect.amount" type="text"><IntExpression />
				</div>
			</LabelledComponent>
		</div>

		<hr>
		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="Allow Overflow" for="allowOverflow">
				<span><input id="allowOverflow" v-model="currentEffect.allowOverflow" type="checkbox"> <label for="allowOverflow"> If False, attempting to overflow/underflow a counter (i.e. use more charges than available or add charges exceeding max) will error instead of clipping to bounds. </label> </span>
			</LabelledComponent>
			<LabelledComponent title="Fixed value" for="fixedValue">
				<span> <input id="fixedValue" v-model="currentEffect.fixedValue" type="checkbox"> <label for="fixedValue"> Whether this counter should ignore the <span style="display: inline-block">-amt</span> argument.</label> </span>
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
@import url("./styles/automation-editor.less");
</style>
