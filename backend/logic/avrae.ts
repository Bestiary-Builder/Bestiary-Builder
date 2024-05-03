import {app} from "../utilities/constants";
import {log} from "../utilities/logger";
import {getBestiary, incrementBestiaryViewCount, collections} from "../utilities/database";
import {type Statblock, Id, stringToId} from "../../shared";

//Export data
app.get("/api/public/bestiary/:id", (req, res) => res.redirect("/api/export/bestiary/" + req.params.id));
app.get("/api/export/bestiary/:id", async (req, res) => {
	/////////////////////////////////////////////////////////////////////////////////////
	//// STOP. EDITING THIS FUNCTION CAN BREAK AVRAE IMPORTS. TEST BEFORE CHANGING  ////
	///////////////////////////////////////////////////////////////////////////////////
	try {
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Bestiary id not valid."});
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "No bestiary with that id found."});
		if (bestiary.status == "private") return res.status(401).json({error: "This bestiary is private"});
		//Increment view count
		incrementBestiaryViewCount(_id);
		//Get creatures
		let creatures = [];
		for (let creatureId of bestiary.creatures) {
			let creature = await collections.creatures?.findOne({_id: new Id(creatureId)});
			if (!creature) continue;

			const creatureData = getCreatureData(creature.stats);
			creatures.push(creatureData);
		}
		//Return bestiary in specific format
		let data = {
			metadata: {
				name: bestiary.name,
				description: bestiary.description
			},
			creatures
		};
		log.info(`Export - Retrieved bestiary with the id ${_id}`);
		return res.json(data);
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured. Please contact the developers of Bestiary Builder, not Avrae."});
	}
});

//Statblock functions:
function displayCR(cr: number): string {
	if (cr == 0.125) return "1/8";
	if (cr == 0.25) return "1/4";
	if (cr == 0.5) return "1/2";
	return cr.toString();
}

