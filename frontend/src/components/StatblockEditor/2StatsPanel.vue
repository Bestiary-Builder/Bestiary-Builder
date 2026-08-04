<script setup lang="ts">
import type { Statblock } from "~/shared";
import { $toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { statFullName } from "~/shared";
import LabelledComponent from "../FormInputs/LabelledComponent.vue";
import SimpleNumberInput from "../FormInputs/SimpleNumberInput.vue";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";

const { data } = defineProps<{ data: Statblock }>();

const deleteSkill = (index: number) => {
	data.abilities.skills?.splice(index, 1);
};

const addNewSkill = (newSkillName: string) => {
	if (!newSkillName) {
		$toast.error("No skill chosen.");
		return;
	}
	if (data.abilities.skills.some(obj => obj.skillName === newSkillName)) {
		$toast.error("You already have this skill.");
		return;
	}

	data.abilities.skills.push({
		skillName: newSkillName,
		isHalfProficient: false,
		isProficient: true,
		isExpertise: false,
		override: null,
		adv: null
	});
};
</script>

<template>
	<div id="tabpanel-3" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0"
		aria-labelledby="tab-3">
		<SectionHeader title="Ability Scores & Saving Throws" />
		<div>
			<table class="list-table quiet">
				<thead>
					<tr>
						<th> Ability </th>
						<td> Value </td>
						<td> Save Prof</td>
						<td> Save Adv </td>
						<td> Save Override</td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="name, stat of statFullName" :key="stat">
						<th scope="row">
							{{ store.isMobile ? stat : name }}
						</th>
						<td>
							<SimpleNumberInput v-model="data.abilities.stats[stat]" :min="0" :label="name"
								:label-id="stat" />
						</td>
						<td>
							<input v-model="data.abilities.saves[stat].isProficient" type="checkbox"
								:is-clearable="true">
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
								:label="`${name} save override`" :label-id="`${stat}Override`" is-clearable />
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<SectionHeader title="Skills" />
		<div>
			<table v-if="data.abilities.skills.length > 0" class="list-table quiet" style="margin-bottom: 1rem;">
				<thead>
					<tr>
						<th> Ability </th>
						<td> Prof / Exp / <span style="font-size: 8px">1/2</span>Prof </td>
						<td> Adv </td>
						<td> Override</td>
						<td> Delete </td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="skill, idx of data.abilities.skills" :key="skill.skillName">
						<th scope="row">
							{{ skill.skillName }}
						</th>
						<td>
							<div style="display: flex; gap: .5rem; justify-content: center; align-items: center;">
								<input v-model="skill.isProficient" type="checkbox" :is-clearable="true" class="round"
									@click="skill.isExpertise = false; skill.isHalfProficient = false">
								<input v-model="skill.isExpertise" type="checkbox" :is-clearable="true" class="round"
									@click="skill.isProficient = false; skill.isHalfProficient = false">
								<input v-model="skill.isHalfProficient" type="checkbox" :is-clearable="true"
									class="round" @click="skill.isExpertise = false; skill.isProficient = false">
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
								:label-id="`${skill.skillName}Override`" is-clearable />
						</td>
						<td>
							<div>
								<v-icon size="22" icon="mdi:delete" @click="deleteSkill(idx)" />
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			<div class="two-wide editor-field__container">
				<v-select label="Add a skill" class="mt-4"
					:items="['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Charisma', 'Constitution', 'Deception', 'Dexterity', 'History', 'Initiative', 'Insight', 'Intelligence', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Strength', 'Survival', 'Wisdom']"
					@update:model-value="(selected) => (addNewSkill(selected || ''))" />
			</div>
		</div>
	</div>
</template>

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
