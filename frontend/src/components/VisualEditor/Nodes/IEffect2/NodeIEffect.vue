<script setup lang="ts">
import { type Ref, computed, inject, watch } from "vue";
import { useDataCleanup } from "../shared/utils";
import SectionHeader from "../shared/SectionHeader.vue";
import IntExpression from "../shared/IntExpression.vue";
import AnnotatedString from "../shared/AnnotatedString.vue";
import { PASSIVE_EFFECTS, type PassiveEffectDef } from "./passiveEffect";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { IEffect } from "~/shared";

const currentEffect = inject<Ref<IEffect>>("currentEffect");

const filteredPassiveEffects = computed(() => {
	if (!currentEffect?.value?.effects)
		return PASSIVE_EFFECTS;
	return PASSIVE_EFFECTS.filter(x => !Object.keys(currentEffect.value.effects as any).includes(x.value));
});

const addNewPassiveEffect = (effect: PassiveEffectDef) => {
	if (!currentEffect!.value.effects)
		currentEffect!.value.effects = {};
	if (effect.isList)
		// @ts-expect-error stupid
		currentEffect!.value.effects[effect.value] = [];

	else if (effect.type === "intexpression" || effect.type === "annotatedstring")
		// @ts-expect-error already checked for lists..
		currentEffect!.value.effects[effect.value] = "1";
};

const getEffectData = (value: string) => {
	for (const e of PASSIVE_EFFECTS) {
		if (e.value === value)
			return e;
	}
};

const getInputType = (value: string) => {
	const effect = getEffectData(value);
	if (!effect)
		return;
	if (effect.defaultOptions)
		return "list";
	if (effect.type === "annotatedstring")
		return "annotatedstring";
	if (effect.type === "intexpression")
		return "intexpression";
	return "list";
};
if (!currentEffect?.value.effects)
	currentEffect!.value.effects = {};

const addButton = () => {
	if (!currentEffect?.value?.buttons)
		currentEffect!.value.buttons = [];
	currentEffect!.value.buttons.push({ automation: [], label: "New Button" });
};
useDataCleanup(currentEffect, ["end", "tick_on_caster", "conc", "desc", "save_as", "parent", "target_self", "stacking"], { effects: PASSIVE_EFFECTS.map(x => x.value) });
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Initiative Effect" />
		<div class="two-wide">
			<LabelledComponent title="Name*" for="name">
				<div class="input-wrapper">
					<input id="name" v-model="currentEffect.name" type="text" :class="{ required: currentEffect.name.length === 0 }">
					<AnnotatedString />
				</div>
			</LabelledComponent>
		</div>
		<SectionHeader title="Duration Options" />
		<div class="two-wide">
			<LabelledComponent title="Duration" for="duration">
				<div class="input-wrapper">
					<input id="duration" v-model="currentEffect.duration" type="text"> <IntExpression />
				</div>
			</LabelledComponent>
			<LabelledComponent title="Ticks on End" for="end">
				<span><input id="end" v-model="currentEffect.end" type="checkbox"> <label for="end">Ticks on end of turn.</label>  </span>
			</LabelledComponent>
			<LabelledComponent title="Ticks on Caster" for="caster">
				<span><input id="caster" v-model="currentEffect.tick_on_caster" type="checkbox"> <label for="caster">Ticks on Caster rather than the Target.</label>  </span>
			</LabelledComponent>
			<LabelledComponent title="Requires concentration" for="conc">
				<span><input id="conc" v-model="currentEffect.conc" type="checkbox"> <label for="conc">Requires concentration.</label>  </span>
			</LabelledComponent>
		</div>
		<SectionHeader title="Passive Effects" />
		<LabelledComponent v-for="effect, key in currentEffect.effects" :key="key" :title="getEffectData(key)?.label || ''" :for="key" style="margin-top: 1rem">
			<div v-if="getInputType(key) !== 'list'" class="input-wrapper">
				<input :id="key" v-model="(currentEffect as any).effects[key]" type="text">
				<AnnotatedString v-if="getInputType(key) === 'annotatedstring'" />
				<IntExpression v-else />
			</div>
			<div v-else>
				<v-select
					v-model="(currentEffect as any).effects[key]"
					taggable
					:options="getEffectData(key)?.defaultOptions"
					:input-id="key"
					:multiple="getEffectData(key)?.isList"
					:reduce="(x: any) => x.value"
					:create-option="(x: string) => ({ label: x, value: x })"
				/>
			</div>
		</LabelledComponent>
		<LabelledComponent title="New Passive Effect" for="newPassiveEffect" style="margin-top: 1rem;" class="standout">
			<div class="two-wide">
				<v-select :options="filteredPassiveEffects" @option:selected="(e: PassiveEffectDef) => addNewPassiveEffect(e)" />
			</div>
		</LabelledComponent>
		<SectionHeader title="Buttons" />
		<div class="two-wide">
			<LabelledComponent title="New Button" for="addButton ">
				<button id="addButton" class="btn" @click="addButton()">
					Add a button
				</button>
				<small> Manage individual buttons by selecting them in the Effect Tree. </small>
			</LabelledComponent>
		</div>
		<SectionHeader title="Additional Options" />
		<LabelledComponent title="Description" for="text" style="margin-bottom: 1rem">
			<div class="input-wrapper">
				<textarea id="text" v-model="currentEffect.desc" rows="40" placeholder="Description" /><AnnotatedString />
			</div>
		</labelledcomponent>
		<div class="two-wide">
			<LabelledComponent title="Save As" for="saveAs">
				<input id="saveAs" v-model="currentEffect.save_as" type="text">
			</LabelledComponent>
			<LabelledComponent title="Parent" for="parent">
				<input id="parent" v-model="currentEffect.parent" type="text">
			</LabelledComponent>
			<LabelledComponent title="Effect Stacking" for="effectStacking">
				<span><input id="effectStacking" v-model="currentEffect.stacking" type="checkbox"> <label for="effectStacking">Ticks on end of turn.</label>  </span>
			</LabelledComponent>
			<LabelledComponent title="Target Self" for="targetSelf">
				<span><input id="targetSelf" v-model="currentEffect.target_self" type="checkbox"> <label for="end">Target Self</label>  </span>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../../assets/styles/automation-editor.less");

.standout {
	border-left: 2px dashed orangered;
	padding-left: 1rem;
}

textarea {
	min-height: 5rem;
}
</style>
