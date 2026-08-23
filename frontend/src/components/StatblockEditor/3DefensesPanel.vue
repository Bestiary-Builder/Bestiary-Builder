<script setup lang="ts">
import type { Statblock } from "~/shared";
import { conditionList, resistanceList } from "@/utils/constants";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";

const { data } = defineProps<{ data: Statblock }>();
</script>

<template>
	<div id="tabpanel-4" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0"
		aria-labelledby="tab-4">
		<v-row class="mt-4">
			<v-col>
				<v-number-input v-model="data.defenses.hp.numOfHitDie" label="Hit Die Number" :min="0" />
			</v-col>
			<v-col>
				<v-number-input v-model="data.defenses.hp.sizeOfHitDie" label="Hit Die Size" :min="1" :step="2" />
			</v-col>
			<v-col>
				<v-number-input v-model="data.defenses.hp.override" label="HP Override" :min="0" clearable />
			</v-col>
		</v-row>
		<v-row class="mt-4">
			<v-col>
				<v-number-input v-model="data.defenses.ac.ac" label="Armor Class" :min="0" />
			</v-col>
			<v-col>
				<v-text-field v-model="data.defenses.ac.acSource" label="Armor source" />

			</v-col>
		</v-row>
		<SectionHeader title="Resistances" />
		<v-row class="mt-4">
			<v-col cols="6">
				<v-combobox v-model="data.defenses.vulnerabilities" label="Vulnerabilities" multiple chips
					closable-chips :items="resistanceList" hint="Supports custom input" persistent-hint />
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.defenses.resistances" label="Resistances" multiple chips closable-chips
					:items="resistanceList" hint="Supports custom input" persistent-hint />
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.defenses.immunities" label="Immunities" multiple chips closable-chips
					:items="resistanceList" hint="Supports custom input" persistent-hint />
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.defenses.conditionImmunities" label="Condition Immunities" multiple chips
					closable-chips :items="conditionList" hint="Supports custom input" persistent-hint />
			</v-col>
		</v-row>
	</div>
</template>

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
