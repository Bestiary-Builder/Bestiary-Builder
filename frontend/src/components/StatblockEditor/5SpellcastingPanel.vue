<script setup lang="ts">
import type { CreatureWithStats, Statblock } from "~/shared";
import { computed, onMounted, ref, watch } from "vue";
import { $toast } from "@/utils/app/toast";
import { classes, classLevels, stats } from "@/utils/constants";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { defaultStatblock, getSpellSlots } from "~/shared";
import LabelledComponent from "../FormInputs/LabelledComponent.vue";
import LabelledNumberInput from "../FormInputs/LabelledNumberInput.vue";
import Modal from "../Global/Modal.vue";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";

const { data, rawInfo } = defineProps<{ data: Statblock; rawInfo: CreatureWithStats | null }>();

const spellList = ref<{ [key: number]: string[] }>();
const spellListFlattened = ref<string[]>();
onMounted(async () => {
	const { success, data } = await useFetch<{ [key: number]: string[] }>(`/api/spells/all`);
	if (success) {
		spellList.value = data;
		let spellListFlattenedTemp: string[] = [];
		for (const list of Object.values(spellList.value))
			spellListFlattenedTemp = spellListFlattenedTemp.concat(list);
		spellListFlattenedTemp.sort();
		spellListFlattened.value = [...spellListFlattenedTemp];
	}
});

const selectedSpell = ref({
	0: null,
	1: null,
	2: null,
	3: null
} as any);

watch(selectedSpell, () => {
	for (const x in selectedSpell.value)
		selectedSpell.value[x] = null;
}, { deep: true });

const showSpellModal = ref(false);

const spellLevelList = computed((): number[] => {
	const sClass = data.spellcasting.casterSpells.castingClass;
	const slots = data.spellcasting.casterSpells.spellSlotList;

	if (sClass === "Warlock" && slots) {
		// @ts-expect-error It's complicated
		return Array.from({ length: Object.keys(slots)[0] }, (_, index) => index + 1);
	}
	if (slots)
		return Object.keys(slots).map(str => Number.parseInt(str));
	return [];
});

const getSpellsByLevel = (level: number): string[] => {
	if (level < 0 || level > 9 || !spellList.value)
		return [];
	return spellList.value[level];
};

// helpers for managing spellcasting
const clearCasting = () => {
	data.spellcasting.casterSpells = defaultStatblock.spellcasting.casterSpells;
};

watch(() => data.spellcasting.casterSpells.casterLevel, (newValue) => {
	if (rawInfo == null)
		return;
	if (newValue == null || newValue === undefined) {
		clearCasting();
		return;
	}
	// set spell slots when they change level
	data.spellcasting.casterSpells.spellSlotList = getSpellSlots(data.spellcasting.casterSpells.castingClass, data.spellcasting.casterSpells.casterLevel);
});

watch(() => data.spellcasting.casterSpells.castingClass, (newValue) => {
	if (rawInfo == null)
		return;
	data.spellcasting.casterSpells.castingClass = newValue;

	const sClass = data.spellcasting.casterSpells.castingClass;
	switch (sClass) {
		case "Artificer":
		case "Wizard":
			data.spellcasting.casterSpells.spellCastingAbility = "int";
			break;
		case "Cleric":
		case "Druid":
		case "Ranger":
			data.spellcasting.casterSpells.spellCastingAbility = "wis";
			break;
		default:
			data.spellcasting.casterSpells.spellCastingAbility = "cha";
	}
	// set spell slots in case they changed full caster/half caster/arti half/warlock
	data.spellcasting.casterSpells.spellSlotList = getSpellSlots(sClass, data.spellcasting.casterSpells.casterLevel);
});

const newDailyAmount = ref<number | null>(null);

const addNewDaily = () => {
	if (!newDailyAmount.value) {
		$toast.error("You did not choose an amount per day");
		return;
	}
	if (newDailyAmount.value >= 4)
		data.spellcasting.innateSpells.spellList[newDailyAmount.value] = [];
	newDailyAmount.value = null;
};

const showSpellSlotModal = ref(false);
</script>

