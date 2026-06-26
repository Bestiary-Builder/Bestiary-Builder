<script setup lang="ts">
import { computed, onMounted } from "vue";
import SimpleMarkdown from "@khanacademy/simple-markdown";
import MarkdownIt from "markdown-it";
import Markdown from "./Markdown.vue";
import type { SaveEntity, SkillsEntity, Stat, Statblock } from "~/shared";
import { SKILLS_BY_STAT, capitalizeFirstLetter, crAsString, displayCasterCasting, displayInnateCasting, displaySpeedOrSenses, hpCalc, ppCalc, signedNumber, statCalc } from "~/shared";
import { featureGenerator, resistanceGenerator, stats } from "@/utils/constants";
import { store } from "@/utils/store.js";
import type { StatblockDesign } from "~/shared/prisma/enums.js";

const { data, statblockDesign = null, is2024 = null } = defineProps<{ data: Statblock; statblockDesign?: StatblockDesign; is2024?: boolean }>();

const design = statblockDesign || store.user?.statblockDesign;
let v2024;
if (is2024 === null)
	v2024 = store.user?.statblockLayout === "SL_2024";
else
	v2024 = is2024;

const showSkills = computed(() => {
	for (const skill of data.abilities.skills) {
		if (skill.isProficient || skill.isHalfProficient || skill.isExpertise || skill.override || skill.override === 0)
			return true;
	}

	return false;
});

const showCasterCasting = computed(() => {
	return !!((data.spellcasting.casterSpells.casterLevel) && data.spellcasting.casterSpells.castingClass);
});

const showInnateCasting = computed(() => {
	return (data.spellcasting.innateSpells.spellCastingAbility != null) && (
		data.spellcasting.innateSpells.spellList[0].length > 0
		|| data.spellcasting.innateSpells.spellList[1].length > 0
		|| data.spellcasting.innateSpells.spellList[2].length > 0
		|| data.spellcasting.innateSpells.spellList[3].length > 0
	);
});

const skillOutput = computed(() => {
	let skills: SkillsEntity[] = Array.from(data.abilities.skills);
	skills.sort((a: SkillsEntity, b: SkillsEntity) => {
		return a.skillName.localeCompare(b.skillName);
	});

	const seenSkillNames = new Set();

	// Use the filter method to create a new array without duplicates
	skills = skills.filter((obj) => {
		if (seenSkillNames.has(obj.skillName)) {
			// If the skill name is already seen, filter it out
			return false;
		}
		else {
			// Otherwise, add it to the set and include it in the result
			seenSkillNames.add(obj.skillName);
			return true;
		}
	});
	const output = [];
	for (const skill of skills) {
		if (!skill.isExpertise && !skill.isHalfProficient && !skill.isProficient && !skill.override)
			continue;
		let bonus = 0;
		for (const stat in SKILLS_BY_STAT) {
			if (SKILLS_BY_STAT[stat as Stat].includes(skill.skillName.replaceAll(" ", "").toLowerCase().replace("animalh", "animalH").replace("sleightofh", "sleightOfH"))) {
				if (v2024 && skill.skillName === "Initiative")
					continue;
				if (skill.override && skill.override !== null) {
					const over = skill.override;

					output.push(`${skill.skillName} ${(over ?? 0) >= 0 ? "+" : ""}${over}`);
				}
				else {
					bonus = statCalc(stat as Stat, data);
					if (skill.isHalfProficient)
						bonus += Math.floor(data.core.proficiencyBonus / 2);
					else if (skill.isProficient)
						bonus += data.core.proficiencyBonus;
					else if (skill.isExpertise)
						bonus += data.core.proficiencyBonus * 2;

					output.push(`${skill.skillName} ${bonus >= 0 ? "+" : ""}${bonus}`);
				}
				break;
			}
			else { continue; }
		}
	}

	return output.join(", ");
});

const hitDieBonus = computed(() => {
	const hp = data.defenses.hp.numOfHitDie * statCalc("con", data);
	if (hp !== 0) {
		if (hp > 0)
			return `+${hp.toString()}`;
		else return hp.toString();
	}
	return "";
});

const alphaSort = (list: string[]) => {
	const sortByLastWord = (a: string, b: string) => {
		const lastWordA = a.split(" ").pop();
		const lastWordB = b.split(" ").pop();
		return lastWordA!.localeCompare(lastWordB!);
	};
	if (v2024)
		return list.sort(sortByLastWord);
	return list.sort(sortByLastWord).map(v => v.toLowerCase());
};

