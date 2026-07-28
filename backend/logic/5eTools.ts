import type { CasterSpells, InnateSpellsList, SkillsEntity, SpellSlotList, Stat, Statblock } from "~/shared";
import splitOnFirst from "split-on-first";
import { app } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { abilityParser, buildSpeedEntries, detectCastingClass, markdownReplacer, parseSenses } from "@/utilities/parsing";
import { capitalizeFirstLetter, defaultStatblock, getXPbyCR, SKILLS_BY_STAT } from "~/shared";
import { spellListFlattened } from "./staticData";

function parseSavingThrow(mod: any, abilityScore: number, proficiencyBonus: number) {
	if (!mod)
		return { isProficient: false, override: null, adv: null };

	const saveBonus = proficiencyBonus + (Math.floor(abilityScore / 2) - 5);
	if (mod === saveBonus)
		return { isProficient: true, override: null, adv: null };
	if (mod !== saveBonus)
		return { isProficient: false, override: Number.parseInt(mod.toString()), adv: null };

	return { isProficient: false, override: null, adv: null };
}

function parseDamageTypes(values: any, type: "immune" | "resist" | "vulnerable") {
	const output: string[] = [];

	if (!values)
		return output;

	for (const value of values) {
		if (typeof value === "string") {
			output.push(capitalizeFirstLetter(value));
			continue;
		}

		const damageTypes = value[type];
		let modifier = "";
		if (value.note) {
			if (value.note.includes("from magic weapons"))
				modifier += "Magical ";
			if (value.note.includes("from silvered weapons"))
				modifier += "Silvered ";
			if (value.note.includes("from adamantine weapons"))
				modifier += "Adamantine ";

			if (value.note.includes("from nonmagical attacks"))
				modifier += "Nonmagical ";
			if (value.note.includes("from nonsilvered attacks"))
				modifier += "Nonsilvered ";
			if (value.note.includes("from nonadamantine attacks"))
				modifier += "Nonadamantine ";

			if (value.note.includes("that aren't magical"))
				modifier += "Nonmagical ";
			if (value.note.includes("that aren't silvered"))
				modifier += "Nonsilvered ";
			if (value.note.includes("that aren't adamantine"))
				modifier += "Nonadamantine ";

			if (value.note.includes("not made with magical"))
				modifier += "Nonmagical ";
			if (value.note.includes("not made with silvered"))
				modifier += "Nonsilvered ";
			if (value.note.includes("not made with adamantine"))
				modifier += "Nonadamantine ";
		}

		for (const damageType of damageTypes || [])
			output.push(`${modifier}${capitalizeFirstLetter(damageType)}`);
	}

	return output;
}

