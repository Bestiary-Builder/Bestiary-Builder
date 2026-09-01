<script setup lang="ts">
import type { Ref } from "vue";
import type { AbilityReference, Counter, SpellSlotReference } from "~/shared";
import { inject, onMounted, ref, watch } from "vue";
import { useRules } from "vuetify/labs/rules";
import { useFetch } from "@/utils/utils";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import TypeHintedEditor from "@/components/FormInputs/TypeHintedEditor.vue";

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
	const counter = currentEffect?.value.counter;
	if (typeof (counter) === "string") {
		counterType.value = "cc";
	}
	else if (typeof (counter) === "object" && Object.hasOwn(counter, "slot")) {
		counterType.value = "ss";
	}
	else if (typeof (counter) === "object" && Object.hasOwn(counter, "id") && Object.hasOwn(counter, "typeId")) {
		counterType.value = "abi";
	}
});

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

const rules = useRules();
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Use Counter" />
		<div class="two-wide">
			<div>
				<v-select v-model="counterType" label="Counter Type" title="Error Behaviour" :items="[
					{ title: 'Custom Counter', value: 'cc' },
					{ title: 'Spell Slot', value: 'ss' },
					{ title: 'Ability', value: 'abi' },
				]" />
			</div>

			<div v-if="typeof (currentEffect.counter) === 'string'">
				<v-text-field v-model="currentEffect.counter" label="Counter Name"
					hint="Leave empty and set Error Behaviour to Ignore to takearbitrary -amt # input. "
					persistent-hint />
			</div>
			<div
				v-else-if="typeof (currentEffect!.counter) === 'object' && Object.hasOwn(currentEffect!.counter, 'slot')">
				<v-text-field v-model="(currentEffect.counter as SpellSlotReference).slot" label="Slot Level"
					:rules="[rules.required()]" hint="IntExpression" />
			</div>
			<v-select
				v-else-if="typeof (currentEffect!.counter) === 'object' && Object.hasOwn(currentEffect!.counter, 'id') && Object.hasOwn(currentEffect!.counter, 'typeId')"
				v-model="currentEffect.counter" label="Ability Reference" :items="limitedUse" item-title="name"
				:item-value="(x: any) => ({ id: x.id, typeId: x.typeId })" return-object />
			<span v-else> Something went wrong with this node. Please delete it and recreate the counter node.</span>
			<div>
				<TypeHintedEditor v-model="currentEffect.amount" label="Amount" />
			</div>
		</div>

		<SectionHeader title="Additional Options" />
		<v-row>
			<v-col cols="6">
				<v-select v-model="currentEffect.errorBehaviour" label="Error Behaviour" title="Error Behaviour" :items="[
					{ title: 'Warn', value: 'warn' },
					{ title: 'Raise', value: 'raise' },
					{ title: 'Ignore', value: 'ignore' },
				]" />
			</v-col>
			<v-col cols="6">
				<v-checkbox v-model="currentEffect.allowOverflow"
					label="If True, attempting to overflow/underflow a counter (i.e. use more charges than available or add charges exceeding max) will clip to bounds rather than error."
					hide-details />
			</v-col>
			<v-col cols="6">
				<v-checkbox v-model="currentEffect.fixedValue"
					label="Whether this counter should ignore the -amt argument." hide-details />
			</v-col>
		</v-row>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
