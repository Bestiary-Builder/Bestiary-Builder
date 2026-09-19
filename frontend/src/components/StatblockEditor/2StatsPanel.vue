<script setup lang="ts">
import type { Statblock } from "~/shared";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { SKILLS_BY_STAT, statFullName, type Stat } from "~/shared";
import SimpleNumberInput from "../FormInputs/SimpleNumberInput.vue";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";
import { computed, ref, useTemplateRef, watch } from "vue";

const { data } = defineProps<{ data: Statblock }>();
const { addToast } = useToast();

const deleteSkill = (index: number) => {
	data.abilities.skills?.splice(index, 1);
};

const addSkillRef = useTemplateRef("addSkill");
const newSkillName = ref<string | null>(null)
watch(newSkillName, () => {
	if (!newSkillName.value) {
		return;
	}
	if (data.abilities.skills.some(obj => obj.skillName === newSkillName.value)) {
		addToast("You already have this skill.");
		return;
	}

	data.abilities.skills.push({
		skillName: newSkillName.value,
		isHalfProficient: false,
		isProficient: true,
		isExpertise: false,
		override: null,
		adv: null
	});
	newSkillName.value = null;
});

const statIcons: Record<Stat, string> = {
	str: "boxicons:biceps-filled",
	dex: "mdi:run-fast",
	con: "mdi:heart",
	int: "mdi:brain",
	wis: "mdi:stomach",
	cha: "pinhead:person-dancing-with-sparkles",
}

const skillIcons: Record<string, string> = {
	Athletics: "streamline-ultimate:athletics-javelin-throwing-bold",
	Strength: "boxicons:biceps-filled",
	Acrobatics: "material-symbols:sports-gymnastics-rounded",
	'Sleight of Hand': "mdi:handcuffs",
	Stealth: "mdi:volume-off",
	Initiative: "mdi:clock-fast",
	Dexterity: "mdi:run-fast",
	Constitution: "mdi:heart",
	Arcana: "mdi:crystal-ball",
	History: "mdi:book-open-blank-variant",
	Investigation: "mdi:magnify-expand",
	Nature: "mdi:leaf",
	Religion: "mdi:star-four-points",
	Intelligence: "mdi:brain",
	"Animal Handling": "mdi:cat",
	Insight: "mdi:glasses",
	Medicine: "material-symbols:health-metrics",
	Perception: "mdi:eye",
	Survival: "mdi:tent",
	Wisdom: "mdi:stomach",
	Deception: "mdi:emoticon-devil",
	Intimidation: "game-icons:fangs",
	Performance: "mdi:guitar-acoustic",
	Persuasion: "material-symbols:lips",
	Charisma: "pinhead:person-dancing-with-sparkles",
};

const skillOptions = computed(() => {
	const items = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Charisma', 'Constitution', 'Deception', 'Dexterity', 'History', 'Initiative', 'Insight', 'Intelligence', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Strength', 'Survival', 'Wisdom']
	return items.filter((item) => !data.abilities.skills.some((o) => o.skillName === item))
})
</script>

