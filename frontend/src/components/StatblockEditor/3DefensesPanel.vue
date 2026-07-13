<script setup lang="ts">
import LabelledComponent from "../FormInputs/LabelledComponent.vue";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";
import LabelledNumberInput from "../FormInputs/LabelledNumberInput.vue";
import type { Statblock } from "~/shared";
import { conditionList, resistanceList } from "@/utils/constants";

const { data } = defineProps<{ data: Statblock }>();
</script>

<template>
	<div id="tabpanel-4" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-4">
		<div class="editor-field__container three-wide">
			<LabelledNumberInput v-model="data.defenses.hp.sizeOfHitDie" title="Hit Die Size" :step="2" label-id="hitDieSize" />
			<LabelledNumberInput v-model="data.defenses.hp.numOfHitDie" title="Hit Die Number" :step="1" label-id="hitDieNumber" />
			<LabelledNumberInput v-model="data.defenses.hp.override" title="HP Override" :step="1" :is-clearable="true" label-id="hpOverride" />
		</div>
		<div class="editor-field__container two-wide">
			<LabelledNumberInput v-model="data.defenses.ac.ac" title="Armor Class" :step="1" label-id="armorClass" />
			<LabelledComponent title="Armor Class source" for="armorclasssource">
				<input id="armorclasssource" v-model="data.defenses.ac.acSource" type="text">
			</LabelledComponent>
		</div>

		<SectionHeader title="Resistances" />
		<div class="editor-field__container two-wide">
			<LabelledComponent title="Vulnerabilities" takes-custom-text-input for="vulnerabilities">
				<v-select v-model="data.defenses.vulnerabilities" placeholder="Type vulnerabilities..." multiple :deselect-from-dropdown="true" :close-on-select="false" :options="resistanceList" :taggable="true" :push-tags="true" input-id="vulnerabilities" />
			</LabelledComponent>
			<LabelledComponent title="Resistances" takes-custom-text-input for="resistances">
				<v-select v-model="data.defenses.resistances" placeholder="Type resistances..." multiple :deselect-from-dropdown="true" :close-on-select="false" :options="resistanceList" :taggable="true" :push-tags="true" input-id="resistances" />
			</LabelledComponent>
			<LabelledComponent title="Immunities" takes-custom-text-input for="immunities">
				<v-select v-model="data.defenses.immunities" placeholder="Type immunities..." multiple :deselect-from-dropdown="true" :close-on-select="false" :options="resistanceList" :taggable="true" :push-tags="true" input-id="immunities" />
			</LabelledComponent>
			<LabelledComponent title="Condition Immunities" takes-custom-text-input for="conditionimmunities">
				<v-select
					v-model="data.defenses.conditionImmunities"
					placeholder="Type condition immunities..."
					multiple
					:deselect-from-dropdown="true"
					:close-on-select="false"
					:options="conditionList"
					:taggable="true"
					:push-tags="true"
					input-id="conditionimmunities"
				/>
			</LabelledComponent>
		</div>
	</div>
</template>

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
