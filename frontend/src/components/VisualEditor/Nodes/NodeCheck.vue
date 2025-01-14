<script setup lang="ts">
import { type Ref, inject } from "vue";
import HigherLevels from "./shared/HigherLevels.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import AnnotatedString from "./shared/AnnotatedString.vue";
import { useDataCleanup } from "./shared/utils";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { Check, } from "~/shared";

const currentEffect = inject<Ref<Check>>("currentEffect");

const skills = ["acrobatics", "animalHandling", "arcana", "athletics", "deception", "history", "initiative", "insight", "intimidation", "investigation", "medicine", "nature", "perception", "performance", "persuasion", "religion", "sleightOfHand", "stealth", "survival", "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
useDataCleanup(currentEffect, ["dc", "contestTie", "contestAbility", "adv"]);
if (currentEffect?.value.ability.length === 0) {
	currentEffect.value.ability.push("athletics");
}
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Ability Check" />
		<div class="two-wide">
			<LabelledComponent title="Ability" for="check">
				<v-select v-model="currentEffect.ability" multiple :options="skills" input-id="check" label="label" :clearable="false" />
			</LabelledComponent>
			<LabelledComponent title="Contest Ability" for="contestCheck">
				<v-select v-model="currentEffect.contestAbility" multiple :options="skills" input-id="contestCheck" label="label" />
			</LabelledComponent>
		</div>

		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="DC" for="dc">
				<div class="input-wrapper">
					<input id="dc" v-model="currentEffect.dc" type="text" placeholder="DC (Optional)"><IntExpression />
				</div>
			</LabelledComponent>
			<LabelledComponent title="Contest Tie" for="contestTie">
				<select id="contestTie" v-model="currentEffect.contestTie" title="Contest Tie" class="ghost">
					<option value="success">
						Success (default)
					</option>
					<option value="fail">
						Fail
					</option>
					<option value="neither">
						Neither
					</option>
				</select>
			</LabelledComponent>
			<LabelledComponent title="Advantage" for="advantage">
				<select id="sortTargetBy" v-model="currentEffect.adv" placeholder="Advantage (optional)" title="Advantage" class="ghost">
					<option :value="0">
						Flat
					</option>
					<option :value="1">
						Advantage
					</option>
					<option :value="-1">
						Disadvantage
					</option>
				</select>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
