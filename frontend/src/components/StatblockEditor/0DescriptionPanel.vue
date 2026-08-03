<script setup lang="ts">
import type { Statblock } from "~/shared";
import { watch } from "vue";
import { useRules } from "vuetify/labs/rules";
import { alignments, creatureTypes, sizes } from "@/utils/constants";
import { store } from "@/utils/store";
import { getXPbyCR } from "~/shared";
import CRInput from "../FormInputs/CRInput.vue";
import LabelledComponent from "../FormInputs/LabelledComponent.vue";
import Editor from "./Editor.vue";

const { data } = defineProps<{ data: Statblock }>();

watch(() => data.description.cr, () => {
	data.core.proficiencyBonus = Math.max(2, Math.min(9, Math.floor((data.description.cr + 3) / 4)) + 1);
	data.description.xp = getXPbyCR(data.description.cr);
});

const rules = useRules();
const imageUrlPattern = /^https?:\/\/.+\.(?:png|jpe?g|webp|gif|apng)(?:\?.*)?$/i;
const imageRules = [
	rules.pattern(
		imageUrlPattern,
		"Enter a valid image URL https and one of (.png, .jpg, .jpeg, .webp, .gif, or .apng)"
	),
];
</script>

<template>
	<div
		id="tabpanel-1" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0"
		aria-labelledby="tab-1"
	>
		<div class="editor-field__container two-wide">
			<div>
				<v-text-field
					v-model="data.description.name" label="Name" :maxlength="store.limits?.nameLength"
					:min-length="store.limits?.nameMin"
					:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]"
				/>
			</div>
			<div>
				<v-text-field v-model="data.description.image" label="Image URL" :rules="imageRules" />
			</div>
		</div>

		<div class="editor-field__container one-wide pb-4">
			<LabelledComponent v-if="data" title="Description" for="description">
				<Editor v-model="data.description.description" />
			</LabelledComponent>
		</div>
		<div class="editor-field__container three-wide">
			<v-combobox v-model="data.core.size" :items="sizes" label="Size" />
			<v-combobox v-model="data.core.race" :items="creatureTypes" label="Type" />
			<v-combobox v-model="data.description.alignment" :items="alignments" label="Alignment" />
		</div>
		<div class="editor-field__container three-wide">
			<CRInput v-model="data.description.cr" label="Challenge Rating" />
			<v-number-input v-model="data.core.proficiencyBonus" label="Proficiency Bonus" />
			<v-number-input v-model="data.description.xp" label="XP" />
		</div>
		<div class="editor-field__container three-wide">
			<div>
				<v-text-field v-model="data.description.environment" label="Environment" />
			</div>
			<div>
				<v-text-field v-model="data.description.faction" label="Faction" />
			</div>
			<v-container class="d-flex flex-column flex-column align-start pa-0">
				<v-checkbox
					v-model="data.description.isProperNoun" label="Proper noun" color="primary"
					density="compact" hide-details
				/>
				<small> Toggles display as "{{ data.description.name }}" instead of "the
					{{ data.description.name }}"</small>
			</v-container>
		</div>
	</div>
</template>

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