function spellDc(innate = false, data: any): number {
	let castingData;
	if (innate) castingData = data.spellcasting.innateSpells;
	else castingData = data.spellcasting.casterSpells;
	if (castingData.spellDcOverride) return castingData.spellDcOverride;
	else {
		if (innate && castingData.spellCastingAbility) return 8 + statCalc(castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
		else return 8 + statCalc(castingData.spellCastingAbilityOveride ?? castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
	}
}

function knownSpells(data: any): any {
	let dailySpells = {
		"1": [],
		"2": [],
		"3": []
	};

	for (let times in data.innateSpells.spellList) {
		if (times == "0") continue;
		for (let sp of data.innateSpells.spellList[times]) {
			// @ts-ignore
			dailySpells[times].push(sp.spell);
		}
	}
	let output = {
		caster_spells: data.casterSpells.spellList.flat(),
		at_will: data.innateSpells.spellList[0].map((sp: any) => sp.spell),
		daily_spells: dailySpells
	};
	return output;
}

function hpCalc(data: any): number {
	return data.defenses.hp.override ?? Math.floor(data.defenses.hp.numOfHitDie * ((data.defenses.hp.sizeOfHitDie + 1) / 2 + statCalc("con", data)));
}

function statCalc(stat: string | null, data: any): number {
	if (!stat) return 0;
	return Math.floor(data.abilities.stats[stat] / 2) - 5;
}

function spellAttackBonus(innate = false, data: any) {
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
}

export function displaySpeedOrSenses(data: any[]): string {
	let output = "";
	let filteredLength = data.filter((item) => item.name !== "New speed" && item.name !== "New sense").length;

	let index = 0;
	for (let item of data) {
		if (item.name === "New speed" || item.name === "New sense") continue;
		if (item.name != "Walk") output += item.name.toLowerCase() + " ";
		output += item.value;
		if (item.unit != "none") output += item.unit + ".";
		if (item.comment) output += ` (${item.comment})`;
		if (filteredLength != 1 && index != filteredLength - 1) output += ", ";
		index++;
	}
	return output;
}

export interface SkillsEntity {
	skillName: string;
	isHalfProficient: boolean;
	isProficient: boolean;
	isExpertise: boolean;
	override: number | null;
}

function calcSkills(data: any) {
	let skillData = data.abilities.skills as SkillsEntity[];
	let output = {} as {[key: string]: {value: number; prof?: number; bonus: number; adv: number | null}};
	for (let stat in SKILLS_BY_STAT) {
		for (let skill of SKILLS_BY_STAT[stat]) {
			let raw = skillData.find((a) => a.skillName.replaceAll(" ", "").toLowerCase() == skill.toLowerCase());
			if (raw == undefined) {
				output[skill] = {
					value: statCalc(stat, data),
					prof: 0,
					bonus: 0,
					adv: null
				};
			} else {
				if (raw.override != null) {
					output[skill] = {
						value: raw.override,
						// set prof to 1, as skills do not display in avrae without prof = 1|2
						prof: 1,
						bonus: 0,
						adv: null
					};
				} else {
					let base = statCalc(stat, data);
					if (raw.isHalfProficient) {
						output[skill] = {
							value: base + Math.floor(data.core.proficiencyBonus / 2),
							prof: 0.5,
							bonus: 0,
							adv: null
						};
					} else if (raw.isProficient) {
						output[skill] = {
							value: base + data.core.proficiencyBonus,
							prof: 1,
							bonus: 0,
							adv: null
						};
					} else if (raw.isExpertise) {
						output[skill] = {
							value: base + data.core.proficiencyBonus * 2,
							prof: 2,
							bonus: 0,
							adv: null
						};
					} else {
						output[skill] = {
							value: base,
							prof: 0,
							bonus: 0,
							adv: null
						};
					}
				}
			}
		}
	}
	return output;
}

function calcPP(override: null | number, finishedData: any): number {
	if (override != null) return override;
	return 10 + finishedData["skills"]["perception"]["value"];
}

const SKILLS_BY_STAT = {
	str: ["athletics", "strength"],
	dex: ["acrobatics", "sleightOfHand", "stealth", "initiative", "dexterity"],
	con: ["constitution"],
	int: ["arcana", "history", "investigation", "nature", "religion", "intelligence"],
	wis: ["animalHandling", "insight", "medicine", "perception", "survival", "wisdom"],
	cha: ["deception", "intimidation", "performance", "persuasion", "charisma"]
} as {[key: string]: string[]};

function nthSuffix(number: number): string {
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
}

function fullSpellAbilityName(abi: string): string {
	// if (innate) abi = this.data.spellcasting.innateSpells.spellCastingAbility
	// else abi = this.data.spellcasting.casterSpells.spellCastingAbilityOverride ?? this.data.spellcasting.casterSpells.spellCastingAbility

	if (abi == "str") return "Strength";
	if (abi == "dex") return "Dexterity";
	if (abi == "con") return "Constitution";
	if (abi == "wis") return "Wisdom";
	if (abi == "int") return "Intelligence";
	if (abi == "cha") return "Charisma";
	return "Spellcasting Ability not found.";
}

function slots(num: number) {
	if (num > 1) return `(${num} slots)`;
	return `(${num} slot)`;
}

function componentsString(comp: string[]): string {
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
}

export function getCreatureData(creature: Statblock) {
	//HP:
	let hpObject = creature.defenses.hp;
	let hp = hpCalc(creature);
	let hitdice = `${hpObject.numOfHitDie + "d" + hpObject.sizeOfHitDie} + ${hpObject.numOfHitDie * statCalc("con", creature)}`;

	//Spellcastin:
	let spellcastInnateObj = creature.spellcasting.innateSpells;
	let spellcastCasterObj = creature.spellcasting.casterSpells;
	let spellcasting = {
		caster_level: spellcastCasterObj.casterLevel || 0,
		slots: spellcastCasterObj.spellSlotList || {},
		known_spells: knownSpells(creature.spellcasting),
		caster_dc: spellDc(false, creature),
		caster_sab: spellAttackBonus(false, creature),
		caster_mod: statCalc(spellcastCasterObj.spellCastingAbilityOverride ?? spellcastCasterObj.spellCastingAbility ?? "", creature),
		innate_dc: spellDc(true, creature),
		innate_sab: spellAttackBonus(true, creature),
		innate_mod: statCalc(spellcastInnateObj.spellCastingAbility, creature)
	};

	//Saves/stats
	let saves = {} as any;
	for (let key in creature.abilities.saves) {
		let newKey;
		switch (key) {
			case "str":
				newKey = "strengthSave";
				break;
			case "dex":
				newKey = "dexteritySave";
				break;
			case "con":
				newKey = "constitutionSave";
				break;
			case "wis":
				newKey = "wisdomSave";
				break;
			case "int":
				newKey = "intelligenceSave";
				break;
			case "cha":
				newKey = "charismaSave";
				break;
			default:
				continue;
		}
		let override = creature.abilities.saves[key].override;
		let value = statCalc(key, creature);
		let prof = 0;
		if (override != null) {
			value = override;
			prof = 1;
		} else if (creature.abilities.saves[key].isProficient) {
			value += creature.core.proficiencyBonus;
			prof = 1;
		}
		saves[newKey] = {
			value: value,
			prof: prof,
			adv: null,
			bonus: 0
		};
	}
	//Final data
	let creatureData = {
		name: creature.description.name,
		proper: creature.description.isProperNoun,
		image_url: creature.description.image || "",
		languages: creature.core.languages,
		cr: displayCR(creature.description.cr),
		xp: creature.description.xp,
		alignment: creature.description.alignment,
		size: creature.core.size,
		race: creature.core.race,
		ac: creature.defenses.ac.ac,
		armortype: creature.defenses.ac.acSource,
		hp: hp,
		hitdice: hitdice,
		speed: displaySpeedOrSenses(creature.core.speed),
		ability_scores: {
			prof_bonus: creature.core.proficiencyBonus,
			strength: creature.abilities.stats.str,
			dexterity: creature.abilities.stats.dex,
			constitution: creature.abilities.stats.con,
			intelligence: creature.abilities.stats.int,
			wisdom: creature.abilities.stats.wis,
			charisma: creature.abilities.stats.cha
		},
		saves: saves,
		skills: calcSkills(creature),
		senses: displaySpeedOrSenses(creature.core.senses),
		resistances: creature.defenses.resistances,
		immunities: creature.defenses.immunities,
		vulnerabilities: creature.defenses.vulnerabilities,
		condition_immune: creature.defenses.conditionImmunities,
		traits: creature.features.features,
		actions: creature.features.actions,
		bonus_actions: creature.features.bonus,
		reactions: creature.features.reactions,
		legactions: creature.features.legendary,
		mythic: creature.features.mythic,
		lair: creature.features.lair,
		regional: creature.features.regional,
		la_per_round: creature.misc.legActionsPerRound,
		spellcasting: spellcasting
	};
	// @ts-ignore
	creatureData.passiveperc = calcPP(creature.core.senses.passivePerceptionOverride, creatureData);
	let caster = creature["spellcasting"]["casterSpells"];
	let isNoun = creature["description"]["isProperNoun"];
	let name = creature["description"]["name"];

	// best not to think about this too much.
	if (caster.casterLevel && caster.castingClass && caster.spellList.flat().length > 0) {
		let output = `${isNoun ? "" : "The "}${name} is a ${nthSuffix(caster.casterLevel)}-level spellcaster. ${isNoun ? "Their" : "Its"} spellcasting ability is ${fullSpellAbilityName(caster.spellCastingAbilityOverride ?? caster.spellCastingAbility ?? "")} (spell save DC ${spellDc(
			false,
			creature
		)}, ${spellAttackBonus(false, creature) >= 0 ? "+" : ""}${spellAttackBonus(false, creature)} to hit with spell attacks). ${isNoun ? name : "It"} ${
			["Sorcerer", "Bard", "Ranger", "Warlock"].includes(caster.castingClass) ? `knowns the following ${caster.castingClass.toLowerCase()} spells` : `has the following ${caster.castingClass.toLowerCase()} spells prepared`
		}:${!["Ranger", "Paladin"].includes(caster.castingClass) && caster.spellList[0].length > 0 ? `\n\nCantrips (at will): ${caster.spellList[0].sort().join(", ").toLowerCase()}` : ""}${
			caster.spellList[1].length > 0 ? `\n\n1st level ${slots(caster.spellSlotList![1])}: ${caster.spellList[1].sort().join(", ").toLowerCase()}` : ""
		}${caster.spellList[2].length > 0 ? `\n\n2nd level ${slots(caster.spellSlotList![2])}: ${caster.spellList[2].sort().join(", ").toLowerCase()}` : ""}${
			caster.spellList[3].length > 0 ? `\n\n3rd level ${slots(caster.spellSlotList![3])}: ${caster.spellList[3].sort().join(", ").toLowerCase()}` : ""
		}${caster.spellList[4].length > 0 ? `\n\n4th level ${slots(caster.spellSlotList![4])}: ${caster.spellList[4].sort().join(", ").toLowerCase()}` : ""}${
			caster.spellList[5].length > 0 ? `\n\n5th level ${slots(caster.spellSlotList![5])}: ${caster.spellList[5].sort().join(", ").toLowerCase()}` : ""
		}${caster.spellList[6].length > 0 ? `\n\n6th level ${slots(caster.spellSlotList![6])}: ${caster.spellList[6].sort().join(", ").toLowerCase()}` : ""}${
			caster.spellList[7].length > 0 ? `\n\n7th level ${slots(caster.spellSlotList![7])}: ${caster.spellList[7].sort().join(", ").toLowerCase()}` : ""
		}${caster.spellList[8].length > 0 ? `\n\n8th level ${slots(caster.spellSlotList![8])}: ${caster.spellList[8].sort().join(", ").toLowerCase()}` : ""}${
			caster.spellList[9].length > 0 ? `\n\n9th level ${slots(caster.spellSlotList![9])}: ${caster.spellList[9].sort().join(", ").toLowerCase()}` : ""
		}`.replaceAll("\t", "");

		creatureData.traits.push({
			name: "Spellcasting",
			description: output,
			automation: null
		});
	}

	let innateCaster = creature["spellcasting"]["innateSpells"];
	if (innateCaster.spellCastingAbility && (innateCaster.spellList[0].length > 0 || innateCaster.spellList[1].length > 0 || innateCaster.spellList[2].length > 0 || innateCaster.spellList[3].length > 0)) {
		let fName = `Innate Spellcasting${innateCaster.isPsionics ? " (Psionics)" : ""}`;
		let output = "";

		if (!innateCaster.displayAsAction) {
			output += `${isNoun ? "" : "The "}${name}'s spellcasting ability is ${fullSpellAbilityName(innateCaster.spellCastingAbility)} (spell save DC ${spellDc(true, creature)}, ${spellAttackBonus(true, creature) >= 0 ? "+" : ""}${spellAttackBonus(true, creature)} to hit with spell attacks). ${
				isNoun ? name : "It"
			} can innately cast the following spells${componentsString(innateCaster.noComponentsOfType)}:`;
		} else {
			output += `${isNoun ? "" : "The "}${name} casts one of the following spells${componentsString(innateCaster.noComponentsOfType)} and using ${fullSpellAbilityName(innateCaster.spellCastingAbility)} as the spellcasting ability (spell save DC ${spellDc(true, creature)}, ${
				spellAttackBonus(true, creature) >= 0 ? "+" : ""
			}${spellAttackBonus(true, creature)} to hit with spell attacks):`;
		}

		if (innateCaster.spellList[0].length > 0)
			output += `\n\nAt will: ${innateCaster.spellList[0]
				.map((x: any) => (x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell))
				.sort()
				.join(", ")
				.toLowerCase()}`;
		if (innateCaster.spellList[3].length > 0)
			output += `\n\n3/day each: ${innateCaster.spellList[3]
				.map((x: any) => (x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell))
				.sort()
				.join(", ")
				.toLowerCase()}`;
		if (innateCaster.spellList[2].length > 0)
			output += `\n\n2/day each: ${innateCaster.spellList[2]
				.map((x: any) => (x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell))
				.sort()
				.join(", ")
				.toLowerCase()}`;
		if (innateCaster.spellList[1].length > 0)
			output += `\n\n1/day each: ${innateCaster.spellList[1]
				.map((x: any) => (x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell))
				.sort()
				.join(", ")
				.toLowerCase()}`;

		creatureData[innateCaster.displayAsAction ? "actions" : "traits"].push({
			name: fName,
			description: output,
			automation: null
		});
	}
	return creatureData;
}