<template>
	<div id="tabpanel-6" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-6">
		<SectionHeader title="Innate Spellcasting" />
		<div class="editor-field__container three-wide">
			<LabelledComponent title="Casting ability" for="castingability">
				<v-select v-model="data.spellcasting.innateSpells.spellCastingAbility" :options="stats" input-id="castingability" />
			</LabelledComponent>
			<LabelledComponent title="Not these components" for="notthesecomponents">
				<v-select v-model="data.spellcasting.innateSpells.noComponentsOfType" :options="['Material', 'Verbal', 'Somatic']" multiple :deselect-from-dropdown="true" :close-on-select="false" input-id="notthesecomponents" />
			</LabelledComponent>
			<LabelledComponent title="Display as action?" for="displayasaction">
				<span> <input id="displayasaction" v-model="data.spellcasting.innateSpells.displayAsAction" type="checkbox"> <label for="displayasaction"><small>Toggles display as action</small></label> </span>
			</LabelledComponent>
		</div>
		<div class="editor-field__container two-wide">
			<TransitionGroup name="list">
				<template v-for="_, times in data.spellcasting.innateSpells.spellList" :key="times">
					<LabelledComponent :title="times === '0' ? 'At will' : `${times}/day`" takes-custom-text-input :for="`innateSpellTimes${times}`">
						<div :class="{ 'select-with-delete': parseInt(times.toString()) > 3 }">
							<v-select v-model="data.spellcasting.innateSpells.spellList[times]" :reduce="(sp : any) => ({ spell: sp.spell ?? sp, comment: sp.comment ?? '' })" width="100%" label="spell" :options="spellListFlattened" multiple :deselect-from-dropdown="true" :close-on-select="false" :input-id="`innateSpellTimes${times}`" :taggable="true" :push-tags="true" />
							<font-awesome-icon v-if="parseInt(times.toString()) > 3" v-tooltip="'Delete this daily amount'" :icon="['fas', 'trash']" class="delete-button button-icon" @click="delete data.spellcasting.innateSpells.spellList[times]" />
						</div>
					</LabelledComponent>
				</template>
			</TransitionGroup>
		</div>

		<div class="editor-field__container three-wide">
			<LabelledComponent title="Add daily amount" for="innateSpellDailyAmount">
				<LabelledNumberInput v-model="newDailyAmount" title="" :min="4" :step="1" :is-clearable="true" label-id="innateSpellDailyAmount" />
				<button class="btn" @click="addNewDaily()">
					Add
				</button>
			</LabelledComponent>

			<LabelledComponent title="Is psionics?" for="ispsionics">
				<span> <input id="ispsionics" v-model="data.spellcasting.innateSpells.isPsionics" type="checkbox"> <label for="ispsionics"><small>Toggles display as psionics</small></label>  </span>
			</LabelledComponent>

			<LabelledComponent title="Edit specific spells" for="editspells">
				<button id="editspells" class="btn" @click="showSpellModal = true">
					Edit cast level/add comment
				</button>
			</LabelledComponent>
			<LabelledComponent title="Description override" for="innateDescription">
				<textarea id="innateDescription" v-model="data.spellcasting.innateSpells.customDescription" rows="2" :maxlength="store.limits?.descriptionLength" />
			</LabelledComponent>

			<LabelledNumberInput v-model="data.spellcasting.innateSpells.spellDcOverride" title="DC override" :step="1" :is-clearable="true" label-id="innateSpellDcOverride" />
			<LabelledNumberInput v-model="data.spellcasting.innateSpells.spellBonusOverride" title="Attack bonus override" :step="1" :is-clearable="true" label-id="innateSpellBonusOverride" />
		</div>

		<SectionHeader title="Class Spellcasting" />
		<div class="editor-field__container two-wide">
			<LabelledComponent title="Class" for="castingClass">
				<v-select v-model="data.spellcasting.casterSpells.castingClass" :options="classes" input-id="castingClass" />
			</LabelledComponent>
			<LabelledComponent title="Class level" for="classLevel">
				<v-select v-model="data.spellcasting.casterSpells.casterLevel" :options="classLevels" input-id="classLevel" />
			</LabelledComponent>

			<LabelledNumberInput v-model="data.spellcasting.casterSpells.spellDcOverride" title="DC override" :step="1" :is-clearable="true" label-id="spellDcOverride" />
			<LabelledNumberInput v-model="data.spellcasting.casterSpells.spellBonusOverride" title="Attack bonus override" :step="1" label-id="spellBonusOverride" />
			<LabelledComponent title="Description override" for="casterDescription">
				<textarea id="casterDescription" v-model="data.spellcasting.casterSpells.customDescription" rows="2" :maxlength="store.limits?.descriptionLength" />
			</LabelledComponent>

			<LabelledComponent title="Edit spell slots" for="editspellslots">
				<button id="editspellslots" class="btn" @click="showSpellSlotModal = true">
					Edit spell slot amount
				</button>
			</LabelledComponent>
		</div>
		<div v-if="data.spellcasting.casterSpells.castingClass" class="editor-field__container two-wide">
			<LabelledComponent v-if="!['Ranger', 'Paladin'].includes(data.spellcasting.casterSpells.castingClass)" title="Cantrips" takes-custom-text-input for="cantrips">
				<v-select v-model="data.spellcasting.casterSpells.spellList[0]" :options="spellList![0]" multiple :deselect-from-dropdown="true" :close-on-select="false" :taggable="true" :push-tags="true" input-id="cantrips" />
			</LabelledComponent>
			<LabelledComponent v-for="level in spellLevelList" :key="level" :title="`Level ${level}`" takes-custom-text-input :for="`spellLevel${level}`">
				<v-select v-model="data.spellcasting.casterSpells.spellList[level]" :options="getSpellsByLevel(level)" multiple :deselect-from-dropdown="true" :close-on-select="false" :taggable="true" :push-tags="true" :title="`Level ${level}`" :input-id="`spellLevel${level}`" />
			</LabelledComponent>
		</div>
	</div>

	<Modal :show="showSpellModal" @close="showSpellModal = false">
		<template #header>
			Edit Innate Spellcasting list
		</template>
		<template #body>
			<p>You can use this to add text to specific spells such as "self only" or "at 5th level".</p>
			<div class="two-wide">
				<template v-for="times in data.spellcasting.innateSpells.spellList" :key="times">
					<template v-if="times.length > 0">
						<LabelledComponent v-for="(spell, index) in times" :key="index" :title="spell.spell" :for="`editSpell${spell.spell}`">
							<input :id="`editSpell${spell.spell}`" v-model="spell.comment" type="text" placeholder="comment">
						</LabelledComponent>
					</template>
				</template>
			</div>
		</template>
	</Modal>

	<Modal :show="showSpellSlotModal" @close="showSpellSlotModal = false">
		<template #header>
			Edit Spell Slot Amount
		</template>
		<template #body>
			<p>You can use this to edit how many spell slots a creature has. <br> Note that changing a creature's spellcasting level or class will reset this. </p>
			<div v-if="data.spellcasting.casterSpells.spellSlotList" class="two-wide">
				<template v-for="x in 9" :key="x">
					<LabelledNumberInput v-model="data.spellcasting.casterSpells.spellSlotList[x]" :title="`Level ${x}`" :min="0" :max="9" :step="1" :label-id="`editSpellSlot${x}`" />
				</template>
			</div>
		</template>
	</Modal>
</template>

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
