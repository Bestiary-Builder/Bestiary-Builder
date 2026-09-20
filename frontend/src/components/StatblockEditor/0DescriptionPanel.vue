<script setup lang="ts">
import type { Statblock } from "~/shared";
import { watch } from "vue";
import { useRules } from "vuetify/labs/rules";
import { alignments, creatureTypes, sizes } from "@/utils/constants";
import { getXPbyCR, globalLimits } from "~/shared";
import CRInput from "../FormInputs/CRInput.vue";
import Editor from "./Editor.vue";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";

const { data } = defineProps<{ data: Statblock }>();

watch(() => data.description.cr, () => {
	data.core.proficiencyBonus = Math.max(2, Math.min(9, Math.floor((data.description.cr + 3) / 4)) + 1);
	data.description.xp = getXPbyCR(data.description.cr);
});

const rules = useRules();

const creatureTypeIcons: Record<string, string> = {
	"Aberration": "game-icons:octopus",
	"Beast": "game-icons:wolf-howl",
	"Celestial": "game-icons:angel-wings",
	"Construct": "game-icons:robot-golem",
	"Dragon": "game-icons:spiked-dragon-head",
	"Elemental": "mdi:fire",
	"Fey": "game-icons:woman-elf-face",
	"Fiend": "game-icons:evil-fork",
	"Giant": "game-icons:giant",
	"Humanoid": "game-icons:person",
	"Monstrosity": "game-icons:frankenstein-creature",
	"Ooze": "game-icons:melting-ice-cube",
	"Plant": "mdi:leaf",
	"Undead": "game-icons:broken-skull",
}
</script>

<template>
	<div>
		<v-row density="comfortable">
			<v-col cols="6">
				<v-text-field v-model="data.description.name" label="Name" :maxlength="globalLimits.nameLength"
					:min-length="globalLimits.nameMin"
					:rules="[rules.required(), rules.minLength(globalLimits.nameMin), rules.maxLength(globalLimits.nameLength)]" />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="data.description.image" label="Image URL" :rules="[rules.imageLink()]" />
			</v-col>
			<v-col cols="12">
				<Editor v-model="data.description.description" />
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.core.size" :items="sizes" label="Size" hide-details />
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.core.race" :items="creatureTypes" label="Type" hide-details
					:item-props="(item) => ({ prependIcon: creatureTypeIcons[item], style: '--v-list-prepend-gap: 8px' })" />
			</v-col>
			<v-col cols="6">
				<v-combobox v-model="data.description.alignment" :items="alignments" label="Alignment" hide-details />
			</v-col>
			<v-col cols="6">
				<CRInput v-model="data.description.cr" label="Challenge Rating" />
			</v-col>
			<v-col cols="6">
				<v-number-input v-model="data.core.proficiencyBonus" label="Proficiency Bonus" hide-details />
			</v-col>
			<v-col cols="6">
				<v-number-input v-model="data.description.xp" label="XP" hide-details />
			</v-col>
			<v-col cols="12">
				<SectionHeader title="Flavor" />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="data.description.environment" label="Environment" hide-details />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="data.description.faction" label="Faction" hide-details />
			</v-col>

			<v-col cols="6">
				<v-text-field v-model="data.description.gear" label="Gear" hide-details />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="data.description.tag" label="Tag"
					hint="Use this to categorize your creatures on the Bestiary page." persistent-hint />
			</v-col>
			<v-col cols="6">
				<v-checkbox v-model="data.description.isProperNoun" label="Proper noun" color="primary"
					density="compact"
					:hint="`Toggles display as '${data.description.name}' instead of 'the ${data.description.name}'`"
					persistent-hint />
			</v-col>
		</v-row>
	</div>
</template>
