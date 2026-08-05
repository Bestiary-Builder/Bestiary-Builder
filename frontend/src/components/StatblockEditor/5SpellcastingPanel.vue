<script setup lang="ts">
import type { CreatureWithStats, Statblock } from "~/shared";
import { computed, onMounted, ref, watch } from "vue";
import { useRules } from "vuetify/labs/rules";
import { $toast } from "@/utils/app/toast";
import { classes, classLevels, stats } from "@/utils/constants";
import { useFetch } from "@/utils/utils";
import { defaultStatblock, getSpellSlots } from "~/shared";
import LabelledComponent from "../FormInputs/LabelledComponent.vue";
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
				<v-checkbox v-model="data.spellcasting.innateSpells.displayAsAction" label="Display as Action"
					color="primary" density="compact" hide-details />
				<v-checkbox v-model="data.spellcasting.innateSpells.isPsionics" label="Display as Psionics"
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
								:items="spellListFlattened" multiple chips closable-chips />
							<v-icon v-if="parseInt(times.toString()) > 3" v-tooltip="'Delete this daily amount'"
								icon="mdi:delete" class="delete-button button-icon"
								@click="delete data.spellcasting.innateSpells.spellList[times]" />
						</div>
					</LabelledComponent>
				</template>
			</TransitionGroup>
		</div>
		<div class="grid-two">
			<v-dialog max-width="750">
				<template #activator="{ props: activatorProps }">
					<v-btn v-bind="activatorProps" class="mb-4">
						Customize
					</v-btn>
				</template>

				<template #default="{ isActive }">
					<v-card title="Customize daily spellcasting defaults"
						subtitle="The options here allow you to customize the defaults inferred from the statblock and default rules">
						<v-sheet class="pa-4">
							<v-container class="pa-0">
								<v-row>
									<v-col>
										<v-number-input v-model="data.spellcasting.innateSpells.spellDcOverride"
											label="DC Override" clearable />
									</v-col>
									<v-col>
										<v-number-input v-model="data.spellcasting.innateSpells.spellBonusOverride"
											label="Attack Bonus Override" clearable />
									</v-col>
								</v-row>
							</v-container>
							<div>
								<v-textarea v-model="data.spellcasting.innateSpells.customDescription"
									label="Description override" />
							</div>
							<v-divider />
							<v-card-text> Add a new daily amount of casts here. </v-card-text>
							<v-container class="pa-0">
								<v-row>
									<v-col>
										<v-number-input label="Add new daily amount" :min="4" clearable
											v-model="newDailyAmount" />
									</v-col>
									<v-col>
										<v-btn @click="addNewDaily()" class="w-100" size="large">
											Add
										</v-btn>
									</v-col>
								</v-row>
							</v-container>
							<v-spacer />
							<v-divider />
							<v-container class="pa-0">
								<v-card-text> Add a (comment) to each spell here. </v-card-text>
								<v-row>
									<template v-for="times, idx in data.spellcasting.innateSpells.spellList" :key="idx">
										<v-col v-for="(spell, index) of times" cols="4" :key="index">
											<v-text-field v-model="spell.comment" :label="spell.spell" />
										</v-col>
									</template>
								</v-row>
							</v-container>
							<v-spacer />
						</v-sheet>
						<v-card-actions>
							<v-btn @click="isActive.value = false">
								Close
							</v-btn>
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>
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
					<v-combobox v-if="!['Ranger', 'Paladin'].includes(data.spellcasting.casterSpells.castingClass)"
						v-model="data.spellcasting.casterSpells.spellList[0]" :items="spellList![0]" multiple chips
						closable-chips label="Cantrips" hint="Allows custom spells" />
				</v-col>
				<v-col v-for="level in spellLevelList" :key="level" cols="6">
					<v-combobox v-model="data.spellcasting.casterSpells.spellList[level]"
						:items="getSpellsByLevel(level)" multiple chips closable-chips :label="`Level ${level} spells`"
						hint="Allows custom spells" />
				</v-col>
			</v-row>
		</v-container>
		<div class="grid-two">
			<v-dialog max-width="750">
				<template #activator="{ props: activatorProps }">
					<v-btn v-bind="activatorProps">
						Customize
					</v-btn>
				</template>

				<template #default="{ isActive }">
					<v-card title="Customize class spellcasting defaults"
						subtitle="The options here allow you to customize the defaults inferred from the statblock and default rules">
						<v-sheet class="pa-4">
							<v-container class="pa-0">
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
								<v-textarea v-model="data.spellcasting.casterSpells.customDescription"
									label="Description override" />
							</div>
							<v-spacer />
							<v-divider />

							<v-container v-if="data.spellcasting.casterSpells.spellSlotList" class="pa-0">
								<v-card-text> Override the number of spell slots granted at each level
									here.</v-card-text>
								<v-row>
									<v-col v-for="x in 9" :key="x" cols="4">
										<v-number-input v-model="data.spellcasting.casterSpells.spellSlotList[x]"
											:label="`Level ${x}`" :min="0" size="small" variant="solo" clearable />
									</v-col>
								</v-row>

							</v-container>
						</v-sheet>
						<v-card-actions>
							<v-btn @click="isActive.value = false">
								Close
							</v-btn>
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>
		</div>
	</div>
</template>

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