const calculatedSaveNumber = (save: SaveEntity, stat: Stat) => {
	if (save.override)
		return save.override || 0;
	else if (save.isProficient)
		return data.core.proficiencyBonus + statCalc(stat, data);
	else return statCalc(stat, data);
};

const calculatedInitiativeNumber = () => {
	const skill = data.abilities.skills.find(skill => skill.skillName === "Initiative");

	if (!skill)
		return statCalc("dex", data);

	if (skill.override)
		return skill.override;
	if (skill.isHalfProficient)
		return Math.floor(data.core.proficiencyBonus / 2) + statCalc("dex", data);
	else if (skill.isProficient)
		return data.core.proficiencyBonus + statCalc("dex", data);
	else if (skill.isExpertise)
		return data.core.proficiencyBonus * 2 + statCalc("dex", data);
	return 0;
};

const calculatePassiveInitiative = () => {
	const skill = data.abilities.skills.find(skill => skill.skillName === "Initiative");
	if (!skill)
		return 10 + statCalc("dex", data);

	let value = 10;
	if (skill.adv === true)
		value += 5;
	if (skill.adv === false)
		value -= 5;

	return value + calculatedInitiativeNumber();
};

onMounted(async () => {
	if (design === "Odyssey")
		await import("../assets/styles/statblock/odyssey/odyssey.css");

	if (design === "Beyond")
		await import("../assets/styles/statblock/beyond/beyond.css");
});

const md = new MarkdownIt();
const defaultParagraphRenderer = md.renderer.rules.paragraph_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.paragraph_open = function (tokens, idx, options, env, self) {
	let result = "";
	if (idx > 1) {
		const inline = tokens[idx - 2];
		const paragraph = tokens[idx];
		if (inline.type === "inline" && inline.map && inline.map[1] && paragraph.map && paragraph.map[0]) {
			const diff = paragraph.map[0] - inline.map[1];
			if (diff > 0)
				result = "<br>".repeat(diff);
		}
	}
	return result + defaultParagraphRenderer(tokens, idx, options, env, self);
};
</script>

