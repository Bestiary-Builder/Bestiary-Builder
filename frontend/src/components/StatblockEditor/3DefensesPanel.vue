<script setup lang="ts">
import type { Statblock } from "~/shared";
import { conditionList, resistanceList } from "@/utils/constants";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";

const { data } = defineProps<{ data: Statblock }>();

const resistanceIcons: Record<string, string> = {
	Acid: 'game-icons:acid',
	Bludgeoning: 'game-icons:flat-hammer',
	Cold: 'game-icons:snowflake-1',
	Fire: 'mdi:fire',
	Force: 'game-icons:magic-swirl',
	Lightning: 'mdi:lightning-bolt',
	Necrotic: 'game-icons:skull-crack',
	Piercing: 'game-icons:striking-arrows',
	Poison: 'game-icons:poison-bottle',
	Psychic: 'game-icons:psychic-waves',
	Radiant: 'game-icons:sun-radiations',
	Slashing: 'game-icons:broadsword',
	Thunder: 'game-icons:mine-explosion'
}

const conditionIcons: Record<string, string> = {
	"Blinded": 'mdi:eye-off',
	"Charmed": 'game-icons:charm',
	"Deafened": 'mdi:volume-off',
	"Disease": 'game-icons:first-aid-kit',
	"Exhaustion": 'game-icons:night-sleep',
	"Frightened": 'game-icons:run',
	"Grappled": 'game-icons:fist',
	"Incapacitated": 'mdi:close',
	"Invisible": 'game-icons:invisible',
	"Paralyzed": 'game-icons:star-swirl',
	"Petrified": 'game-icons:rock',
	"Poisoned": 'game-icons:poison-bottle',
	"Prone": 'pinhead:person-falling',
	"Restrained": 'mdi:handcuffs',
	"Stunned": 'game-icons:sparkles',
	"Unconscious": 'game-icons:knockout',
}
</script>

<template>
	<div>
		<SectionHeader title="HP & AC" />
		<v-row class="mt-4" density="comfortable">
			<v-col cols="4">
				<v-number-input v-model="data.defenses.hp.numOfHitDie" label="Hit Die Number" :min="0" />
			</v-col>
			<v-col cols="4">
				<v-number-input v-model="data.defenses.hp.sizeOfHitDie" label="Hit Die Size" :min="1" :step="2" />
			</v-col>
			<v-col cols="4">
				<v-number-input v-model="data.defenses.hp.override" label="HP Override" :min="0" clearable />
			</v-col>
			<v-col cols="6">
				<v-number-input v-model="data.defenses.ac.ac" label="Armor Class" :min="0" />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="data.defenses.ac.acSource" label="Armor source" />
			</v-col>
		</v-row>
		<SectionHeader title="Resistances" />
		<v-row class="mt-4" density="comfortable">
			<v-col cols="6">
				<v-combobox v-model="data.defenses.vulnerabilities" label="Vulnerabilities" multiple chips
					closable-chips :items="resistanceList" hint="Supports custom input" persistent-hint
					:item-props="(item) => ({ prependIcon: resistanceIcons[item], style: '--v-list-prepend-gap: 2px' })">

				</v-combobox>
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.defenses.resistances" label="Resistances" multiple chips closable-chips
					:items="resistanceList" hint="Supports custom input" persistent-hint
					:item-props="(item) => ({ prependIcon: resistanceIcons[item], style: '--v-list-prepend-gap: 2px' })" />
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.defenses.immunities" label="Immunities" multiple chips closable-chips
					:items="resistanceList" hint="Supports custom input" persistent-hint
					:item-props="(item) => ({ prependIcon: resistanceIcons[item], style: '--v-list-prepend-gap: 2px' })" />
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.defenses.conditionImmunities" label="Condition Immunities" multiple chips
					closable-chips :items="conditionList" hint="Supports custom input" persistent-hint
					:item-props="(item) => ({ prependIcon: conditionIcons[item], style: '--v-list-prepend-gap: 2px' })" />
			</v-col>
		</v-row>
	</div>
</template>
<style scoped>
:deep(.v-list-item__prepend > .v-icon) {
	margin-inline-end: 0px !important;
}

:deep(.v-list-item__spacer) {
	width: 4px !important;
}
</style>