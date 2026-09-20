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

const dieSizes = [4, 6, 8, 10, 12, 20]
const stepUp = () => {
	const current = data.defenses.hp.sizeOfHitDie
	const currentIndex = dieSizes.findIndex((x) => x === current)
	if (currentIndex === -1) {
		if (data.defenses.hp.sizeOfHitDie % 2 === 1)
			data.defenses.hp.sizeOfHitDie += 1
		else
			data.defenses.hp.sizeOfHitDie += 2
	} else if (currentIndex === dieSizes.length - 1) {
		data.defenses.hp.sizeOfHitDie += 2
	} else {
		data.defenses.hp.sizeOfHitDie = dieSizes[currentIndex + 1]
	}
}

const stepDown = () => {
	const current = data.defenses.hp.sizeOfHitDie
	const currentIndex = dieSizes.findIndex((x) => x === current)
	if (currentIndex === -1) {
		data.defenses.hp.sizeOfHitDie = Math.max(1, data.defenses.hp.sizeOfHitDie - 2)
	} else if (currentIndex === 0) {
		data.defenses.hp.sizeOfHitDie = Math.max(1, data.defenses.hp.sizeOfHitDie - 2)
	} else {
		data.defenses.hp.sizeOfHitDie = dieSizes[currentIndex - 1]
	}
}
</script>

<template>
	<div>
		<SectionHeader title="HP & AC" />
		<v-row class="mt-4" density="comfortable">
			<v-col cols="4">
				<v-number-input v-model="data.defenses.hp.numOfHitDie" label="Hit Die Number" :min="0"
					prepend-inner-icon="mdi:pound" />
			</v-col>
			<v-col cols="4">
				<v-number-input v-model.number="data.defenses.hp.sizeOfHitDie" hide-details class="no-native-spinners"
					control-variant="hidden" label="Hit Die Size"
					:prepend-inner-icon="`mdi:dice-d${data.defenses.hp.sizeOfHitDie}`" :min="1">
					<template #append-inner>
						<v-divider vertical />
						<div class="stacked-controls">
							<v-btn icon="mdi:chevron-up" size="24" variant="text" density="compact" @click.stop="stepUp"
								:ripple="false" />
							<v-divider length="100%" />
							<v-btn icon="mdi:chevron-down" size="24" variant="text" density="compact"
								@click.stop="stepDown" :ripple="false" />
						</div>
					</template>
				</v-number-input>
			</v-col>
			<v-col cols="4">
				<v-number-input v-model="data.defenses.hp.override" label="HP Override" :min="0" clearable />
			</v-col>
			<v-col cols="6">
				<v-number-input v-model="data.defenses.ac.ac" label="Armor Class" :min="0"
					prepend-inner-icon="mdi:shield" />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="data.defenses.ac.acSource" label="Armor source"
					prepend-inner-icon="game-icons:fish-scales" />
			</v-col>
		</v-row>
		<SectionHeader title="Resistances" />
		<v-row class="mt-4" density="comfortable">
			<v-col cols="6">
				<v-combobox v-model="data.defenses.vulnerabilities" label="Vulnerabilities" multiple chips
					closable-chips :items="resistanceList" hint="Supports custom input" persistent-hint
					:item-props="(item) => ({ prependIcon: resistanceIcons[item], style: '--v-list-prepend-gap: 8px' })">

				</v-combobox>
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.defenses.resistances" label="Resistances" multiple chips closable-chips
					:items="resistanceList" hint="Supports custom input" persistent-hint
					:item-props="(item) => ({ prependIcon: resistanceIcons[item], style: '--v-list-prepend-gap: 8px' })" />
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.defenses.immunities" label="Immunities" multiple chips closable-chips
					:items="resistanceList" hint="Supports custom input" persistent-hint
					:item-props="(item) => ({ prependIcon: resistanceIcons[item], style: '--v-list-prepend-gap: 8px' })" />
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.defenses.conditionImmunities" label="Condition Immunities" multiple chips
					closable-chips :items="conditionList" hint="Supports custom input" persistent-hint
					:item-props="(item) => ({ prependIcon: conditionIcons[item], style: '--v-list-prepend-gap: 8px' })" />
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


:deep(.stacked-controls) {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 40px;
}

:deep(.stacked-controls .v-btn) {
	width: 100% !important;
	height: 28px !important;
	border-radius: 0;
}


.no-native-spinners :deep(input[type='number']) {
	-moz-appearance: textfield;
}

.no-native-spinners :deep(input[type='number']::-webkit-outer-spin-button),
.no-native-spinners :deep(input[type='number']::-webkit-inner-spin-button) {
	-webkit-appearance: none;
	margin: 0;
}

.no-native-spinners :deep(.v-field) {
	padding-right: 0;
}
</style>