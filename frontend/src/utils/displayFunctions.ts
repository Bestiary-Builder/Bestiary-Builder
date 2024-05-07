import type { Statblock} from "~/shared";
import {fullSpellAbilityName, componentsString, spellDc, spellAttackBonus} from "~/shared";

export function displayInnateCasting(data: Statblock): string {
	let sData = data.spellcasting.innateSpells;
	let name = data.description.name;
	let output = "";
	if (!sData.spellCastingAbility) return output;
	if (!data.description.isProperNoun && !sData.displayAsAction)
		output += `The ${name.toLowerCase()}'s spellcasting ability is ${fullSpellAbilityName(sData.spellCastingAbility)} (spell save DC ${spellDc(true, data)}, ${spellAttackBonus(true, data)} to hit with spell attacks). It can innately cast the following spells${componentsString(sData.noComponentsOfType)}:`;
	else if (!data.description.isProperNoun && sData.displayAsAction)
		output += `The ${name.toLowerCase()} casts one of the following spells${componentsString(sData.noComponentsOfType)} and using ${fullSpellAbilityName(sData.spellCastingAbility)} as the spellcasting ability (spell save DC ${spellDc(true, data)}, ${spellAttackBonus(true,data)} to hit with spell attacks).`;
	else if (data.description.isProperNoun && !sData.displayAsAction)
		output += `${name}'s spellcasting ability is ${fullSpellAbilityName(sData.spellCastingAbility)} (spell save DC ${spellDc(true, data)}, ${spellAttackBonus(true, data)} to hit with spell attacks). ${name} can innately cast the following spells${componentsString(sData.noComponentsOfType)}:`;
	else if (data.description.isProperNoun && sData.displayAsAction)
		output += `${name} casts one of the following spells${componentsString(sData.noComponentsOfType)} and using ${fullSpellAbilityName(sData.spellCastingAbility)} as the spellcasting ability (spell save DC ${spellDc(true, data)}, ${spellAttackBonus(true, data)} to hit with spell attacks).`;

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