app.post("/api/5etools-import", async (req, res) => {
	try {
		const { data: input } = req.body;
		const [data, notices] = parseFrom5eTools(input);
		const oldStats = { ...data };
		const newData = {} as Statblock;
		for (const key in defaultStatblock) {
			// @ts-expect-error untyped
			newData[key] = { ...defaultStatblock[key], ...oldStats[key] };
		}
		return res.json({
			stats: newData,
			notices
		});
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

export function parseFrom5eTools(data: any): [Statblock, { [key: string]: string[] }] {
	const outputData = {} as Statblock;
	outputData.description = {
		name: data.name,
		image: "",
		description: "",
		cr: Number.parseInt(data.cr?.cr ?? data.cr),
		isProperNoun: data.isNamedCreature ?? false,
		environment: (data?.environment ?? []).join(", "),
		faction: "",
		alignment: (() => {
			const nameMap = {
				L: "Lawful",
				N: "Neutral",
				NX: "Neutral",
				NY: "Neutral",
				C: "Chaotic",
				G: "Good",
				E: "Evil",
				U: "Unaligned",
				A: "Any"
			};
			// @ts-expect-error untyped
			return (data?.alignmentPrefix ?? "") + (data.alignment ?? []).map(a => nameMap[a]).join(" ");
		})(),
		xp: getXPbyCR(Number.parseInt(data.cr?.cr ?? data.cr))
	};

	outputData.core = {
		proficiencyBonus: Math.max(2, Math.min(9, Math.floor((outputData.description.cr + 3) / 4)) + 1),
		race: (() => {
			const typeData = data.type;
			if (typeof typeData == "string")
				return capitalizeFirstLetter(typeData);
			const baseType = typeData?.type || "";

			if (!typeData?.tags || typeData?.tags.length === 0)
				return capitalizeFirstLetter(baseType);

			if (typeData.type.choose) {
				return `${capitalizeFirstLetter(typeData.type.choose[0])}`;
			}
			if (typeof typeData?.tags[0] == "string")
				return `${capitalizeFirstLetter(baseType)} (${typeData?.tags.map((a: string) => capitalizeFirstLetter(a)).join(" ")})`;

			if (typeof typeData?.tags[0] == "object")
				return `${capitalizeFirstLetter(baseType)} ${typeData?.tags.map((t: any) => `${capitalizeFirstLetter(t.prefix)}} ${capitalizeFirstLetter(t.tag)}`).join(", ")}`;

			return "";
		})(),
		size: (() => {
			const sizeMap = {
				F: "Fine",
				D: "Diminutive",
				T: "Tiny",
				S: "Small",
				M: "Medium",
				L: "Large",
				H: "Huge",
				G: "Gargantuan",
				C: "Collosal",
				V: "Varies"
			};
			// @ts-expect-error untyped
			return (data?.size ?? []).map((s: string) => sizeMap[s]).join(" or ");
		})(),
		languages: (() => {
			if (!data.languages)
				return [];
			return data?.languages.filter((l: string) => !l.includes("telepathy"));
		})(),
		senses: parseSenses(data.senses),
		speed: (() => {
			const fly = Number.parseInt(data?.speed?.fly) || data?.speed?.fly?.number || 0;
			const isHover = data?.speed?.canHover || false;
			const swim = Number.parseInt(data?.speed?.swim) || data?.speed?.swim?.number || 0;
			const burrow = Number.parseInt(data?.speed?.burrow) || data?.speed?.burrow?.number || 0;
			const climb = Number.parseInt(data?.speed?.climb) || data?.speed?.climb?.number || 0;
			const walk = Number.parseInt(data?.speed?.walk) || data?.speed?.walk?.number || 0;

			return buildSpeedEntries({ walk, fly, climb, swim, burrow, hover: isHover });
		})()
	};

	outputData.abilities = {
		stats: {
			str: data.str,
			dex: data.dex,
			con: data.con,
			int: data.int,
			wis: data.wis,
			cha: data.cha
		},
		saves: {
			str: parseSavingThrow(data?.save?.str ?? null, data.str, outputData.core.proficiencyBonus),
			dex: parseSavingThrow(Number.parseInt(data?.save?.dex) ?? null, data.dex, outputData.core.proficiencyBonus),
			con: parseSavingThrow(Number.parseInt(data?.save?.con) ?? null, data.con, outputData.core.proficiencyBonus),
			int: parseSavingThrow(Number.parseInt(data?.save?.int) ?? null, data.int, outputData.core.proficiencyBonus),
			wis: parseSavingThrow(Number.parseInt(data?.save?.wis) ?? null, data.wis, outputData.core.proficiencyBonus),
			cha: parseSavingThrow(Number.parseInt(data?.save?.cha) ?? null, data.cha, outputData.core.proficiencyBonus)
		},
		skills: (() => {
			if (!data.skill)
				return [];

			const output = [] as SkillsEntity[];

			for (const sk in data.skill) {
				const name = capitalizeFirstLetter(sk.replace("animal handling", "Animal Handling").replace("sleight of hand", "Sleight of Hand"));
				const shortname = name.replace(" ", "").toLowerCase();

				let ability;
				for (const sk2 in SKILLS_BY_STAT) {
					if (SKILLS_BY_STAT[sk2 as Stat].includes(shortname)) {
						ability = sk2 as Stat;
						break;
					}
				}
				if (!ability)
					continue;

				const isProf = Number.parseInt(data.skill[sk]) === outputData.core.proficiencyBonus + (Math.floor(data[ability] / 2) - 5);
				const isExpertise = Number.parseInt(data.skill[sk]) === Math.floor(outputData.core.proficiencyBonus * 2) + (Math.floor(data[ability] / 2) - 5);
				const isHalfProficient = Number.parseInt(data.skill[sk]) === Math.floor(outputData.core.proficiencyBonus / 2) + (Math.floor(data[ability] / 2) - 5);

				let override = null;
				if (!isProf && !isExpertise && !isHalfProficient)
					override = Number.parseInt(data.skill[sk]);

				output.push({
					skillName: name,
					isProficient: isProf,
					isExpertise,
					isHalfProficient,
					override,
					adv: null
				});
			}
			return output;
		})()
	};

	outputData.defenses = {
		hp: {
			numOfHitDie: Number.parseInt((data.hp.formula || "1d6").split("d")[0]),
			sizeOfHitDie: Number.parseInt(((data.hp.formula || "1d6").match(/\dd(\d+)/) || [])[1]) || 6,
			// critterDB only handles this on homebrew monsters.)
			override: data.hp.special || null
		},
		ac: {
			ac: Number.parseInt(data.ac[0]) || Number.parseInt(data.ac[0].ac),
			acSource: (() => {
				if (typeof data.ac[0] != "object")
					return "";
				if (data.ac[0].from)
					return markdownReplacer(data.ac[0].from[0] ?? "");
				else
					return "";
			})()
		},
		immunities: parseDamageTypes(data.immune, "immune"),
		resistances: parseDamageTypes(data.resist, "resist"),
		vulnerabilities: parseDamageTypes(data.vulnerable, "vulnerable"),
		conditionImmunities: (() => {
			const output: string[] = [];
			for (const x of data?.conditionImmune || []) {
				if (typeof (x) === "string")
					output.push(capitalizeFirstLetter(x));
				if (typeof (x) === "object") {
					output.push(`${x.conditionImmune[0]} (${x.note})`);
				}
			}
			return output;
		})()
	};

	let innateSpellcasting: any = [];
	let casterSpellcasting: any = [];
	let innateSpellcastingAbility = null;
	let hasInnateSpellcastingAbility = false;
	let isPsionicSpellcasting = false;
	// Existing fields use the last innate record except for the ability, which uses the first.
	for (const spellcasting of data?.spellcasting ?? []) {
		const isInnate = (spellcasting.name.includes("Innate Spellcasting") || ((spellcasting?.will || []).length > 0 || (Object.keys(spellcasting?.daily || {}) || []).length > 0)) && !((spellcasting?.hidden || []).length > 0);
		if (isInnate) {
			innateSpellcasting = spellcasting;
			if (!hasInnateSpellcastingAbility) {
				innateSpellcastingAbility = spellcasting.ability;
				hasInnateSpellcastingAbility = true;
			}
		}
		if (spellcasting.name.includes("Spellcasting") && !spellcasting.name.includes("Innate"))
			casterSpellcasting = spellcasting;
		if (spellcasting.name.includes("Innate Spellcasting (Psionics)"))
			isPsionicSpellcasting = true;
	}

	outputData.spellcasting = {
		innateSpells: {
			spellList: (() => {
				const output = {
					0: [],
					1: [],
					2: [],
					3: []
				} as InnateSpellsList;
				if (!innateSpellcasting)
					return output;

				if (innateSpellcasting.will) {
					if (!innateSpellcasting.daily)
						innateSpellcasting.daily = { "0e": innateSpellcasting.will };
					else innateSpellcasting.daily["0e"] = innateSpellcasting.will;
				}

				if (innateSpellcasting.daily) {
					for (const l in innateSpellcasting.daily) {
						const level = Number.parseInt(l.replace("e", ""));
						if (level >= 0 && level < 4) {
							for (const sp of innateSpellcasting.daily[l]) {
								let t = sp.replace("{@spell ", "").replace(/\|([^\s}]*)/, "");
								t = splitOnFirst(t, "}");
								if (t) {
									output[level].push({
										spell: spellListFlattened.find((item: string) => item.toLowerCase() === t[0].toLowerCase()) || t[0],
										comment: markdownReplacer(t[1].replace(" (", "").replace(")", "") ?? "")
									});
								}
							}
						}
					}
				}
				return output;
			})(),
			spellDcOverride: (() => {
				if (!innateSpellcasting || !innateSpellcasting.headerEntries)
					return null;

				const match = innateSpellcasting.headerEntries[0].match(/\{@dc\s+(\d+)\}/);
				const dc = match ? Number.parseInt(match[1]) : null;
				if (!dc)
					return null;
				if (dc !== 8 + outputData.core.proficiencyBonus + (Math.floor(data[innateSpellcasting.ability] / 2) - 5))
					return dc;
				return null;
			})(),
			spellBonusOverride: (() => {
				if (!innateSpellcasting || !innateSpellcasting.headerEntries)
					return null;

				const match = innateSpellcasting.headerEntries[0].match(/\{@hit\s+(\d+)\}/);
				const hit = match ? Number.parseInt(match[1]) : null;
				if (!hit)
					return null;

				if (hit !== outputData.core.proficiencyBonus + (Math.floor(data[innateSpellcasting.ability] / 2) - 5))
					return hit;
				return null;
			})(),
			displayAsAction: (() => {
				if (!innateSpellcasting || !innateSpellcasting.displayAs)
					return false;
				return innateSpellcasting?.displayAs === "action";
			})(),
			noComponentsOfType: (() => {
				// this is the default
				if (!innateSpellcasting || !innateSpellcasting.headerEntries)
					return ["Material", "Verbal", "Somatic"];

				const text = innateSpellcasting.headerEntries[0];
				if (text.includes("requiring no components") || text.includes("requiring no spell components"))
					return ["Material", "Somatic", "Verbal"];
				if (text.includes("requiring only verbal"))
					return ["Material", "Somatic"];
				if (text.includes("requiring only somatic"))
					return ["Material", "Verbal"];
				if (text.includes("requiring only material"))
					return ["Somatic", "Verbal"];
				if (text.includes("requiring no material"))
					return ["Material"];
				if (text.includes("requiring no somatic"))
					return ["Somatic"];
				if (text.includes("requiring no verbal"))
					return ["Verbal"];
				return ["Material", "Somatic", "Verbal"];
			})(),
			spellCastingAbility: innateSpellcastingAbility,
			isPsionics: isPsionicSpellcasting,
			customDescription: ""
		},
		casterSpells: {
			casterLevel: (() => {
				if (!casterSpellcasting || !casterSpellcasting.headerEntries)
					return null;

				const regex = /\b(\w+-level)\b/;
				const match = casterSpellcasting.headerEntries[0].match(regex);

				return match ? Math.max(0, Math.min(20, Number.parseInt(match[1].replace("-level", "").replace("st", "").replace("nd", "").replace("rd", "").replace("th", "")))) : null;
			})(),
			castingClass: (() => {
				if (!casterSpellcasting || !casterSpellcasting.headerEntries)
					return null;

				return detectCastingClass(casterSpellcasting.headerEntries[0]);
			})(),
			spellList: (() => {
				const output = [[], [], [], [], [], [], [], [], [], []] as CasterSpells["spellList"];

				if (!casterSpellcasting.spells)
					return output;

				for (const l in casterSpellcasting.spells) {
					for (const sp of casterSpellcasting.spells[l].spells) {
						let t = sp.replace("{@spell ", "");
						t = t.split("}");
						if (t)
							output[Number.parseInt(l)].push(spellListFlattened.find((item: string) => item.toLowerCase() === t[0].toLowerCase()) || t[0]);
					}
				}

				return output;
			})(),
			spellSlotList: (() => {
				const output = {} as SpellSlotList;

				if (!casterSpellcasting.spells)
					return output;

				for (const l in casterSpellcasting.spells) {
					if (Number.parseInt(l) === 0)
						continue;
					output[Number.parseInt(l)] = casterSpellcasting.spells[l].slots ?? 0;
				}
				return output;
			})(),
			spellBonusOverride: (() => {
				if (!casterSpellcasting || !casterSpellcasting.headerEntries)
					return null;

				const match = casterSpellcasting.headerEntries[0].match(/\{@hit\s+(\d+)\}/);
				const hit = match ? Number.parseInt(match[1]) : null;
				if (!hit)
					return null;

				if (hit !== outputData.core.proficiencyBonus + (Math.floor(data[casterSpellcasting.ability] / 2) - 5))
					return hit;
				return null;
			})(),
			spellDcOverride: (() => {
				if (!casterSpellcasting || !casterSpellcasting.headerEntries)
					return null;

				const match = casterSpellcasting.headerEntries[0].match(/\{@dc\s+(\d+)\}/);
				const dc = match ? Number.parseInt(match[1]) : null;
				if (!dc)
					return null;
				if (dc !== 8 + outputData.core.proficiencyBonus + (Math.floor(data[casterSpellcasting.ability] / 2) - 5))
					return dc;
				return null;
			})(),
			spellCastingAbilityOverride: null,
			spellCastingAbility: casterSpellcasting.ability || null,
			displayAsAction: false,
			customDescription: ""
		}
	};

	outputData.misc = {
		legActionsPerRound: (() => {
			if (data?.legendaryActions)
				return data?.legendaryActions;
			if ((data?.legendary ?? []).length > 0)
				return 3;
			return 0;
		})(),
		telepathy: (() => {
			if (!data.languages)
				return 0;
			for (const s of data?.languages ?? []) {
				if (s.includes("telepathy"))
					return Number.parseInt(s.match(/\d+(\.\d+)?/g)[0] || "0");
			}

			return 0;
		})(),
		passivePerceptionOverride: (() => {
			const num = data.passive;

			if (data?.skill?.perception) {
				if (10 + Number.parseInt(data?.skill?.perception) === num)
					return null;
			}

			if (10 + (Math.floor(data.wis / 2) - 5) === num)
				return null;

			return num;
		})(),
		featureHeaderTexts: {
			features: "",
			actions: (data?.actionHeader ?? []).join("\n") ?? "",
			bonus: (data?.bonusHeader ?? []).join("\n") ?? "",
			reactions: (data?.reactionHeader ?? []).join("\n") ?? "",
			legendary: (data?.legendaryHeader ?? [defaultStatblock.misc.featureHeaderTexts.legendary]).join("\n"),
			lair: defaultStatblock.misc.featureHeaderTexts.lair,
			mythic: (data?.mythicHeader ?? []).join("\n") ?? defaultStatblock.misc.featureHeaderTexts.mythic,
			regional: defaultStatblock.misc.featureHeaderTexts.regional
		}
	};
	const Traits = data.trait;
	const Actions = (data.action ?? []).concat(((data?.spellcasting as any) ?? []).filter((i: any) => ((i?.hidden || []).length > 0) && i?.displayAs === "action"));
	const Bonus = (data.bonus ?? []).concat(((data?.spellcasting as any) ?? []).filter((i: any) => ((i?.hidden || []).length > 0) && i?.displayAs === "bonus"));
	const Reaction = (data.reaction ?? []).concat(((data?.spellcasting as any) ?? []).filter((i: any) => ((i?.hidden || []).length > 0) && i?.displayAs === "reaction"));
	const Legendary = (data.legendary ?? []).concat(((data?.spellcasting as any) ?? []).filter((i: any) => ((i?.hidden || []).length > 0) && i?.displayAs === "legendary"));
	const Lair = data.lair;
	const Mythic = data.mythic;

	const [features, FnoteList] = abilityParser(Traits, 2);
	const [actions, AnoteList] = abilityParser(Actions, 1);
	const [bonus, BnoteList] = abilityParser(Bonus, 3);
	const [reactions, RnoteList] = abilityParser(Reaction, 4);
	const [legendary, LenoteList] = abilityParser(Legendary, 9);
	const [lair, LanoteList] = abilityParser(Lair, 11);
	const [mythic, MnoteList] = abilityParser(Mythic, 10);
	const [regional, RenoteList] = [[], []];

	const notices = {
		features: FnoteList,
		actions: AnoteList,
		bonus: BnoteList,
		reactions: RnoteList,
		legendary: LenoteList,
		lair: LanoteList,
		mythic: MnoteList,
		regional: RenoteList
	};

	outputData.features = {
		features,
		actions,
		bonus,
		reactions,
		legendary,
		lair,
		mythic,
		regional
	};
	return [outputData, notices];
}
