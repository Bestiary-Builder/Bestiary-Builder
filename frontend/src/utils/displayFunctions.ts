// Simple global functions used in several places in the UI

import type {Creature, SenseEntity, SpeedEntity, SpellCasting, Statblock, Stat} from "@/../../shared";

export function displayCR(cr: number): string {
	if (cr == 0.125) return "1/8";
	if (cr == 0.25) return "1/4";
	if (cr == 0.5) return "1/2";
	return cr.toString();
}

export function displaySpeedOrSenses(data: SenseEntity[] | SpeedEntity[], hasEndingComma = false): string {
	let output = "";
	let filteredLength = data.filter((item) => item.name !== "New speed" && item.name !== "New sense").length;
	for (let [index, item] of data.entries()) {
		if (item.name === "New speed" || item.name === "New sense") continue;
		if (item.name != "Walk") output += item.name.toLowerCase() + " ";
		output += item.value;
		if (item.unit != "none") output += item.unit + ".";
		if (item.comment) output += ` (${item.comment})`;
		if (hasEndingComma || (filteredLength != 1 && index != filteredLength - 1)) output += ", ";
	}
	return output;
}

export function displayInnateCasting(data: Statblock): string {
	let sData = data.spellcasting.innateSpells;
	let name = data.description.name;
	let output = "";
	if (!sData.spellCastingAbility) return output;
	if (!data.description.isProperNoun && !sData.displayAsAction)
		output += `The ${name.toLowerCase()}'s spellcasting ability is ${fullSpellAbilityName(sData.spellCastingAbility)} (spell save DC ${innateDC(data)}, ${innateSpellBonus(data)} to hit with spell attacks). It can innately cast the following spells${componentsString(data)}:`;
	else if (!data.description.isProperNoun && sData.displayAsAction)
		output += `The ${name.toLowerCase()} casts one of the following spells${componentsString(data)} and using ${fullSpellAbilityName(sData.spellCastingAbility)} as the spellcasting ability (spell save DC ${innateDC(data)}, ${innateSpellBonus(data)} to hit with spell attacks).`;
	else if (data.description.isProperNoun && !sData.displayAsAction)
		output += `${name}'s spellcasting ability is ${fullSpellAbilityName(sData.spellCastingAbility)} (spell save DC ${innateDC(data)}, ${innateSpellBonus(data)} to hit with spell attacks). ${name} can innately cast the following spells${componentsString(data)}:`;
	else if (data.description.isProperNoun && sData.displayAsAction)
		output += `${name} casts one of the following spells${componentsString(data)} and using ${fullSpellAbilityName(sData.spellCastingAbility)} as the spellcasting ability (spell save DC ${innateDC(data)}, ${innateSpellBonus(data)} to hit with spell attacks).`;

	for (let times in sData.spellList) {
		if (sData.spellList[times].length == 0) continue;

		if (parseInt(times) == 0) output += "\nAt will: ";
		else output += `\n${times}/day${sData.spellList[times].length > 1 ? " each" : ""}: `;

		output += sData.spellList[times]
			.map((x) => (x.comment.length > 0 ? `*${x.spell.toLowerCase()} (${x.comment})*` : `*${x.spell.toLowerCase()}*`))
			.sort()
			.join(", ");
	}
	return output;
}

export function displayCasterCasting(data: Statblock): string {
	let sData = data.spellcasting.casterSpells;
	let name = data.description.name;
	let output = "";
	if (!sData.spellCastingAbility) return output;

	return output;
}

function fullSpellAbilityName(abi: string): string {
	abi = abi.toLowerCase().trim();

	if (abi == "str") return "Strength";
	if (abi == "dex") return "Dexterity";
	if (abi == "con") return "Constitution";
	if (abi == "wis") return "Wisdom";
	if (abi == "int") return "Intelligence";
	if (abi == "cha") return "Charisma";
	return "Spellcasting Ability not found.";
}

function statCalc(data: Statblock, stat: Stat): number {
	return Math.floor(data.abilities.stats[stat] / 2) - 5;
}

function innateDC(data: Statblock): number {
	let castingData = data.spellcasting.innateSpells;
	if (!castingData.spellCastingAbility) return 0;

	if (castingData.spellDcOverride) return castingData.spellDcOverride;
	else return 8 + statCalc(data, castingData.spellCastingAbility) + data.core.proficiencyBonus;
}

function innateSpellBonus(data: Statblock): string {
	let castingData = data.spellcasting.innateSpells;
	if (!castingData.spellCastingAbility) return "0";

	let bonus = 0;
	if (castingData.spellBonusOverride || castingData.spellBonusOverride === 0) bonus = castingData.spellBonusOverride;
	else bonus = statCalc(data, castingData.spellCastingAbility) + data.core.proficiencyBonus;

	if (bonus >= 0) return "+" + bonus;
	return bonus.toString();
}

function componentsString(data: Statblock): string {
	let comp = data.spellcasting.innateSpells.noComponentsOfType.sort();
	if (comp.length == 0) return "";
	if (comp.length == 3) return ", requiring no components";
	if (comp.length == 2) {
		let only = "material";
		if (!comp.includes("Verbal")) only = "verbal";
		if (!comp.includes("Somatic")) only = "somatic";

		return `, requiring only ${only} components`;
	}
	return `, requiring no ${comp[0].toLowerCase()} components`;
}
