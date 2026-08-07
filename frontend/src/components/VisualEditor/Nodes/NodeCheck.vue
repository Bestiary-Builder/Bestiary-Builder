<script setup lang="ts">
import type { Ref } from "vue";
import type { Check, } from "~/shared";
import { inject } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<Check>>("currentEffect");

const skills = ["acrobatics", "animalHandling", "arcana", "athletics", "deception", "history", "initiative", "insight", "intimidation", "investigation", "medicine", "nature", "perception", "performance", "persuasion", "religion", "sleightOfHand", "stealth", "survival", "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
useDataCleanup(currentEffect, ["dc", "contestTie", "contestAbility", "adv"]);
if (currentEffect?.value.ability.length === 0)
	currentEffect.value.ability.push("athletics");

const contestDcWarning = (): boolean | string => {
	const hasContestAbility = (currentEffect!.value?.contestAbility?.length ?? 0) > 0
	const hasDc = (currentEffect!.value?.dc?.length ?? 0) > 0

	if (hasContestAbility && hasDc)
		return "Warning: You cannot both have a DC and a contest ability"

	return true
}
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Ability Check" />
		<div class="two-wide">
			<v-select v-model="currentEffect.ability" label="Ability" :items="skills" item-title="label" multiple
				:clearable="false" chips closable-chips />
			<v-select v-model="currentEffect.contestAbility" label="Contest Ability" :items="skills" item-title="label"
				multiple chips closable-chips :rules="[contestDcWarning]" persistent-hint />
		</div>

		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<div>
				<v-text-field v-model="currentEffect.dc" label="DC (optional)" :rules="[contestDcWarning]"
					hint="IntExpression" />
			</div>
			<v-select v-model="currentEffect.contestTie" label="Contest Tie Behaviour (optional)" title="Contest Tie"
				:items="[
					{ title: 'Success (default)', value: 'success' },
					{ title: 'Fail', value: 'fail' },
					{ title: 'Neither', value: 'neither' },
				]" />
			<v-select v-model="currentEffect.adv" label="Advantage (optional)" title="Advantage" :items="[
				{ title: 'Flat', value: 0 },
				{ title: 'Advantage', value: 1 },
				{ title: 'Disadvantage', value: -1 },
			]" />
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
