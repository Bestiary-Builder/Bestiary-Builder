// Simple global functions used in several places in the UI
import type {SenseEntity, SpeedEntity, SpellCasting, Statblock, Stat} from "~/shared";
import {fullSpellAbilityName, statCalc, componentsString} from "~/shared";

export function displayCR(cr: number): string {
	if (cr == 0.125) return "1/8";
	if (cr == 0.25) return "1/4";
	if (cr == 0.5) return "1/2";
	return cr.toString();
}

export function displayInnateCasting(data: Statblock): string {
	let sData = data.spellcasting.innateSpells;
	let name = data.description.name;
	let output = "";
	if (!sData.spellCastingAbility) return output;
	if (!data.description.isProperNoun && !sData.displayAsAction)
		output += `The ${name.toLowerCase()}'s spellcasting ability is ${fullSpellAbilityName(sData.spellCastingAbility)} (spell save DC ${innateDC(data)}, ${innateSpellBonus(data)} to hit with spell attacks). It can innately cast the following spells${componentsString(sData.noComponentsOfType)}:`;
	else if (!data.description.isProperNoun && sData.displayAsAction)
		output += `The ${name.toLowerCase()} casts one of the following spells${componentsString(sData.noComponentsOfType)} and using ${fullSpellAbilityName(sData.spellCastingAbility)} as the spellcasting ability (spell save DC ${innateDC(data)}, ${innateSpellBonus(
			data
		)} to hit with spell attacks).`;
	else if (data.description.isProperNoun && !sData.displayAsAction)
		output += `${name}'s spellcasting ability is ${fullSpellAbilityName(sData.spellCastingAbility)} (spell save DC ${innateDC(data)}, ${innateSpellBonus(data)} to hit with spell attacks). ${name} can innately cast the following spells${componentsString(sData.noComponentsOfType)}:`;
	else if (data.description.isProperNoun && sData.displayAsAction)
		output += `${name} casts one of the following spells${componentsString(sData.noComponentsOfType)} and using ${fullSpellAbilityName(sData.spellCastingAbility)} as the spellcasting ability (spell save DC ${innateDC(data)}, ${innateSpellBonus(data)} to hit with spell attacks).`;

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

function innateDC(data: Statblock): number {
	let castingData = data.spellcasting.innateSpells;
	if (!castingData.spellCastingAbility) return 0;

	if (castingData.spellDcOverride) return castingData.spellDcOverride;
	else return 8 + statCalc(castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
}

function innateSpellBonus(data: Statblock): string {
	let castingData = data.spellcasting.innateSpells;
	if (!castingData.spellCastingAbility) return "0";

	let bonus = 0;
	if (castingData.spellBonusOverride || castingData.spellBonusOverride === 0) bonus = castingData.spellBonusOverride;
	else bonus = statCalc(castingData.spellCastingAbility, data) + data.core.proficiencyBonus;

	if (bonus >= 0) return "+" + bonus;
	return bonus.toString();
}
