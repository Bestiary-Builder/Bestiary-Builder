<script setup lang="ts">
import type { CreatureWithStats, InnateSpellsEntity, Statblock } from "~/shared";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useToast } from "@/utils/app/toast";
import { classes, classLevels, stats } from "@/utils/constants";
import { useFetch } from "@/utils/utils";
import { defaultStatblock, getSpellSlots } from "~/shared";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";
import { useLazyAsync } from "@/utils/app/useLazyOptions";

const { data, rawInfo } = defineProps<{ data: Statblock; rawInfo: CreatureWithStats | null }>();
const { addToast } = useToast();

interface RawSpellList {
	[key: number]: string[];
}

const spells = reactive(useLazyAsync<RawSpellList>(
	async () => {
		console.log('yaya')
		const { success, data, error } = await useFetch<RawSpellList>(`/api/spells/all`);
		if (!success)
			throw new Error(error);
		return data;
	},
	{},
	{ onError: (error) => addToast(error instanceof Error ? error.message : String(error), { color: "error" }) },
));

const spellListFlattened = computed<InnateSpellsEntity[]>(() =>
	Object.values(spells.data)
		.flat()
		.sort()
		.map(spell => ({ spell, comment: "" })),
);

const getSpellsByLevel = (level: number) => spells.data[level] ?? [];

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
		addToast("You did not choose an amount per day");
		return;
	}
	if (newDailyAmount.value >= 4)
		data.spellcasting.innateSpells.spellList[newDailyAmount.value] = [];
	newDailyAmount.value = null;
};

const handleNewCustomInnateSpell = () => {
	const spells = data.spellcasting.innateSpells.spellList;
	for (const times in spells) {
		for (const idx in spells[times]) {
			if (typeof (spells[times][idx]) === "string") {
				spells[times][idx] = { spell: spells[times][idx], comment: "" };
			}
		}
	}
};
</script>

<template>
	<div>
		<SectionHeader title="Daily Spells" />
		<v-row class="my-4">
			<v-col cols="6">
				<v-select v-model="data.spellcasting.innateSpells.spellCastingAbility" :items="stats"
					label="Casting ability" input-id="castingability" hide-details />
			</v-col>
			<v-col cols="6">
				<v-select v-model="data.spellcasting.innateSpells.noComponentsOfType"
					:items="['Material', 'Verbal', 'Somatic']" multiple chips closable-chips
					label="Not these components" hide-details />
			</v-col>
			<v-col cols="6">
				<div>
					<v-checkbox v-model="data.spellcasting.innateSpells.displayAsAction" label="Display as Action"
						color="primary" density="compact" hide-details />
					<v-checkbox v-model="data.spellcasting.innateSpells.isPsionics" label="Display as Psionics"
						color="primary" density="compact" hide-details />
				</div>
			</v-col>
			<v-col cols="6">
				<v-dialog max-width="750">
					<template #activator="{ props: activatorProps }">
						<v-btn v-bind="activatorProps" class="w-100">
							Customize daily spellcasting
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
											<v-number-input v-model="newDailyAmount" label="Add new daily amount"
												:min="4" clearable />
										</v-col>
										<v-col>
											<v-btn class="w-100" size="large" @click="addNewDaily()">
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
										<template v-for="times, idx in data.spellcasting.innateSpells.spellList"
											:key="idx">
											<v-col v-for="(spell, index) of times" :key="index" cols="4">
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
			</v-col>
			<v-col v-for="_, times in data.spellcasting.innateSpells.spellList" :key="times" cols="6">
				<div :class="{ 'select-with-delete': parseInt(times.toString()) > 3 }">
					<v-combobox v-model="data.spellcasting.innateSpells.spellList[times]" item-title="spell"
						:items="spellListFlattened" :loading="spells.loading" multiple chips closable-chips
						return-object hint="Supports custom spells" :label="times === '0' ? 'At will' : `${times}/day`"
						class="w-100" persistent-hint @update:focused="spells.handleMenuOpen"
						@update:model-value="handleNewCustomInnateSpell">
						<template #append v-if="parseInt(times.toString()) > 3">
							<v-icon-btn v-tooltip="'Delete this daily amount'" icon="mdi:delete"
								@click="delete data.spellcasting.innateSpells.spellList[times]" />
						</template>
						<template #no-data>
							<v-list-item>
								<v-list-item-title>
									{{ spells.loading ? 'Loading...' : 'No spells found' }}
								</v-list-item-title>
							</v-list-item>
						</template>
					</v-combobox>

				</div>
			</v-col>
		</v-row>
		<SectionHeader title="Class Spellcasting" />
		<v-row class="mt-4">
			<v-col cols="6">
				<v-select v-model="data.spellcasting.casterSpells.castingClass" :items="classes" label="Class" clearable
					hide-details />
			</v-col>
			<v-col cols="6">
				<v-select v-model="data.spellcasting.casterSpells.casterLevel" :items="classLevels" label="Caster level"
					hide-details />
			</v-col>
			<template v-if="data.spellcasting.casterSpells.castingClass">
				<v-col v-if="!['Ranger', 'Paladin'].includes(data.spellcasting.casterSpells.castingClass)" cols="6">
					<v-combobox v-model="data.spellcasting.casterSpells.spellList[0]" :items="spells.data[0] ?? []"
						:loading="spells.loading" multiple chips closable-chips label="Cantrips"
						hint="Supports custom spells" persistent-hint @update:focused="spells.handleMenuOpen">

						<template #no-data>
							<v-list-item>
								<v-list-item-title>
									{{ spells.loading ? 'Loading...' : 'No spells found' }}
								</v-list-item-title>
							</v-list-item>
						</template>
					</v-combobox>
				</v-col>
				<v-col v-for="level in spellLevelList" cols="6">
					<v-combobox v-model="data.spellcasting.casterSpells.spellList[level]"
						:items="getSpellsByLevel(level)" :loading="spells.loading" multiple chips closable-chips
						:label="`Level ${level} spells`" hint="Supports custom spells" persistent-hint
						@update:focused="spells.handleMenuOpen">
						<template #no-data>
							<v-list-item>
								<v-list-item-title>
									{{ spells.loading ? 'Loading...' : 'No spells found' }}
								</v-list-item-title>
							</v-list-item>
						</template>
					</v-combobox> </v-col>
			</template>
			<v-col cols="6">
				<v-dialog max-width="750">
					<template #activator="{ props: activatorProps }">
						<v-btn v-bind="activatorProps" class="w-100">
							Customize class spellcasting
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
									<v-card-text>
										Override the number of spell slots granted at each level
										here.
									</v-card-text>
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
			</v-col>
		</v-row>
	</div>
</template>
