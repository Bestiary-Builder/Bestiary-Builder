import {app} from "@/utilities/constants";
import {log} from "@/utilities/logger";
import {getBestiary, incrementBestiaryViewCount, collections} from "@/utilities/database";
import {type Statblock, Id, stringToId, SKILLS_BY_STAT, type Stat, type SkillsEntity, nthSuffix, hpCalc, statCalc, fullSpellAbilityName, componentsString, crAsString, ppCalc, type SpellCasting, displaySpeedOrSenses, spellDc, spellAttackBonus} from "~/shared";

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


function knownSpells(data: SpellCasting): any {
	let dailySpells = {
		"1": [],
		"2": [],
		"3": []
	} as {
		[key: string]: unknown[];
	};

	for (let times in data.innateSpells.spellList) {
		if (times == "0") continue;
		for (let sp of data.innateSpells.spellList[times]) {
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




function calcSkills(data: Statblock) {
	let skillData = data.abilities.skills as SkillsEntity[];
	let output = {} as {[key: string]: {value: number; prof?: number; bonus: number; adv: number | null}};
	for (let stat in SKILLS_BY_STAT) {
		for (let skill of SKILLS_BY_STAT[stat as Stat]) {
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



function slots(num: number) {
	if (num > 1) return `(${num} slots)`;
	return `(${num} slot)`;
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
		const saveData = creature.abilities.saves[key as Stat]

		let newKey = {
			"str": "strengthSave",
			"dex": "dexteritySave",
			"con": "constitutionSave",
			"wis": "wisdomSave",
			"int": "intelligenceSave",
			"cha": "charismaSave",
		}[key] ?? ""

		let override = saveData.override;
		let value = statCalc(key, creature);
		let prof = 0;
		if (override != null) {
			value = override;
			prof = 1;
		} else if (saveData.isProficient) {
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
		cr: crAsString(creature.description.cr),
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
		spellcasting: spellcasting,
		passiveperc: ppCalc(creature)
	};

	let caster = creature["spellcasting"]["casterSpells"];
	let isNoun = creature["description"]["isProperNoun"];
	let name = creature["description"]["name"];

	// best not to think about this too much.
	if (caster.casterLevel && caster.castingClass && caster.spellList.flat().length > 0) {
		let output = `${isNoun ? "" : "The "}${name} is a ${nthSuffix(caster.casterLevel)}-level spellcaster. ${isNoun ? "Their" : "Its"} spellcasting ability is ${fullSpellAbilityName(caster.spellCastingAbilityOverride ?? caster.spellCastingAbility)} (spell save DC ${spellDc(
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
