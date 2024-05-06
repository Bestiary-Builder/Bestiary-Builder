import {type CasterSpells, type Statblock, type InnateSpellsList, defaultStatblock, getXPbyCR, SKILLS_BY_STAT, spellListFlattened, type SpellSlotEntity, type SkillsEntity, type SpeedEntity, type SenseEntity, type Stat} from "~/shared";
import {abilityParser, capitalizeFirstLetter} from "./utils";
export function parseFrom5eTools(data: any): [Statblock, {[key: string]: string[]}] {
	let outputData = {} as Statblock;
	outputData.description = {
		name: data.name,
		image: "",
		description: "",
		cr: parseInt(data.cr?.cr ?? data.cr),
		isProperNoun: data.isNamedCreature ?? false,
		environment: (data?.environment ?? []).join(", "),
		faction: "",
		alignment: (() => {
			let nameMap = {
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
			// @ts-ignore
			return (data?.alignmentPrefix ?? "") + (data.alignment ?? []).map((a) => nameMap[a]).join(" ");
		})(),
		xp: getXPbyCR(parseInt(data.cr?.cr ?? data.cr))
	};

	outputData.core = {
		proficiencyBonus: Math.max(2, Math.min(9, Math.floor((outputData.description.cr + 3) / 4)) + 1),
		race: (() => {
			let typeData = data.type;
			if (typeof typeData == "string") return capitalizeFirstLetter(typeData);
			let baseType = typeData.type;

			if (!typeData?.tags || typeData?.tags.length == 0) return capitalizeFirstLetter(baseType);

			if (typeof typeData?.tags[0] == "string") {
				return capitalizeFirstLetter(baseType) + ` (${typeData?.tags.map((a: string) => capitalizeFirstLetter(a)).join(" ")})`;
			}

			if (typeof typeData?.tags[0] == "object") {
				return capitalizeFirstLetter(baseType) + " " + typeData?.tags.map((t: any) => `${capitalizeFirstLetter(t.prefix)}} ${capitalizeFirstLetter(t.tag)}`).join(", ");
			}
			///console.log("Something is wrong in race", typeData);
			return "";
		})(),
		size: (() => {
			let sizeMap = {
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
			// @ts-ignore
			return (data?.size ?? []).map((s: string) => sizeMap[s]).join(" or ");
		})(),
		languages: (() => {
			if (!data.languages) return [];
			return data?.languages.filter((l: string) => !l.includes("telepathy"));
		})(),
		senses: (() => {
			let output: SenseEntity[] = [];
			for (let s of data.senses ?? []) {
				let value = parseInt(s.replace(/[a-zA-Z]/g, ""));
				let name = "";
				let isBlind = false;

				if (s.toLowerCase().includes("dark")) name = "Darkvision";
				else if (s.toLowerCase().includes("blind")) {
					name = "Blindsight";
					isBlind = !!(data.senses ?? []).find((str: string) => str.includes("blind beyond this radius"));
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
			let fly = parseInt(data?.speed?.fly) || data?.speed?.fly?.number || 0;
			let isHover = data?.speed?.canHover || false;
			let swim = parseInt(data?.speed?.swim) || data?.speed?.swim?.number || 0;
			let burrow = parseInt(data?.speed?.burrow) || data?.speed?.burrow?.number || 0;
			let climb = parseInt(data?.speed?.climb) || data?.speed?.climb?.number || 0;
			let walk = parseInt(data?.speed?.walk) || data?.speed?.walk?.number || 0;

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
		stats: {
			str: data.str,
			dex: data.dex,
			con: data.con,
			int: data.int,
			wis: data.wis,
			cha: data.cha
		},
		saves: {
			str: (() => {
				let mod = data?.save?.str ?? null;

				if (!mod) return {isProficient: false, override: null};

				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.str / 2) - 5);
				if (mod == saveBonus) return {isProficient: true, override: null};
				if (mod != saveBonus) return {isProficient: false, override: mod};

				return {isProficient: false, override: null};
			})(),
			dex: (() => {
				let mod = parseInt(data?.save?.dex) ?? null;
				if (!mod) return {isProficient: false, override: null};

				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.dex / 2) - 5);
				if (mod == saveBonus) return {isProficient: true, override: null};
				if (mod != saveBonus) return {isProficient: false, override: mod};

				return {isProficient: false, override: null};
			})(),
			con: (() => {
				let mod = parseInt(data?.save?.con) ?? null;
				if (!mod) return {isProficient: false, override: null};

				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.con / 2) - 5);
				if (mod == saveBonus) return {isProficient: true, override: null};
				if (mod != saveBonus) return {isProficient: false, override: mod};

				return {isProficient: false, override: null};
			})(),
			int: (() => {
				let mod = parseInt(data?.save?.int) ?? null;
				if (!mod) return {isProficient: false, override: null};

				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.int / 2) - 5);
				if (mod == saveBonus) return {isProficient: true, override: null};
				if (mod != saveBonus) return {isProficient: false, override: mod};

				return {isProficient: false, override: null};
			})(),
			wis: (() => {
				let mod = parseInt(data?.save?.wis) ?? null;
				if (!mod) return {isProficient: false, override: null};

				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.wis / 2) - 5);
				if (mod == saveBonus) return {isProficient: true, override: null};
				if (mod != saveBonus) return {isProficient: false, override: mod};

				return {isProficient: false, override: null};
			})(),
			cha: (() => {
				let mod = parseInt(data?.save?.cha) ?? null;
				if (!mod) return {isProficient: false, override: null};

				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.cha / 2) - 5);
				if (mod == saveBonus) return {isProficient: true, override: null};
				if (mod != saveBonus) return {isProficient: false, override: mod};

				return {isProficient: false, override: null};
			})()
		},
		skills: (() => {
			if (!data.skill) return [];

			let output = [] as SkillsEntity[];


			for (let sk in data.skill) {
				let name = capitalizeFirstLetter(sk.replace("animal handling", "Animal Handling").replace("sleight of hand", "Sleight of Hand"));
				let shortname = name.replace(" ", "").toLowerCase();

				let ability;
				for (let sk2 in SKILLS_BY_STAT) {
					if (SKILLS_BY_STAT[sk2 as Stat].includes(shortname)) {
						ability = sk2 as Stat;
						break;
					}
				}
				if (!ability) continue;

				let isProf = parseInt(data.skill[sk]) == outputData.core.proficiencyBonus + (Math.floor(data[ability] / 2) - 5);
				let isExpertise = parseInt(data.skill[sk]) == Math.floor(outputData.core.proficiencyBonus * 2) + (Math.floor(data[ability] / 2) - 5);
				let isHalfProficient = parseInt(data.skill[sk]) == Math.floor(outputData.core.proficiencyBonus / 2) + (Math.floor(data[ability] / 2) - 5);

				let override = null;
				if (!isProf && !isExpertise && !isHalfProficient) override = parseInt(data.skill[sk]);

				output.push({
					skillName: name,
					isProficient: isProf,
					isExpertise: isExpertise,
					isHalfProficient: isHalfProficient,
					override: override
				});
			}
			return output;
		})()
	};

	outputData.defenses = {
		hp: {
			numOfHitDie: parseInt((data.hp.formula || "1d6").split("d")[0]),
			sizeOfHitDie: parseInt(((data.hp.formula || "1d6").match(/\dd(\d+)/) || [])[1]) || 6,
			// critterDB only handles this on homebrew monsters.)
			override: data.hp.special || null
		},
		ac: {
			ac: parseInt(data.ac[0]) || parseInt(data.ac[0].ac),
			acSource: (() => {
				if (typeof data.ac[0] != "object") return "";
				return (data.ac[0].from[0] ?? "").replace(/\{@item\s+[^|]+\|[^|]+\|([^}]+)\}/, "$1");
			})()
		},
		immunities: (() => {
			let output: string[] = [];

			if (!data.immune) return [];
			for (let v of data?.immune) {
				if (typeof v == "string") output.push(capitalizeFirstLetter(v));
				else {
					let types = v.immune;
					let modifier = "";
					if (v.note) {
						if (v.note.includes("from magic weapons")) modifier += "Magical ";
						if (v.note.includes("from silvered weapons")) modifier += "Silvered ";
						if (v.note.includes("from adamantine weapons")) modifier += "Adamantine ";

						if (v.note.includes("from nonmagical attacks")) modifier += "Nonmagical ";
						if (v.note.includes("from nonsilvered attacks")) modifier += "Nonsilvered ";
						if (v.note.includes("from nonadamantine attacks")) modifier += "Nonadamantine ";

						if (v.note.includes("that aren't magical")) modifier += "Nonmagical ";
						if (v.note.includes("that aren't silvered")) modifier += "Nonsilvered ";
						if (v.note.includes("that aren't adamantine")) modifier += "Nonadamantine ";

						if (v.note.includes("not made with magical")) modifier += "Nonmagical ";
						if (v.note.includes("not made with silvered")) modifier += "Nonsilvered ";
						if (v.note.includes("not made with adamantine")) modifier += "Nonadamantine ";
					}
					for (let t of types) {
						output.push(`${modifier}${capitalizeFirstLetter(t)}`);
					}
				}
			}
			return output;
		})(),
		resistances: (() => {
			let output: string[] = [];

			if (!data.resist) return [];
			for (let v of data?.resist) {
				if (typeof v == "string") output.push(capitalizeFirstLetter(v));
				else {
					let types = v.resist;
					let modifier = "";
					if (v.note) {
						if (v.note.includes("from magic weapons")) modifier += "Magical ";
						if (v.note.includes("from silvered weapons")) modifier += "Silvered ";
						if (v.note.includes("from adamantine weapons")) modifier += "Adamantine ";

						if (v.note.includes("from nonmagical attacks")) modifier += "Nonmagical ";
						if (v.note.includes("from nonsilvered attacks")) modifier += "Nonsilvered ";
						if (v.note.includes("from nonadamantine attacks")) modifier += "Nonadamantine ";

						if (v.note.includes("that aren't magical")) modifier += "Nonmagical ";
						if (v.note.includes("that aren't silvered")) modifier += "Nonsilvered ";
						if (v.note.includes("that aren't adamantine")) modifier += "Nonadamantine ";

						if (v.note.includes("not made with magical")) modifier += "Nonmagical ";
						if (v.note.includes("not made with silvered")) modifier += "Nonsilvered ";
						if (v.note.includes("not made with adamantine")) modifier += "Nonadamantine ";
					}
					for (let t of types) {
						output.push(`${modifier}${capitalizeFirstLetter(t)}`);
					}
				}
			}
			return output;
		})(),
		vulnerabilities: (() => {
			let output: string[] = [];

			if (!data.vulnerable) return [];
			for (let v of data?.vulnerable) {
				if (typeof v == "string") output.push(capitalizeFirstLetter(v));
				else {
					let types = v.vulnerable;
					let modifier = "";
					if (v.note) {
						if (v.note.includes("from magic weapons")) modifier += "Magical ";
						if (v.note.includes("from silvered weapons")) modifier += "Silvered ";
						if (v.note.includes("from adamantine weapons")) modifier += "Adamantine ";

						if (v.note.includes("from nonmagical attacks")) modifier += "Nonmagical ";
						if (v.note.includes("from nonsilvered attacks")) modifier += "Nonsilvered ";
						if (v.note.includes("from nonadamantine attacks")) modifier += "Nonadamantine ";

						if (v.note.includes("that aren't magical")) modifier += "Nonmagical ";
						if (v.note.includes("that aren't silvered")) modifier += "Nonsilvered ";
						if (v.note.includes("that aren't adamantine")) modifier += "Nonadamantine ";

						if (v.note.includes("not made with magical")) modifier += "Nonmagical ";
						if (v.note.includes("not made with silvered")) modifier += "Nonsilvered ";
						if (v.note.includes("not made with adamantine")) modifier += "Nonadamantine ";
					}
					for (let t of types) {
						output.push(`${modifier}${capitalizeFirstLetter(t)}`);
					}
				}
			}
			return output;
		})(),
		conditionImmunities: (data?.conditionImmune || []).map((c: string) => capitalizeFirstLetter(c))
	};

	outputData.spellcasting = {
		innateSpells: {
			spellList: (() => {
				let sData = [];
				let output = {
					0: [],
					1: [],
					2: [],
					3: []
				} as InnateSpellsList;
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) sData = t;
				}

				if (!sData) return output;

				if (sData.will) {
					if (!sData.daily) sData.daily = {"0e": sData.will};
					else sData.daily["0e"] = sData.will;
				}

				if (sData.daily) {
					for (let l in sData.daily) {
						let level = parseInt(l.replace("e", ""));
						if (level >= 0 && level < 4) {
							for (let sp of sData.daily[l]) {
								let t = sp.replace("{@spell ", "");
								t = t.split("}");
								if (t)
									output[level].push({
										spell: spellListFlattened.find((item: string) => item.toLowerCase() === t[0].toLowerCase()) || t[0],
										comment: t[1].replace(" (", "").replace(")", "") ?? ""
									});
							}
						}
					}
				}
				return output;
			})(),
			spellDcOverride: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) sData = t;
				}

				if (!sData || !sData.headerEntries) return null;

				const match = sData.headerEntries[0].match(/\{@dc\s+(\d+)\}/);
				const dc = match ? parseInt(match[1]) : null;
				if (!dc) return null;
				if (dc != 8 + outputData.core.proficiencyBonus + (Math.floor(data[sData.ability] / 2) - 5)) return dc;
				return null;
			})(),
			spellBonusOverride: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) sData = t;
				}

				if (!sData || !sData.headerEntries) return null;

				const match = sData.headerEntries[0].match(/\{@hit\s+(\d+)\}/);
				const hit = match ? parseInt(match[1]) : null;
				if (!hit) return null;

				if (hit != outputData.core.proficiencyBonus + (Math.floor(data[sData.ability] / 2) - 5)) return hit;
				return null;
			})(),
			displayAsAction: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) sData = t;
				}
				if (!sData || !sData.displayAs) return false;
				return sData?.displayAs == "action";
			})(),
			noComponentsOfType: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) sData = t;
				}

				// this is the default
				if (!sData || !sData.headerEntries) return ["Material", "Verbal", "Somatic"];

				const text = sData.headerEntries[0];
				if (text.includes("requiring no components") || text.includes("requiring no spell components")) return ["Material", "Somatic", "Verbal"];
				if (text.includes("requiring only verbal")) return ["Material", "Somatic"];
				if (text.includes("requiring only somatic")) return ["Material", "Verbal"];
				if (text.includes("requiring only material")) return ["Somatic", "Verbal"];
				if (text.includes("requiring no material")) return ["Material"];
				if (text.includes("requiring no somatic")) return ["Somatic"];
				if (text.includes("requiring no verbal")) return ["Verbal"];
				return ["Material", "Somatic", "Verbal"];
			})(),
			spellCastingAbility: (() => {
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) return t.ability;
				}
				return null;
			})(),
			isPsionics: (() => {
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting (Psionics)")) return true;
				}
				return false;
			})()
		},
		casterSpells: {
			casterLevel: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}
				if (!sData || !sData.headerEntries) return null;

				const regex = /\b(\w+-level)\b/;
				const match = sData.headerEntries[0].match(regex);

				return match ? Math.max(0, Math.min(20, parseInt(match[1].replace("-level", "").replace("st", "").replace("nd", "").replace("rd", "").replace("th", "")))) : null;
			})(),
			castingClass: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}
				if (!sData || !sData.headerEntries) return null;

				const text = sData.headerEntries[0];

				if (text.toLowerCase().includes("wizard")) return "Wizard";
				if (text.toLowerCase().includes("ranger")) return "Ranger";
				if (text.toLowerCase().includes("sorcerer")) return "Sorcerer";
				if (text.toLowerCase().includes("bard")) return "Bard";
				if (text.toLowerCase().includes("druid")) return "Druid";
				if (text.toLowerCase().includes("artificer")) return "Artificer";
				if (text.toLowerCase().includes("cleric")) return "Cleric";
				if (text.toLowerCase().includes("warlock")) return "Warlock";
				if (text.toLowerCase().includes("paladin")) return "Paladin";

				return null;
			})(),
			spellList: (() => {
				let output = [[], [], [], [], [], [], [], [], [], []] as CasterSpells["spellList"];

				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}
				if (!sData.spells) return output;

				for (let l in sData.spells) {
					for (let sp of sData.spells[l].spells) {
						let t = sp.replace("{@spell ", "");
						t = t.split("}");
						if (t) output[parseInt(l)].push(spellListFlattened.find((item: string) => item.toLowerCase() === t[0].toLowerCase()) || t[0]);
					}
				}

				return output;
			})(),
			spellSlotList: (() => {
				let sData = [];
				let output = {} as SpellSlotEntity;
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}
				if (!sData.spells) return output;

				for (let l in sData.spells) {
					if (parseInt(l) == 0) continue;
					output[parseInt(l)] = sData.spells[l].slots ?? 0;
				}
				return output;
			})(),
			spellBonusOverride: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}

				if (!sData || !sData.headerEntries) return null;

				const match = sData.headerEntries[0].match(/\{@hit\s+(\d+)\}/);
				const hit = match ? parseInt(match[1]) : null;
				if (!hit) return null;

				if (hit != outputData.core.proficiencyBonus + (Math.floor(data[sData.ability] / 2) - 5)) return hit;
				return null;
			})(),
			spellDcOverride: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}

				if (!sData || !sData.headerEntries) return null;

				const match = sData.headerEntries[0].match(/\{@dc\s+(\d+)\}/);
				const dc = match ? parseInt(match[1]) : null;
				if (!dc) return null;
				if (dc != 8 + outputData.core.proficiencyBonus + (Math.floor(data[sData.ability] / 2) - 5)) return dc;
				return null;
			})(),
			spellCastingAbilityOverride: null,
			spellCastingAbility: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}
				if (!sData.ability) return null;
				return sData.ability;
			})(),
			displayAsAction: false
		}
	};

	outputData.misc = {
		legActionsPerRound: (() => {
			if (data?.legendaryActions) return data?.legendaryActions;
			if ((data?.legendary ?? []).length > 0) return 3;
			return 0;
		})(),
		telepathy: (() => {
			if (!data.languages) return 0;
			for (let s of data?.languages ?? []) {
				if (s.includes("telepathy")) return parseInt(s.replace(/[a-zA-Z]/g, ""));
			}
			return 0;
		})(),
		passivePerceptionOverride: (() => {
			let num = data.passive;

			if (data?.skill?.perception) {
				if (10 + parseInt(data?.skill?.perception) == num) return null;
			}

			if (10 + (Math.floor(data.wis / 2) - 5) == num) return null;

			return num;
		})(),
		featureHeaderTexts: {
			features: "",
			actions: (data?.actionHeader ?? []).join("\n") ?? "",
			bonus: (data?.bonusHeader ?? []).join("\n") ?? "",
			reactions: (data?.reactionHeader ?? []).join("\n") ?? "",
			legendary: (data?.legendaryHeader ?? []).join("\n") ?? defaultStatblock.misc.featureHeaderTexts.legendary,
			lair: defaultStatblock.misc.featureHeaderTexts.lair,
			mythic: (data?.mythicHeader ?? []).join("\n") ?? defaultStatblock.misc.featureHeaderTexts.mythic,
			regional: defaultStatblock.misc.featureHeaderTexts.regional
		}
	};
	let [features, FnoteList] = abilityParser(data.trait, 2);
	let [actions, AnoteList] = abilityParser(data.action, 1);
	let [bonus, BnoteList] = abilityParser(data.bonus, 3);
	let [reactions, RnoteList] = abilityParser(data.lair, 4);
	let [legendary, LenoteList] = abilityParser(data.legendary, 9);
	let [lair, LanoteList] = [[], []];
	let [mythic, MnoteList] = abilityParser(data.mythic, 10);
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
