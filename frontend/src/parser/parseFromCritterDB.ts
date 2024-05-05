import {toast} from "@/main";
import {type CasterSpells, type Statblock, defaultStatblock, spellListFlattened, type SpellSlotEntity, type SkillsEntity, type Stat, type SpellCasting, type InnateSpellsEntity, type SpeedEntity, type SenseEntity} from "~/shared";

import {abilityParser, descParser, parseDescIntoAutomation, capitalizeFirstLetter} from "./utils";

let tData = [{}];
export function parseFromCritterDB(data = tData[0] as any): [Statblock, {[key: string]: string[]} | null] {
	let outputData = {} as Statblock;
	if (!data.flavor || !data.stats) {
		toast.error("This creature is missing key elements of its statblock. Failed to import.");
		return [outputData, null];
	}
	outputData.description = {
		name: data.name,
		description: data.flavor.description.replaceAll("<i>", "*").replaceAll("</i>", "*").replaceAll("<b>", "**").replaceAll("</b>", "**"),
		isProperNoun: data.flavor.nameIsProper,
		faction: data.flavor.faction,
		environment: data.flavor.environment,
		image: data.flavor.imageUrl,
		alignment: data.stats.alignment,
		cr: data.stats.challengeRating ?? 0,
		xp: data.stats.experiencePoints ?? 0
	};

	outputData.core = {
		proficiencyBonus: data.stats.proficiencyBonus || Math.max(2, Math.min(9, Math.floor((outputData.description.cr + 3) / 4)) + 1),
		race: data.stats.race,
		size: data.stats.size,
		languages: data.stats.languages,
		senses: (() => {
			let output: SenseEntity[] = [];
			for (let s of data.stats.senses ?? []) {
				let value = parseInt(s.replace(/[a-zA-Z]/g, ""));
				let name = "";
				let isBlind = false;

				if (s.toLowerCase().includes("dark")) name = "Darkvision";
				else if (s.toLowerCase().includes("blind")) {
					name = "Blindsight";
					isBlind = !!(data.stats.senses ?? []).find((str: string) => str.includes("blind beyond this radius"));
				} else if (s.toLowerCase().includes("true")) name = "Truesight";
				else if (s.toLowerCase().includes("tremor")) name = "Tremorsense";

				if (name)
					output.push({
						name: name,
						value: value,
						unit: "ft",
						comment: isBlind ? "blind beyond this radius" : ""
					});
			}
			return output;
		})(),
		speed: (() => {
			let output: SpeedEntity[] = [];
			let fly = parseInt((data?.stats.speed.match(/fly\s*(\d+)\s*ft\.?/) || [])[1]) || 0;
			let isHover = data?.stats?.speed.toLowerCase().includes("hover");
			let swim = parseInt((data?.stats.speed.match(/swim\s*(\d+)\s*ft\.?/) || [])[1]) || 0;
			let burrow = parseInt((data?.stats.speed.match(/burrow\s*(\d+)\s*ft\.?/) || [])[1]) || 0;
			let climb = parseInt((data?.stats.speed.match(/climb\s*(\d+)\s*ft\.?/) || [])[1]) || 0;
			let walk = parseInt((data?.stats.speed.match(/^(\d+)\s*ft\.?/) || [])[1]) || 0;

			if (walk)
				output.push({
					name: "Walk",
					value: walk,
					comment: "",
					unit: "ft"
				});
			if (fly)
				output.push({
					name: "Fly",
					value: fly,
					comment: isHover ? "hover" : "",
					unit: "ft"
				});
			if (climb)
				output.push({
					name: "Climb",
					value: climb,
					comment: "",
					unit: "ft"
				});
			if (swim)
				output.push({
					name: "Swim",
					value: swim,
					comment: "",
					unit: "ft"
				});
			if (burrow)
				output.push({
					name: "Burrow",
					value: burrow,
					comment: "",
					unit: "ft"
				});
			return output;
		})()
	};

	outputData.abilities = {
		stats: {} as any,
		saves: {} as any,
		skills: [] as any
	};

	outputData.abilities.stats = {
		str: data.stats.abilityScores.strength || 10,
		dex: data.stats.abilityScores.dexterity || 10,
		con: data.stats.abilityScores.constitution || 10,
		int: data.stats.abilityScores.intelligence || 10,
		wis: data.stats.abilityScores.wisdom || 10,
		cha: data.stats.abilityScores.charisma || 10
	};

	outputData.abilities.saves = {
		str: (() => {
			for (let s of data.stats.savingThrows) {
				if (s.ability == "strength") {
					return {
						isProficient: s.proficient,
						override: s?.value || null
					};
				}
			}
			return {
				isProficient: false,
				override: null
			};
		})(),
		dex: (() => {
			for (let s of data.stats.savingThrows) {
				if (s.ability == "dexterity") {
					return {
						isProficient: s.proficient,
						override: s?.value || null
					};
				}
			}
			return {
				isProficient: false,
				override: null
			};
		})(),
		con: (() => {
			for (let s of data.stats.savingThrows) {
				if (s.ability == "constitution") {
					return {
						isProficient: s.proficient,
						override: s?.value || null
					};
				}
			}
			return {
				isProficient: false,
				override: null
			};
		})(),
		int: (() => {
			for (let s of data.stats.savingThrows) {
				if (s.ability == "intelligence") {
					return {
						isProficient: s.proficient,
						override: s?.value || null
					};
				}
			}
			return {
				isProficient: false,
				override: null
			};
		})(),
		wis: (() => {
			for (let s of data.stats.savingThrows) {
				if (s.ability == "wisdom") {
					return {
						isProficient: s.proficient,
						override: s?.value || null
					};
				}
			}
			return {
				isProficient: false,
				override: null
			};
		})(),
		cha: (() => {
			for (let s of data.stats.savingThrows) {
				if (s.ability == "charisma") {
					return {
						isProficient: s.proficient,
						override: s?.value || null
					};
				}
			}
			return {
				isProficient: false,
				override: null
			};
		})()
	};

	outputData.abilities.skills = (() => {
		let output = [] as SkillsEntity[];

		const SKILLS_BY_STAT = {
			str: ["athletics"],
			dex: ["acrobatics", "sleightofhand", "stealth"],
			con: [],
			int: ["arcana", "history", "investigation", "nature", "religion"],
			wis: ["animalhandling", "insight", "medicine", "perception", "survival"],
			cha: ["deception", "intimidation", "performance", "persuasion"]
		} as any;

		for (let sk of data.stats.skills) {
			let name = capitalizeFirstLetter(sk.name);
			let shortname = name.replace(" ", "").toLowerCase();

			let ability;
			for (let sk in SKILLS_BY_STAT) {
				if (SKILLS_BY_STAT[sk].includes(shortname)) {
					ability = sk as Stat;
					break;
				}
			}
			if (!ability) continue;

			let isProf = sk.proficient;
			let value = sk.value || NaN;
			let isExpertise = value == Math.floor(outputData.core.proficiencyBonus * 2) + (Math.floor(outputData.abilities.stats[ability] / 2) - 5);
			let isHalfProficient = value == Math.floor(outputData.core.proficiencyBonus / 2) + (Math.floor(outputData.abilities.stats[ability] / 2) - 5);

			output.push({
				skillName: name,
				isProficient: isProf,
				isExpertise: isExpertise,
				isHalfProficient: isHalfProficient,
				override: !isProf && !isExpertise && !isHalfProficient ? sk.value || null : null
			});
		}
		return output;
	})();

	outputData.defenses = {
		hp: {
			numOfHitDie: data.stats.numHitDie || 1,
			sizeOfHitDie: data.stats.hitDieSize || 6,
			// not supported in CritterDB
			override: null
		},
		ac: {
			ac: data.stats.armorClass,
			acSource: data.stats.armorType ?? ""
		},
		conditionImmunities: data.stats.conditionImmunities || [],
		immunities: parseDamageTypes(data.stats.damageImmunities),
		resistances: parseDamageTypes(data.stats.damageResistances),
		vulnerabilities: parseDamageTypes(data.stats.damageVulnerabilities)
	};

	outputData.misc = {
		legActionsPerRound: data.stats.legendaryActionsPerRound || 3,
		telepathy: (() => {
			if (!data.stats.languages) return 0;
			for (let s of data.stats.languages ?? []) {
				if (s.toLowerCase().includes("telepathy")) return parseInt(s.replace(/[a-zA-Z]/g, ""));
			}
			return 0;
		})(),
		passivePerceptionOverride: null,
		featureHeaderTexts: {
			// CritterDB has very little support for this
			features: "",
			actions: "",
			bonus: "",
			reactions: "",
			legendary: data.stats.legendaryActionsDescription.replace("3", "$NUM$").replace("2", "$NUM$").replace("1", "$NUM$") ?? defaultStatblock.misc.featureHeaderTexts.legendary,
			lair: defaultStatblock.misc.featureHeaderTexts.lair,
			mythic: defaultStatblock.misc.featureHeaderTexts.mythic,
			regional: defaultStatblock.misc.featureHeaderTexts.regional
		}
	};

	outputData.spellcasting = {} as SpellCasting;
	outputData.spellcasting.casterSpells = (() => {
		// adapted from https://github.com/avrae/avrae/blob/master/cogs5e/models/homebrew/bestiary.py#L501
		let displayAsAction = false;
		let sData = null;

		for (let a of data.stats.actions) {
			if (a.name.toLowerCase().includes("spellcasting") && !a.name.toLowerCase().includes("innate")) {
				sData = a.description;
				displayAsAction = false;
			}
		}

		if (!sData)
			for (let a of data.stats.additionalAbilities) {
				if (a.name.toLowerCase().includes("spellcasting") && !a.name.toLowerCase().includes("innate")) {
					sData = a.description;
				}
			}
		if (!sData) return defaultStatblock.spellcasting.casterSpells;

		sData = sData.replaceAll("<i>", "").replaceAll("</i>", "").replaceAll("<b>", "").replaceAll("</b>", "");

		const typeMatch = sData.match(/spellcasting ability is (\w+) \(spell save DC (\d+), [+\-](\d+) to hit/);
		if (!typeMatch) return defaultStatblock.spellcasting.casterSpells;

		let dc = typeMatch ? parseInt(typeMatch[2]) : null;
		let bonus = typeMatch ? parseInt(typeMatch[3]) : null;
		const ability: Stat = typeMatch ? typeMatch[1].toLowerCase().slice(0, 3) : null;

		let casterLevel = sData.match(/(\d+)[stndrh]{2}-level/);
		if (!casterLevel) return defaultStatblock.spellcasting.casterSpells;
		casterLevel = parseInt(casterLevel[1]);

		let casterClass: null | CasterSpells["castingClass"] = null;
		if (sData.toLowerCase().includes("wizard")) casterClass = "Wizard";
		else if (sData.toLowerCase().includes("sorcerer")) casterClass = "Sorcerer";
		else if (sData.toLowerCase().includes("bard")) casterClass = "Bard";
		else if (sData.toLowerCase().includes("druid")) casterClass = "Druid";
		else if (sData.toLowerCase().includes("artificer")) casterClass = "Artificer";
		else if (sData.toLowerCase().includes("cleric")) casterClass = "Cleric";
		else if (sData.toLowerCase().includes("warlock")) casterClass = "Warlock";
		else if (sData.toLowerCase().includes("paladin")) casterClass = "Paladin";
		else if (sData.toLowerCase().includes("ranger")) casterClass = "Ranger";

		let defaultAbility: Stat | null = null;
		switch (casterClass) {
			case "Artificer":
			case "Wizard":
				defaultAbility = "int";
				break;
			case "Cleric":
			case "Druid":
			case "Ranger":
				defaultAbility = "wis";
				break;
			default:
				defaultAbility = "cha";
		}

		let prof = outputData.core.proficiencyBonus;
		let mod = Math.floor(outputData.abilities.stats[defaultAbility == ability ? defaultAbility : ability] / 2) - 5;

		if (dc === 8 + prof + mod) dc = null;
		if (bonus === prof + mod) bonus = null;

		let spellList: CasterSpells["spellList"] = [[], [], [], [], [], [], [], [], [], []];
		let spellSlotList: SpellSlotEntity = {};
		const SPELL_INFO_RE = new RegExp(/(?:(?<level>\d)[stndrh]{2}\slevel \((?<slots>\d+) slots?\)|Cantrip(?:s)? \(at will\)): (?<spells>.+)$/, "gmi");
		let spellsInfo: any = Array.from(sData.matchAll(SPELL_INFO_RE));
		for (let l of spellsInfo) {
			// cantrips
			spellList[l.groups?.level || 0] = spellListConstructor(l.groups?.spells);
			if (l.groups?.level && l.groups?.slots) spellSlotList[parseInt(l.groups.level)] = parseInt(l.groups?.slots);
		}

		return {
			casterLevel: casterLevel,
			castingClass: casterClass,
			spellCastingAbility: defaultAbility,
			spellCastingAbilityOverride: defaultAbility == ability ? null : ability,
			spellBonusOverride: bonus,
			spellDcOverride: dc,
			spellList: spellList,
			spellSlotList: spellSlotList,
			displayAsAction: displayAsAction
		};
	})();

	outputData.spellcasting.innateSpells = (() => {
		// adapted from https://github.com/avrae/avrae/blob/master/cogs5e/models/homebrew/bestiary.py#L501
		let displayAsAction = false;
		let isPsionics = false;
		let sData = null;

		for (let a of data.stats.actions) {
			if (a.name.toLowerCase().includes("innate spellcasting") || (a.name.toLowerCase().includes("spellcasting") && !a.description.match(/(\d+)[stndrh]{2}-level/))) {
				sData = a.description;
				isPsionics = a.name.toLowerCase().includes("psionics");
				displayAsAction = true;
			}
		}

		if (!sData)
			for (let a of data.stats.additionalAbilities) {
				if (a.name.toLowerCase().includes("innate spellcasting")) {
					sData = a.description;
					isPsionics = a.name.toLowerCase().includes("psionics");
				}
			}
		if (!sData) return defaultStatblock.spellcasting.innateSpells;

		sData = sData.replaceAll("<i>", "").replaceAll("</i>", "").replaceAll("<b>", "").replaceAll("</b>", "");

		const typeMatch = sData.match(/spellcasting ability is (\w+) \(spell save DC (\d+), [+\-](\d+) to hit/i);
		if (!typeMatch) return defaultStatblock.spellcasting.innateSpells;
		// figure out dc/bonus/abilities
		let dc = typeMatch ? parseInt(typeMatch[2]) : null;
		let bonus = typeMatch ? parseInt(typeMatch[3]) : null;

		const ability: Stat = typeMatch ? typeMatch[1].toLowerCase().slice(0, 3) : null;

		// figure out which components they don't cast with, defaulting to no components
		let noComponentsOfType = ["Material", "Somatic", "Verbal"];
		if (sData.includes("requiring no components") || sData.includes("requiring no spell components")) noComponentsOfType = ["Material", "Somatic", "Verbal"];
		if (sData.includes("requiring only verbal")) noComponentsOfType = ["Material", "Somatic"];
		if (sData.includes("requiring only somatic")) noComponentsOfType = ["Material", "Verbal"];
		if (sData.includes("requiring only material")) noComponentsOfType = ["Somatic", "Verbal"];
		if (sData.includes("requiring no material")) noComponentsOfType = ["Material"];
		if (sData.includes("requiring no somatic")) noComponentsOfType = ["Somatic"];
		if (sData.includes("requiring no verbal")) noComponentsOfType = ["Verbal"];

		let prof = outputData.core.proficiencyBonus;
		let mod = Math.floor(outputData.abilities.stats[ability] / 2) - 5;

		// if our found dc is equal to the normal dc, do not set an override.
		if (dc === 8 + prof + mod) dc = null;
		if (bonus === prof + mod) bonus = null;

		// match for at will spells
		const atWillMatch = sData.match(/At will: (?<spells>.+)$/im);

		// match for per day spells
		const PER_DAY_RE = new RegExp(/(?<times>\d+)\/day(?: each)?: (?<spells>.+)$/, "gmi");
		const perDayMatch: any = Array.from(sData.matchAll(PER_DAY_RE));

		// set our values - currently only 1/2/3 times per day is supported on bestiary builder, so we filter to those
		let oncePerDay: InnateSpellsEntity[] = [];
		let twicePerDay: InnateSpellsEntity[] = [];
		let thricePerDay: InnateSpellsEntity[] = [];
		if (perDayMatch) {
			for (let l of perDayMatch) {
				if ("123".includes(l?.groups?.times)) {
					if (l?.groups?.times == "1") oncePerDay = innateSpellListConstructor(l?.groups?.spells);
					if (l?.groups?.times == "2") twicePerDay = innateSpellListConstructor(l?.groups?.spells);
					if (l?.groups?.times == "3") thricePerDay = innateSpellListConstructor(l?.groups?.spells);
				}
			}
		}
		return {
			spellList: {
				0: innateSpellListConstructor(atWillMatch?.groups?.spells || "") || [],
				1: oncePerDay,
				2: twicePerDay,
				3: thricePerDay
			},
			displayAsAction: displayAsAction,
			isPsionics: isPsionics,
			spellCastingAbility: ability,
			spellBonusOverride: bonus,
			spellDcOverride: dc,
			noComponentsOfType: noComponentsOfType
		};
	})();
	let [features, FnoteList] = abilityParser(data.stats.additionalAbilities, 2);
	let [actions, AnoteList] = abilityParser(data.stats.actions, 1);
	let [bonus, BnoteList] = [[], []];
	let [reactions, RnoteList] = abilityParser(data.stats.reactions, 4);
	let [legendary, LenoteList] = abilityParser(data.stats.legendaryActions, 9);
	let [lair, LanoteList] = [[], []];
	let [mythic, MnoteList] = [[], []];
	let [regional, RenoteList] = [[], []];

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
		features: features,
		actions: actions,
		bonus: bonus,
		reactions: reactions,
		legendary: legendary,
		lair: lair,
		mythic: mythic,
		regional: regional
	};

	return [outputData, notices];
}

function parseDamageTypes(data: string[]): string[] {
	// limited parsing only due to possible weird formatting
	let output: string[] = [];
	for (let d of data) {
		let type = d.trim().toLowerCase();
		if (type.includes(" ") && type.includes("bludgeoning") && type.includes("slashing") && type.includes("piercing")) {
			let modifiers = "";
			if (type.includes("nonmagical")) modifiers += "Nonmagical ";
			if (type.includes("nonsilvered")) modifiers += "Nonsilvered ";
			if (type.includes("nonadamantine")) modifiers += "Nonadamantine ";
			if (type.includes(" aren't magical")) modifiers += "Nonmagical ";
			if (type.includes(" aren't silvered")) modifiers += "Nonsilvered ";
			if (type.includes(" aren't adamantine")) modifiers += "Nonadamantine ";
			for (let i of ["Bludgeoning", "Piercing", "Slashing"]) {
				output.push(`${modifiers}${i}`);
			}
		} else output.push(capitalizeFirstLetter(d));
	}
	return output;
}

function spellListConstructor(spells: string): string[] {
	// splits input on , , and then tries to see if this is an official spell for which we have the capitalization stored
	// removes any special characters or markers that people might use
	// if it can't find it in our list, use the cleaned up input string
	return spells.split(", ").map(
		(s) =>
			spellListFlattened.find(
				(item: string) =>
					item.toLowerCase() ===
					s
						.trim()
						.replace(/[.$*_]/g, "")
						.replace(/\(.+\)/, "")
						.toLowerCase()
			) ||
			s
				.trim()
				.replaceAll(/[.$*_]/g, "")
				.replace(/\(.+\)/, "")
	);
}

function innateSpellListConstructor(spellString: string): InnateSpellsEntity[] {
	if (spellString == "") return [];

	let output = [];

	let spellList = spellString.split(", ");
	for (let sp of spellList) {
		let commentMatch = sp.match(/\((.*?)\)/i);
		let comment = commentMatch ? commentMatch[1] : "";
		let spell =
			spellListFlattened.find(
				(item: string) =>
					item.toLowerCase() ===
					sp
						.trim()
						.replace(/[.$*_]/g, "")
						.replace(/\(.+\)/, "")
						.trim()
			) ||
			sp
				.trim()
				.replace(/[.$*_]/g, "")
				.replace(/\(.+\)/, "")
				.trim();
		output.push({
			spell: spell,
			comment: comment
		});
	}
	return output;
}
