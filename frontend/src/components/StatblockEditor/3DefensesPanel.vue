<script setup lang="ts">
import type { Statblock } from "~/shared";
import { conditionList, resistanceList } from "@/utils/constants";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";

const { data } = defineProps<{ data: Statblock }>();
</script>

<template>
	<div id="tabpanel-4" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0"
		aria-labelledby="tab-4">
		<div class="editor-field__container three-wide">
			<v-number-input v-model="data.defenses.hp.numOfHitDie" label="Hit Die Number" :min="0" />
			<v-number-input v-model="data.defenses.hp.sizeOfHitDie" label="Hit Die Size" :min="1" :step="2" />
			<v-number-input v-model="data.defenses.hp.override" label="HP Override" :min="0" clearable />
		</div>
		<div class="editor-field__container two-wide">
			<v-number-input v-model="data.defenses.ac.ac" label="Armor Class" :min="0" />
			<v-text-field v-model="data.defenses.ac.acSource" label="Armor source" />
		</div>

		<SectionHeader title="Resistances" />
		<div class="editor-field__container two-wide">
			<div>
				<v-select v-model="data.defenses.vulnerabilities" label="Vulnerabilities" multiple chips closable-chips
					:items="resistanceList" />
			</div>
			<div>
				<v-select v-model="data.defenses.resistances" label="Resistances" multiple chips closable-chips
					:items="resistanceList" />
			</div>
			<div>
				<v-select v-model="data.defenses.immunities" label="Immunities" multiple chips closable-chips
					:items="resistanceList" />
			</div>
			<div>
				<v-select v-model="data.defenses.conditionImmunities" label="Condition Immunities" multiple chips closable-chips
					:items="conditionList" />
			</div>
		</div>
	</div>
</template>

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