<template>
	<div>
		<SectionHeader title="Ability Scores & Saving Throws" class="pb-2" />
		<v-table density="compact" hover gridlines>
			<thead class="text-bold text-center font-weight-bold">
				<tr>
					<th class="text-left font-weight-bold"> Ability </th>
					<th class="text-center font-weight-bold"> Value </th>
					<th class="text-center font-weight-bold"> Save Prof</th>
					<th class="text-center font-weight-bold"> Save Adv </th>
					<th class="text-center font-weight-bold"> Save Override</th>
				</tr>
			</thead>
			<tbody class="text-center">
				<tr v-for="name, stat of statFullName" :key="stat">
					<td class="text-left text-no-wrap">
						<v-icon :icon="statIcons[stat]" v-if="!store.isMobile" />
						{{ name }}
					</td>
					<td>
						<SimpleNumberInput v-model="data.abilities.stats[stat]" :min="0" :label="name"
							:label-id="stat" />
					</td>
					<td class="d-flex justify-center align-items-center">
						<v-checkbox-btn v-model="data.abilities.saves[stat].isProficient" color="primary"
							density="compact" inline />
					</td>
					<td>
						<select v-model="data.abilities.saves[stat].adv" class="ghost"
							title="Select advantage or disadvantage for this save">
							<option :value="null">
								None
							</option>
							<option :value="true">
								Adv
							</option>
							<option :value="false">
								Dis
							</option>
						</select>
					</td>
					<td v-if="data.abilities.saves[stat].override === null" style="cursor: pointer;"
						@click="data.abilities.saves[stat].override = 1">
						-
					</td>
					<td v-else>
						<SimpleNumberInput v-model="data.abilities.saves[stat].override"
							:label="`${name} save override`" :label-id="`${stat}Override`" is-clearable
							:min="Number.NEGATIVE_INFINITY" />
					</td>
				</tr>
			</tbody>
		</v-table>
		<SectionHeader title="Skills" class="pt-4 pb-2" />
		<v-table v-if="data.abilities.skills.length > 0" class="text-center" density="compact" hover gridlines>
			<thead>
				<tr class="text-bold text-center font-weight-bold">
					<th class="text-left font-weight-bold"> Skill </th>
					<th class="text-center font-weight-bold"> Prof / Exp / <span style="font-size: 8px">1/2</span>Prof
					</th>
					<th class="text-center font-weight-bold"> Advantage </th>
					<th class="text-center font-weight-bold"> Override</th>
					<th class="text-center font-weight-bold"> Delete </th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="skill, idx of data.abilities.skills.sort((a, b) => a.skillName.localeCompare(b.skillName))"
					:key="skill.skillName">
					<td class="text-left text-no-wrap">
						<v-icon :icon="skillIcons[skill.skillName]" v-if="!store.isMobile" />
						{{ skill.skillName }}
					</td>
					<td>
						<div class="d-flex justify-center align-items-center">
							<v-checkbox-btn v-model="skill.isProficient"
								@click="skill.isExpertise = false; skill.isHalfProficient = false" color="primary"
								density="compact" inline />
							<v-checkbox-btn v-model="skill.isExpertise"
								@click="skill.isProficient = false; skill.isHalfProficient = false" color="primary"
								density="compact" inline />
							<v-checkbox-btn v-model="skill.isHalfProficient"
								@click="skill.isExpertise = false; skill.isProficient = false" color="primary"
								density="compact" inline />

						</div>
					</td>
					<td>
						<select v-model="skill.adv" class="ghost"
							title="Select advantage or disadvantage for this save">
							<option :value="null">
								None
							</option>
							<option :value="true">
								Adv
							</option>
							<option :value="false">
								Dis
							</option>
						</select>
					</td>
					<td v-if="skill.override === null" style="cursor: pointer;" @click="skill.override = 1">
						-
					</td>
					<td v-else>
						<SimpleNumberInput v-model="skill.override" :label="`${skill.skillName} save override`"
							:label-id="`${skill.skillName}Override`" is-clearable :min="Number.NEGATIVE_INFINITY" />
					</td>
					<td>
						<v-icon-btn size="22" icon="mdi:delete" color="primary" @click="deleteSkill(idx)" />
					</td>
				</tr>
			</tbody>
		</v-table>
		<v-row>
			<v-col cols="6">
				<v-select label="Add a skill" class="mt-4" :items="skillOptions" v-model="newSkillName" ref="addSkill">
					<template #item="{ item, props }">
						<v-list-item :prepend-icon="skillIcons[item]" v-bind="props" :title="item" />
					</template>
				</v-select>
			</v-col>
		</v-row>
	</div>
</template>

<style scoped>
.v-table :deep(td),
.v-table :deep(th) {
	padding: 2px 8px !important;
}
</style>
