import type { FeatureEntity } from "@/generic/types"
import YAML from "yaml";

export function abilityParser(fData: any, activationType: number): [FeatureEntity[], string[]] {
	let output = [] as FeatureEntity[];
	let notices = [] as string[];
	for (let f of fData ?? []) {
		let name = markdownReplacer(f.name);

		// if critterDB, don't attempt to parse spellcasting in this step.
		if (f.description && name.toLowerCase().includes("spellcasting")) continue;

		//f.entries for 5etools, f.description for critterdb
		let description = descParser(f.entries || f.description.replaceAll("<i>", "*").replaceAll("<b>", "**").replaceAll("</i>", "*").replaceAll("</b>", "**"));
		let [automation, notice] = parseDescIntoAutomation(description, name, activationType);
		if (notice) notices.push(notice);
		output.push({
			name: name,
			description: description.replace(/<avrae hidden>.*?<\/avrae>/gis, ""),
			automation: automation
		});
	}
	return [output, notices];
}

export function descParser(dData: any) {
	if (typeof dData == "string") return dData;
	let output = [];
	for (let d of dData) {
		if (typeof d == "string") output.push(markdownReplacer(d));
		if (typeof d == "object") {
			if (d.type == "list") {
				for (let i of d.items) {
					output.push(`<br><b class="indent">${markdownReplacer(i.name)}</b> ${markdownReplacer(i.entry || i?.entries.join("\n"))}`);
				}
			}
		}
	}
	return output.join("\n");
}

export function markdownReplacer(text: string): string {
	text = text
		.replace("{@atk mw}", "*Melee Weapon Attack:*")
		.replace("{@atk rw}", "*Ranged Weapon Attack:*")
		.replace("{@h}", "*Hit:* ")
		.replace(/\{@damage\s+([^}]+)\}/g, "$1")
		.replace(/\{@dc\s+([^}]+)\}/g, "DC $1")
		.replace(/\{@dice\s+([^}]+)\}/g, "$1")
		.replace(/\{@spell\s+([^}]+)\}/g, "$1")
		.replace(/\{@item\s+([^}]+)\}/g, "$1")
		.replace(/\{@condition\s+([^}]+)\}/g, "<u>$1</u>")
		.replace(/\{@recharge\s+(\d+)\}/g, "(Recharge $1-6)")
		.replace(/\{@quickref\s+[^|]+\|[^|]+\|[^|]+\|[^|]+\|([^}]+)\}/, "$1")
		.replace("Recharge 6-6", "Recharge 6")
		// @ts-ignore
		.replace(/\{@hit\s+(-?\d+)\}/g, (_, number) => (number >= 0 ? `+${number}` : number));

	return text;
}

// Adapted from: https://github.com/avrae/avrae/blob/master/cogs5e/models/homebrew/bestiary.py#L273
const AVRAE_ATTACK_OVERRIDES_RE = new RegExp("<avrae hidden>(?:(?<simple>(.*?)\\|([+-]?\\d*)\\|(.*?))|(?<freeform>.*?))</avrae>", "gsi");
const JUST_DAMAGE_RE = new RegExp(/[+-]?\d+ \((.+?)\) (\w+) damage/, "i");
const ATTACK_PARSER_RE = new RegExp(
	/(?:\*)?(?:\w+ ){1,4}Attack:(?:\*)? (?<attackBonus>[+-]?\d+) to hit, .*?(?:\*)?Hit:(?:\*)? [+-]?(?:\d+ \((?<damageDiceBase>.+?)\)|(?<damageIntBase>\d+)) (?<damageTypeBase>[aA-zZ ]+) damage[., ]??(?: in melee[.,]?? or [+-]?(?:\d+ \((?<damageRangedDice>.+?)\)|(?<damageRangedInt>\d+)) (?<damageTypeRanged>[aA-zZ ]+) damage at range[,.]?)?(?:,? or [+-]?(?:\d+ \((?<damageDiceVers>.+?)\)|(?<damageIntVers>\d+)) (?<damageTypeVers>[aA-zZ ]+) damage if used with two hands(?: to make a melee attack)?)?(?:,? (?:plus|and) [+-]?(?:\d+ \((?<damageBonusDice>.+?)\)|(?<damageBonusInt>\d+)) (?<damageTypeBonus>[aA-zZ ]+) damage)?/,
	"i"
);

export function parseDescIntoAutomation(text: string, name = "", activationType: number): [FeatureEntity["automation"], null | string] {
	if (activationType < 1) activationType = 1
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