<template>
	<div class="stat-block" :class="[v2024 ? 'v2024' : '', design]">
		<div class="stat-block__row">
			<h1 class="stat-block__name-container">
				{{ data.description.name }}
			</h1>
		</div>
		<span class="stat-block__core"> {{ data.core.size }} {{ data.core.race }}{{ data.description.alignment ? ',' : '' }} {{ data.description.alignment }}</span>

		<div class="stat-block__row two-wide picture-container">
			<div>
				<div>
					<b> {{ v2024 ? 'AC ' : 'Armor Class ' }} </b><span>{{ data.defenses.ac.ac }}</span><span v-if="data.defenses.ac.acSource"> ({{ data.defenses.ac.acSource }}) </span>
					<b v-if="v2024" style="padding-left: .45rem"> Initiative </b> <span v-if="v2024"> {{ signedNumber(calculatedInitiativeNumber()) }} ({{ calculatePassiveInitiative() }})</span>
				</div>
				<div>
					<b> {{ v2024 ? 'HP ' : 'Hit Points ' }} </b>
					<span v-if="data.defenses.hp.override"> {{ data.defenses.hp.override }}</span>
					<span v-else> {{ hpCalc(data) }} ({{ data.defenses.hp.numOfHitDie }}d{{ data.defenses.hp.sizeOfHitDie }}{{ hitDieBonus }})</span>
				</div>
				<div class="stat-block__speed-container">
					<b> Speed </b>
					{{ displaySpeedOrSenses(data.core.speed, false, v2024) }}
				</div>
			</div>
			<!-- <img v-if="data.description.image" class="stat-block__image" :src="data.description.image"> -->
		</div>

		<div class="stat-container-wrapper">
			<div v-if="v2024" class="stat-container">
				<table class="stat-table">
					<thead>
						<tr>
							<th />
							<th />
							<th> MOD </th>
							<th> SAVE</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="stat in stats.slice(0, 3)" :key="stat">
							<th scope="row">
								{{ stat }}
							</th>
							<td> {{ data.abilities.stats[stat] }}</td>
							<td> {{ signedNumber(statCalc(stat, data)) }} </td>
							<td> {{ signedNumber(calculatedSaveNumber(data.abilities.saves[stat], stat)) }}</td>
						</tr>
					</tbody>
				</table>
				<table class="stat-table">
					<thead>
						<tr>
							<th />
							<th />
							<th> MOD </th>
							<th> SAVE</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="stat in stats.slice(3, 6)" :key="stat">
							<th scope="row">
								{{ stat }}
							</th>
							<td> {{ data.abilities.stats[stat] }}</td>
							<td> {{ signedNumber(statCalc(stat, data)) }} </td>
							<td> {{ signedNumber(calculatedSaveNumber(data.abilities.saves[stat], stat)) }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div v-if="!v2024" class="stat-block__row stat-block__abilities">
			<div v-for="stat in stats" :key="stat">
				<div> <b> {{ stat.toUpperCase() }} </b></div>
				<span> {{ data.abilities.stats[stat] }} ({{ signedNumber(statCalc(stat, data)) }})</span>
			</div>
		</div>
		<div class="stat-block__row v2024-no-bottom-border">
			<template v-if="!v2024">
				<div v-if="Object.values(data.abilities.saves).some((val) => (val.isProficient === true || val.override !== null))" class="stat-block__save-container">
					<b> Saving Throws </b>
					<template v-for="stat in stats" :key="stat">
						<span v-if="data.abilities.saves[stat].override !== null || data.abilities.saves[stat].isProficient"> {{ capitalizeFirstLetter(stat) }} {{ signedNumber(calculatedSaveNumber(data.abilities.saves[stat], stat)) }} </span>
						<span v-if="data.abilities.saves[stat].override !== null || data.abilities.saves[stat].isProficient" class="ending-comma">, </span>
					</template>
				</div>
				<div v-if="showSkills" class="stat-block__skills-container">
					<b> Skills </b>
					{{ skillOutput }}
				</div>
			</template>
			<template v-if="!v2024">
				<template v-for="title, resType of resistanceGenerator">
					<div v-if="data.defenses[resType].length > 0" :key="resType" class="stat-block__res-container">
						<b> {{ title }}  </b>
						<span> {{ alphaSort(data.defenses[resType]).join(", ") }} </span>
					</div>
				</template>
			</template>
			<template v-else>
				<div v-if="showSkills" class="stat-block__skills-container">
					<b> Skills </b>
					{{ skillOutput }}
				</div>
				<div v-if="data.defenses.vulnerabilities.length > 0" class="stat-block__res-container">
					<b> Vulnerabilities  </b>
					<span> {{ alphaSort(data.defenses.vulnerabilities).join(", ") }} </span>
				</div>
				<div v-if="data.defenses.resistances.length > 0" class="stat-block__res-container">
					<b> Resistances  </b>
					<span> {{ alphaSort(data.defenses.resistances).join(", ") }} </span>
				</div>
				<div v-if="data.defenses.immunities.length > 0 || data.defenses.conditionImmunities.length > 0" class="stat-block__res-container">
					<b> Immunities  </b>
					<span> {{ alphaSort(data.defenses.immunities).join(", ") }} </span>
					<span v-if="data.defenses.immunities.length > 0 && data.defenses.conditionImmunities.length > 0">, </span>
					<span> {{ alphaSort(data.defenses.conditionImmunities).join(", ") }} </span>
				</div>
			</template>

			<div ckass="stat-block__senses-container">
				<b> Senses </b>
				{{ displaySpeedOrSenses(data.core.senses, false, v2024) }}{{ data.core.senses.length > 0 ? ';' : '' }}
				{{ v2024 ? 'P' : 'p' }}assive Perception {{ ppCalc(data) }}
			</div>
			<div class="stat-block__language-container">
				<b> Languages </b>
				<span v-if="data.core.languages && data.core.languages.length === 0 && !data.misc.telepathy"> — </span>
				<span v-else> {{ data.core.languages?.sort().join(", ") }} </span>
				<span v-if="data.misc.telepathy"> telepathy {{ data.misc.telepathy }}ft.</span>
			</div>
			<div v-if="v2024" class="challenge-prof">
				<span> <b> CR</b> {{ crAsString(data.description.cr) }} (XP {{ data.description.xp }})
				</span>
			</div>
			<div v-else class="challenge-prof">
				<span> <b> Challenge </b> {{ crAsString(data.description.cr) }} ({{ data.description.xp }}) </span>
				<span> <b> Proficiency Bonus </b> +{{ data.core.proficiencyBonus }}</span>
			</div>
		</div>

		<div v-if="data.features.features.length > 0 || showCasterCasting || (showInnateCasting && !data.spellcasting.innateSpells.displayAsAction)" id="yes" class="stat-block__row">
			<div class="feature-container">
				<h3 v-if="v2024" class="feature-container__title">
					Traits
				</h3>
				<p v-if="data.misc.featureHeaderTexts.features">
					{{ data.misc.featureHeaderTexts.features }}
				</p>
				<p v-for="(feature, index) in data.features.features" :key="index">
					<b> <i>{{ feature.name }}.</i><sup v-if="feature.automation" v-tooltip="'Has Automation'" class="feature-container__automation-icon">†</sup> </b>
					<span class="feature-container__desc" v-html="md.render(feature.description.replaceAll('\n', '$ReplaceWithNewLineCharacter')).replaceAll('$ReplaceWithNewLineCharacter', '<br>')" />
				</p>

				<p v-if="showInnateCasting && !data.spellcasting.innateSpells.displayAsAction">
					<b><i>Innate Spellcasting<span v-if="data.spellcasting.innateSpells.isPsionics"> (Psionics)</span>.</i></b>
					<span class="feature-container__desc" v-html="md.render(displayInnateCasting(data, v2024).replaceAll('\n', '$ReplaceWithNewLineCharacter')).replaceAll('$ReplaceWithNewLineCharacter', '<br>')" />
				</p>

				<p v-if="showCasterCasting && data.spellcasting.casterSpells.castingClass && data.spellcasting.casterSpells.casterLevel && data.spellcasting.casterSpells.spellSlotList">
					<b><i>Spellcasting</i></b>
					<span class="feature-container__desc" v-html="md.render(displayCasterCasting(data, v2024).replaceAll('\n', '$ReplaceWithNewLineCharacter')).replaceAll('$ReplaceWithNewLineCharacter', '<br>')" />
				</p>
			</div>
		</div>

		<div v-if="data.features.actions.length > 0 || (showInnateCasting && data.spellcasting.innateSpells.displayAsAction)" class="feature-container">
			<h3 class="feature-container__title">
				Actions
			</h3>
			<p v-if="data.misc.featureHeaderTexts.actions">
				{{ data.misc.featureHeaderTexts.actions }}
			</p>
			<p v-for="(feature, index) in data.features.actions" :key="index">
				<b> <i>{{ feature.name }}.</i><sup v-if="feature.automation" v-tooltip="'Has Automation'" class="feature-container__automation-icon">†</sup></b>
				<span class="feature-container__desc" v-html="md.render(feature.description.replaceAll('\n', '$ReplaceWithNewLineCharacter')).replaceAll('$ReplaceWithNewLineCharacter', '<br>')" />
			</p>

			<p v-if="showInnateCasting && data.spellcasting.innateSpells.displayAsAction">
				<b><i>Spellcasting<span v-if="data.spellcasting.innateSpells.isPsionics"> (Psionics)</span>.</i></b>
				<span class="feature-container__desc" v-html="md.render(displayInnateCasting(data, v2024).replaceAll('\n', '$ReplaceWithNewLineCharacter')).replaceAll('$ReplaceWithNewLineCharacter', '<br>')" />
			</p>
		</div>

		<!-- TODO: Add features and actions to the generator here once they no longer need special handling because of spellcasting -->
		<template v-for="title, fType of featureGenerator">
			<div v-if="data.features[fType].length > 0" :key="fType" class="feature-container">
				<h3 class="feature-container__title">
					{{ title }}
				</h3>
				<p v-if="fType === 'legendary' && data.misc.featureHeaderTexts[fType]" class="feature-header">
					{{ data.misc.featureHeaderTexts[fType].replace("$NUM$", data.misc.legActionsPerRound.toString()) }}
				</p>
				<p v-else-if="data.misc.featureHeaderTexts[fType]" class="feature-header">
					{{ data.misc.featureHeaderTexts[fType] }}
				</p>
				<p v-for="(feature, index) in data.features[fType]" :key="index" class="feature-description">
					<b> <i> {{ feature.name }}.</i></b>
					<sup v-if="feature.automation" v-tooltip="'Has Automation'" class="feature-container__automation-icon">†</sup>
					<span class="feature-container__desc" v-html="md.render(feature.description.replaceAll('\n', '$ReplaceWithNewLineCharacter')).replaceAll('$ReplaceWithNewLineCharacter', '<br>')" />
				</p>
			</div>
		</template>
		<div v-if="data.description.description" class="feature-container">
			<h2 class="feature-container__title">
				Description
			</h2>
			<div class="markdown" v-html="md.render(data.description.description.replaceAll('\n', '$ReplaceWithNewLineCharacter')).replaceAll('$ReplaceWithNewLineCharacter', '<br>')" />
		</div>
	</div>
</template>

<style scoped lang="less">
@import "@/assets/styles/statblock/default.less";
</style>
