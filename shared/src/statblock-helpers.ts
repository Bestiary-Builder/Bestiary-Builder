import type {Stat, Statblock, SenseEntity, SpeedEntity, InnateSpells, CasterSpells, FeatureEntity} from "./types";

export const SKILLS_BY_STAT = {
	str: ["athletics", "strength"],
	dex: ["acrobatics", "sleightOfHand", "stealth", "initiative", "dexterity"],
	con: ["constitution"],
	int: ["arcana", "history", "investigation", "nature", "religion", "intelligence"],
	wis: ["animalHandling", "insight", "medicine", "perception", "survival", "wisdom"],
	cha: ["deception", "intimidation", "performance", "persuasion", "charisma"]
} as {[key in Stat]: string[]};

export const nthSuffix = (number: number) => {
	switch (number) {
		case 1:
			return "1st";
		case 2:
			return "2nd";
		case 3:
			return "3rd";
		default:
			return number.toString() + "th";
	}
};

export const hpCalc = (data: Statblock): number => {
	if (data.defenses.hp.override) return data.defenses.hp.override;
	return Math.floor(data.defenses.hp.numOfHitDie * ((data.defenses.hp.sizeOfHitDie + 1) / 2 + statCalc("con", data)));
};

export const statCalc = (stat: string | null, data: Statblock) => {
	if (!stat) return 0;
	return Math.floor(data.abilities.stats[stat] / 2) - 5;
};

export const fullSpellAbilityName = (abi: Stat | null) => {
	if (abi == "str") return "Strength";
	if (abi == "dex") return "Dexterity";
	if (abi == "con") return "Constitution";
	if (abi == "wis") return "Wisdom";
	if (abi == "int") return "Intelligence";
	if (abi == "cha") return "Charisma";
	return "Spellcasting Ability not found.";
};

export const componentsString = (comp: Statblock["spellcasting"]["innateSpells"]["noComponentsOfType"]) => {
	comp.sort();
	if (comp.length == 0) return "";
	if (comp.length == 3) return ", requiring no components";
	if (comp.length == 2) {
		let only = "material";
		if (!comp.includes("Verbal")) only = "verbal";
		if (!comp.includes("Somatic")) only = "somatic";

		return `, requiring only ${only} components`;
	}
	return `, requiring no ${comp[0].toLowerCase()} components`;
};

export const crAsString = (cr: number) => {
	if (cr == 0.125) return "1/8";
	if (cr == 0.25) return "1/4";
	if (cr == 0.5) return "1/2";
	return cr.toString();
};

export const ppCalc = (data: Statblock) => {
	if (data.misc.passivePerceptionOverride !== null) return data.misc.passivePerceptionOverride;
	else {
		let skills = data.abilities.skills;
		if (skills) {
			for (let skill of skills) {
				if (skill.skillName == "Perception") {
					if (skill.override || skill.override == 0) return 10 + skill.override;
					if (skill.isHalfProficient) return 10 + statCalc("wis", data) + Math.floor(data.core.proficiencyBonus / 2);
					if (skill.isProficient) return 10 + statCalc("wis", data) + data.core.proficiencyBonus;
					if (skill.isExpertise) return 10 + statCalc("wis", data) + data.core.proficiencyBonus * 2;
					break;
				}
			}
		}
	}
	return 10 + statCalc("wis", data);
};

export const signedNumber = (number: number) => {
	if (number >= 0) return `+${number}`;
	return `${number}`;
};

export const displaySpeedOrSenses = (data: SenseEntity[] | SpeedEntity[], hasEndingComma = false) => {
	let output = "";
	let filteredLength = data.filter((item) => item.name !== "New speed" && item.name !== "New sense").length;
	for (const [index, item] of data.entries()) {
		if (item.name === "New speed" || item.name === "New sense") continue;
		if (item.name != "Walk") output += item.name.toLowerCase() + " ";
		output += item.value;
		if (item.unit != "none") output += item.unit + ".";
		if (item.comment) output += ` (${item.comment})`;
		if (hasEndingComma || (filteredLength != 1 && index != filteredLength - 1)) output += ", ";
	}
	return output;
};

