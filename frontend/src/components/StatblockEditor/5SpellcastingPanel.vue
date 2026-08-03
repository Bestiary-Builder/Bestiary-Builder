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
import { useRules } from "vuetify/labs/rules";

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

const rules = useRules()
</script>

<template>
	<div id="tabpanel-6" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0"
		aria-labelledby="tab-6">
		<SectionHeader title="Daily Spells" />
		<div class="editor-field__container three-wide">
			<div>
				<v-select v-model="data.spellcasting.innateSpells.spellCastingAbility" :items="stats"
					label="Casting ability" input-id="castingability" />
			</div>

			<div>
				<v-select v-model="data.spellcasting.innateSpells.noComponentsOfType"
					:items="['Material', 'Verbal', 'Somatic']" multiple chips closable-chips
					label="Not these components" />
			</div>
			<div>
				<v-checkbox label="Display as Action" v-model="data.spellcasting.innateSpells.displayAsAction"
					color="primary" density="compact" hide-details />
				<v-checkbox label="Display as Psionics" v-model="data.spellcasting.innateSpells.isPsionics"
					color="primary" density="compact" hide-details />
			</div>
		</div>
		<div class="editor-field__container two-wide">
			<TransitionGroup name="list">
				<template v-for="_, times in data.spellcasting.innateSpells.spellList" :key="times">
					<LabelledComponent :title="times === '0' ? 'At will' : `${times}/day`" takes-custom-text-input
						:for="`innateSpellTimes${times}`">
						<div :class="{ 'select-with-delete': parseInt(times.toString()) > 3 }">
							<v-select v-model="data.spellcasting.innateSpells.spellList[times]"
								:reduce="(sp: any) => ({ spell: sp.spell ?? sp, comment: sp.comment ?? '' })"
								width="100%" label="spell" :items="spellListFlattened" multiple
								:deselect-from-dropdown="true" :close-on-select="false"
								:input-id="`innateSpellTimes${times}`" :taggable="true" :push-tags="true" />
							<font-awesome-icon v-if="parseInt(times.toString()) > 3"
								v-tooltip="'Delete this daily amount'" :icon="['fas', 'trash']"
								class="delete-button button-icon"
								@click="delete data.spellcasting.innateSpells.spellList[times]" />
						</div>
					</LabelledComponent>
				</template>
			</TransitionGroup>
		</div>

		<div class="editor-field__container three-wide">
			<LabelledComponent title="Add daily amount" for="innateSpellDailyAmount">
				<LabelledNumberInput v-model="newDailyAmount" title="" :min="4" :step="1" :is-clearable="true"
					label-id="innateSpellDailyAmount" />
				<button class="btn" @click="addNewDaily()">
					Add
				</button>
			</LabelledComponent>
			<LabelledComponent title="Edit specific spells" for="editspells">
				<button id="editspells" class="btn" @click="showSpellModal = true">
					Edit cast level/add comment
				</button>
			</LabelledComponent>
			<LabelledComponent title="Description override" for="innateDescription">
				<textarea id="innateDescription" v-model="data.spellcasting.innateSpells.customDescription" rows="2"
					:maxlength="store.limits?.descriptionLength" />
			</LabelledComponent>
			<div>
				<v-number-input v-model="data.spellcasting.innateSpells.spellDcOverride" label="DC Override"
					clearable />
			</div>
			<div>
				<v-number-input v-model="data.spellcasting.innateSpells.spellBonusOverride"
					label="Attack Bonus Override" clearable />
			</div>
		</div>

		<SectionHeader title="Class Spellcasting" />
		<div class="editor-field__container two-wide">
			<div>
				<v-select v-model="data.spellcasting.casterSpells.castingClass" :items="classes" label="Class" />
			</div>
			<div>
				<v-select v-model="data.spellcasting.casterSpells.casterLevel" :items="classLevels"
					label="Caster level" />
			</div>
		</div>
		<v-container v-if="data.spellcasting.casterSpells.castingClass" class="pa-0">
			<v-row>
				<v-col cols="6">
					<v-combobox v-model="data.spellcasting.casterSpells.spellList[0]" :items="spellList![0]" multiple
						chips closable-chips label="Cantrips"
						v-if="!['Ranger', 'Paladin'].includes(data.spellcasting.casterSpells.castingClass)"
						hint="Allows custom spells" />
				</v-col>
				<v-col v-for="level in spellLevelList" :key="level" cols="6">
					<v-combobox v-model="data.spellcasting.casterSpells.spellList[level]"
						:items="getSpellsByLevel(level)" multiple chips closable-chips :label="`Level ${level} spells`"
						hint="Allows custom spells" />
				</v-col>
			</v-row>
		</v-container>
		<div class="grid-two">
			<v-dialog max-width="950">
				<template v-slot:activator="{ props: activatorProps }">
					<v-btn v-bind="activatorProps"> Customize defaults </v-btn>
				</template>

				<template v-slot:default="{ isActive }">
					<v-card title="Customize class spellcasting defaults"
						subtitle="The options here allow you to customize the defaults inferred from the statblock and default rules">
						<v-sheet class="pa-4">
							<v-container  class="pa-0">
								<v-row>
									<v-col>
										<v-number-input v-model="data.spellcasting.casterSpells.spellDcOverride"
											label="DC Override" clearable />
									</v-col>
									<v-col>
										<v-number-input v-model="data.spellcasting.casterSpells.spellBonusOverride"
											label="Attack Bonus Override" clearable />
									</v-col>
								</v-row>
							</v-container>
							<div>
								<v-textarea label="Description override"
									v-model="data.spellcasting.casterSpells.customDescription" />
							</div>
							<v-container class="pa-0" v-if="data.spellcasting.casterSpells.spellSlotList">
								<v-row gap="16">
									<v-col cols="4" v-for="x in 9" :key="x">
										<v-number-input :label="`Level ${x} slots number`" :min="0"
											v-model="data.spellcasting.casterSpells.spellSlotList[x]" />
									</v-col>
								</v-row>
							</v-container>
						</v-sheet>
						<v-card-actions>
							<v-btn @click="isActive.value = false"> Close </v-btn>
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>
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
						<LabelledComponent v-for="(spell, index) in times" :key="index" :title="spell.spell"
							:for="`editSpell${spell.spell}`">
							<input :id="`editSpell${spell.spell}`" v-model="spell.comment" type="text"
								placeholder="comment">
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
			<p>You can use this to edit how many spell slots a creature has. <br> Note that changing a creature's
				spellcasting level or class will reset this. </p>
			<div v-if="data.spellcasting.casterSpells.spellSlotList" class="two-wide">
				<template v-for="x in 9" :key="x">
					<LabelledNumberInput v-model="data.spellcasting.casterSpells.spellSlotList[x]" :title="`Level ${x}`"
						:min="0" :max="9" :step="1" :label-id="`editSpellSlot${x}`" />
				</template>
			</div>
		</template>
	</Modal>
</template>

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
