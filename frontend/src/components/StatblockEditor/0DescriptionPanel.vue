<script setup lang="ts">
import type { Statblock } from "~/shared";
import { watch } from "vue";
import { useRules } from "vuetify/labs/rules";
import { alignments, creatureTypes, sizes } from "@/utils/constants";
import { store } from "@/utils/store";
import { getXPbyCR } from "~/shared";
import CRInput from "../FormInputs/CRInput.vue";
import Editor from "./Editor.vue";

const { data } = defineProps<{ data: Statblock }>();

watch(() => data.description.cr, () => {
	data.core.proficiencyBonus = Math.max(2, Math.min(9, Math.floor((data.description.cr + 3) / 4)) + 1);
	data.description.xp = getXPbyCR(data.description.cr);
});

const rules = useRules();
</script>

<template>
	<div>
		<v-row>
			<v-col cols="6">
				<v-text-field v-model="data.description.name" label="Name" :maxlength="store.limits?.nameLength"
					:min-length="store.limits?.nameMin"
					:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]" />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="data.description.image" label="Image URL" :rules="[rules.imageLink()]" />
			</v-col>
			<v-col cols="12">
				<Editor v-model="data.description.description" />
			</v-col>
			<v-col cols="4">
				<v-combobox v-model="data.core.size" :items="sizes" label="Size" />
			</v-col>
			<v-col cols="4">
				<v-combobox v-model="data.core.race" :items="creatureTypes" label="Type" />
			</v-col cols="4">
			<v-col>
				<v-combobox v-model="data.description.alignment" :items="alignments" label="Alignment" />
			</v-col>
			<v-col cols="4">
				<CRInput v-model="data.description.cr" label="Challenge Rating" />
			</v-col>
			<v-col cols="4">
				<v-number-input v-model="data.core.proficiencyBonus" label="Proficiency Bonus" />
			</v-col>
			<v-col cols="4">
				<v-number-input v-model="data.description.xp" label="XP" />
			</v-col>
			<v-col cols="4">
				<v-text-field v-model="data.description.environment" label="Environment" />
			</v-col>
			<v-col cols="4">
				<v-text-field v-model="data.description.faction" label="Faction" />
			</v-col>
			<v-col cols="4">
				<v-checkbox v-model="data.description.isProperNoun" label="Proper noun" color="primary"
					density="compact"
					:hint="`Toggles display as '${data.description.name}' instead of 'the ${data.description.name}'`"
					persistent-hint />
			</v-col>
		</v-row>

	</div>
</template>