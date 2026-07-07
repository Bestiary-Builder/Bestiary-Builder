<script setup lang="ts">
import { watch } from "vue";
import LabelledComponent from "../FormInputs/LabelledComponent.vue";
import LabelledNumberInput from "../FormInputs/LabelledNumberInput.vue";
import CRInput from "../FormInputs/CRInput.vue";
import { type Statblock, getXPbyCR } from "~/shared";
import { store } from "@/utils/store";
import { alignments, creatureTypes, sizes } from "@/utils/constants";

const { data } = defineProps<{ data: Statblock }>();

watch(() => data.description.cr, () => {
	data.core.proficiencyBonus = Math.max(2, Math.min(9, Math.floor((data.description.cr + 3) / 4)) + 1);
	data.description.xp = getXPbyCR(data.description.cr);
});
</script>

<template>
	<div id="tabpanel-1" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-1">
		<div class="editor-field__container three-wide">
			<LabelledComponent title="Creature name" for="creaturename">
				<input id="creaturename" v-model="data.description.name" type="text" :maxlength="store.limits?.nameLength">
			</LabelledComponent>

			<LabelledComponent title="Image URL" for="imageurl">
				<div style="display: flex; gap: .3rem;">
					<input id="imageurl" v-model="data.description.image" type="text" :pattern="store.limits?.imageFormats ? `(https:\/\/)(.+)(\\.${store.limits?.imageFormats.join('|\\.')})` : ''">
					<VDropdown :distance="6" :positioning-disabled="store.isMobile">
						<button v-tooltip="'Preview image'" aria-label="Preview image" class="preview-icon">
							<font-awesome-icon :icon="['fas', 'eye']" />
						</button>
						<template #popper>
							<div class="v-popper__custom-menu">
								<img :src="data.description.image" style="width: 200px; height: auto">
							</div>
						</template>
					</VDropdown>
				</div>
			</LabelledComponent>
			<LabelledComponent title="Proper noun" for="propernoun">
				<span>
					<input id="propernoun" v-model="data.description.isProperNoun" type="checkbox"> <label for="propernoun" style="word-wrap: anywhere;">Toggles display as "{{ data.description.name }}" instead of "the {{ data.description.name }}"? </label>
				</span>
			</LabelledComponent>
		</div>

		<div class="editor-field__container one-wide">
			<LabelledComponent title="Description" for="description">
				<textarea id="description" v-model="data.description.description" rows="5" :maxlength="store.limits?.descriptionLength" />
			</LabelledComponent>
		</div>
		<div class="editor-field__container three-wide">
			<LabelledComponent title="Size" takes-custom-text-input for="size">
				<v-select v-model="data.core.size" :options="sizes" :taggable="true" :push-tags="true" input-id="size" />
			</LabelledComponent>
			<LabelledComponent title="Race" takes-custom-text-input for="race">
				<v-select v-model="data.core.race" :options="creatureTypes" :taggable="true" :push-tags="true" input-id="race" />
			</LabelledComponent>
			<LabelledComponent title="Alignment" takes-custom-text-input for="alignment">
				<v-select
					v-model="data.description.alignment"
					:options="alignments"
					:taggable="true"
					:push-tags="true"
					input-id="alignment"
				/>
			</LabelledComponent>
		</div>
		<div class="editor-field__container three-wide">
			<CRInput v-model="data.description.cr" title="Challenge Rating" />
			<LabelledNumberInput v-model="data.core.proficiencyBonus" :min="0" title="Proficiency Bonus" :step="1" label-id="proficiencyBonus" />
			<LabelledNumberInput v-model="data.description.xp" :min="0" :step="1" title="Experience Points" label-id="experience" />
		</div>
		<div class="editor-field__container three-wide">
			<LabelledComponent title="Environment" for="environment">
				<input id="environment" v-model="data.description.environment" type="text">
			</LabelledComponent>
			<LabelledComponent title="Faction" for="faction">
				<input id="faction" v-model="data.description.faction" type="text">
			</LabelledComponent>
		</div>
	</div>
</template>