export const spellDc = (innate = false, data: Statblock) => {
	let castingData: InnateSpells | CasterSpells;
	if (innate) castingData = data.spellcasting.innateSpells;
	else castingData = data.spellcasting.casterSpells;

	if (castingData.spellDcOverride) return castingData.spellDcOverride;

	if (innate) return 8 + statCalc(castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
	else if ("spellCastingAbilityOverride" in castingData) return 8 + statCalc(castingData.spellCastingAbilityOverride, data) + data.core.proficiencyBonus;
	else return 8 + statCalc(castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
};

export const spellAttackBonus = (innate = false, data: Statblock) => {
	let castingData;
	if (innate) castingData = data.spellcasting.innateSpells;
	else castingData = data.spellcasting.casterSpells;

	let bonus = 0;
	if (castingData.spellBonusOverride || castingData.spellBonusOverride === 0) bonus = castingData.spellBonusOverride;
	else {
		if (innate && castingData.spellCastingAbility) bonus = statCalc(castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
		else bonus = statCalc(castingData.spellCastingAbilityOveride ?? castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
	}
	return bonus;
};

// Adapted from: https://github.com/avrae/avrae/blob/master/cogs5e/models/homebrew/bestiary.py#L273
const AVRAE_ATTACK_OVERRIDES_RE = new RegExp("<avrae hidden>(?:(?<simple>(.*?)\\|([+-]?\\d*)\\|(.*?))|(?<freeform>.*?))</avrae>", "gsi");
const JUST_DAMAGE_RE = new RegExp(/[+-]?\d+ \((.+?)\) (\w+) damage/, "i");
const ATTACK_PARSER_RE = new RegExp(
	/(?:\*)?(?:\w+ ){1,4}Attack:(?:\*)? (?<attackBonus>[+-]?\d+) to hit, .*?(?:\*)?Hit:(?:\*)? [+-]?(?:\d+ \((?<damageDiceBase>.+?)\)|(?<damageIntBase>\d+)) (?<damageTypeBase>[aA-zZ ]+) damage[., ]??(?: in melee[.,]?? or [+-]?(?:\d+ \((?<damageRangedDice>.+?)\)|(?<damageRangedInt>\d+)) (?<damageTypeRanged>[aA-zZ ]+) damage at range[,.]?)?(?:,? or [+-]?(?:\d+ \((?<damageDiceVers>.+?)\)|(?<damageIntVers>\d+)) (?<damageTypeVers>[aA-zZ ]+) damage if used with two hands(?: to make a melee attack)?)?(?:,? (?:plus|and) [+-]?(?:\d+ \((?<damageBonusDice>.+?)\)|(?<damageBonusInt>\d+)) (?<damageTypeBonus>[aA-zZ ]+) damage)?/,
	"i"
);
import YAML from "yaml";

export function parseDescIntoAutomation(text: string, name = "", activationType: number): [FeatureEntity["automation"], null | string] {
	if (activationType < 1) activationType = 1;
	// find attack overrides through <avrae hidden> / </hidden> text. Currently no support for simple group (nobody uses it anyway)
	const override_matches = Array.from(text.matchAll(AVRAE_ATTACK_OVERRIDES_RE), (match) => match.groups?.freeform);
	// parse normal weapon attack into automation
	const attack_match = text.match(ATTACK_PARSER_RE);
	// find features that are just autohit damage
	const just_damage_match = text.match(JUST_DAMAGE_RE);

	// go in priority to override -> attack with hit -> just damage
	if (override_matches.length > 0) {
		for (let m of override_matches) {
			try {
				return [YAML.parse(m ?? ""), null];
			} catch {
				return [null, `${name}: Attempted to parse into Avrae Automation but an error occured.`];
			}
		}
	} else if (attack_match?.groups) {
		let attacks = [];
		// again adapted from avrae repo above
		const groups = attack_match.groups;

		const attackBonus = groups.attackBonus.replace("+", "");

		// Bonus damage
		let bonus = "";
		if (groups.damageTypeBonus && (groups.damageBonusInt || groups.damageBonusDice)) {
			bonus = ` + ${groups.damageBonusInt ?? groups.damageBonusDice} [${groups.damageTypeBonus}]`;
		}

		if (groups.damageTypeVers && (groups.damageIntVers || groups.damageDiceVers)) {
			let damage = `${groups.damageIntVers ?? groups.damageDiceVers} [${groups.damageTypeVers}]` + bonus;
			attacks.push({
				name: `2-Handed ${name}`,
				automation: [
					{
						type: "target",
						target: "each",
						effects: [
							{
								type: "attack",
								hit: [
									{
										type: "damage",
										damage: damage,
										overheal: false
									}
								],
								miss: [],
								attackBonus: attackBonus
							}
						]
					},
					{
						type: "text",
						text: text,
						title: "Effect"
					}
				],
				_v: 2,
				activation_type: activationType
			});
		}

		if (groups.damageTypeRanged && (groups.damageRangedInt || groups.damageRangedDice)) {
			let damage = `${groups.damageRangedInt ?? groups.damageRangedDice} [${groups.damageTypeRanged}]` + bonus;
			attacks.push({
				name: `Ranged ${name}`,
				automation: [
					{
						type: "target",
						target: "each",
						effects: [
							{
								type: "attack",
								hit: [
									{
										type: "damage",
										damage: damage,
										overheal: false
									}
								],
								miss: [],
								attackBonus: attackBonus
							}
						]
					},
					{
						type: "text",
						text: text,
						title: "Effect"
					}
				],
				_v: 2,
				activation_type: activationType
			});
		}

		let damage = `${groups.damageIntBase ?? groups.damageDiceBase} [${groups.damageTypeBase}]` + bonus;
		attacks.push({
			name: name,
			automation: [
				{
					type: "target",
					target: "each",
					effects: [
						{
							type: "attack",
							hit: [
								{
									type: "damage",
									damage: damage,
									overheal: false
								}
							],
							miss: [],
							attackBonus: attackBonus
						}
					]
				},
				{
					type: "text",
					text: text,
					title: "Effect"
				}
			],
			_v: 2,
			activation_type: activationType
		});

		if (!attacks) return [null, `${name}: Attempted to parse into Avrae Automation but an error occured.`];
		if (attacks.length == 1) return [attacks[0], null];
		return [attacks, null];
	} else if (just_damage_match) {
		if (text.includes(" DC ")) return [null, `${name}: Cannot generate automation for save-based attacks.`];
		return [
			{
				name: name,
				automation: [
					{type: "target", target: "each", effects: [{type: "damage", damage: just_damage_match[1] + `[${just_damage_match[2]}]`, overheal: false}]},
					{type: "text", text: text, title: "Effect"}
				],
				_v: 2,
				activation_type: activationType
			},
			null
		];
	}

	return [null, `${name}: Did not Generate Avrae Automation.`];
}

export function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
