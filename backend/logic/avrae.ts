import { app } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { collections, getBestiary, incrementBestiaryViewCount } from "@/utilities/database";
import { Id, type InnateSpellsEntity, SKILLS_BY_STAT, type SkillsEntity, type SpellCasting, type Stat, type Statblock, crAsString, displayCasterCasting, displayInnateCasting, displaySpeedOrSenses, hpCalc, ppCalc, spellAttackBonus, spellDc, statCalc, stringToId } from "~/shared";

// Export data
app.get("/api/public/bestiary/:id", (req, res) => res.redirect(`/api/export/bestiary/${req.params.id}`));
app.get("/api/export/bestiary/:id", async (req, res) => {
	/////////////////////////////////////////////////////////////////////////////////////
	/// / STOP. EDITING THIS FUNCTION CAN BREAK AVRAE IMPORTS. TEST BEFORE CHANGING  ////
	///////////////////////////////////////////////////////////////////////////////////
	try {
		const _id = stringToId(req.params.id);
		if (!_id)
			return res.status(400).json({ error: "Bestiary id not valid." });
		const bestiary = await getBestiary(_id);
		if (!bestiary)
			return res.status(404).json({ error: "No bestiary with that id found." });
		if (bestiary.status === "private")
			return res.status(401).json({ error: "This bestiary is private" });
		// Increment view count
		incrementBestiaryViewCount(_id);
		// Get creatures
		const creatures = [];
		for (const creatureId of bestiary.creatures) {
			const creature = await collections.creatures?.findOne({ _id: new Id(creatureId) });
			if (!creature)
				continue;
			try {
				const creatureData = getCreatureData(creature.stats);
				creatures.push(creatureData);
			}
			catch (err) {
				log.log("critical", err);
				return res.status(500).json({ error: `Error exporting ${creature.stats.description.name}. Please contact the developers of Bestiary Builder, not Avrae.` });
			}
		}
		// Return bestiary in specific format
		const data = {
			metadata: {
				name: bestiary.name,
				description: bestiary.description
			},
			creatures
		};
		log.info(`Export - Retrieved bestiary with the id ${_id}`);
		return res.json(data);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured. Please contact the developers of Bestiary Builder, not Avrae." });
	}
});

// Statblock functions:

function knownSpells(data: SpellCasting) {
	const dailySpells: Record<string, string[]> = {};

	for (const times in data.innateSpells.spellList) {
		if (times === "0")
			continue;
		dailySpells[times] = data.innateSpells.spellList[times].map(spell => spell.spell);
	}
	const output = {
		caster_spells: data.casterSpells.spellList.flat(),
		at_will: data.innateSpells.spellList[0].map((sp: InnateSpellsEntity) => sp.spell),
		daily_spells: dailySpells
	};
	return output;
}

function calcSkills(data: Statblock) {
	const skillData = data.abilities.skills as SkillsEntity[];
	const output = {} as { [key: string]: { value: number; prof?: number; bonus: number; adv: number | null } };
	for (const stat in SKILLS_BY_STAT) {
		for (const skill of SKILLS_BY_STAT[stat as Stat]) {
			const raw = skillData.find(a => a.skillName.replaceAll(" ", "").toLowerCase() === skill.toLowerCase());
			if (raw === undefined) {
				output[skill] = {
					value: statCalc(stat as Stat, data),
					prof: 0,
					bonus: 0,
					adv: null
				};
			}
			else {
				if (raw.override != null) {
					output[skill] = {
						value: raw.override,
						// set prof to 1, as skills do not display in avrae without prof = 1|2
						prof: 1,
						bonus: 0,
						adv: null
					};
				}
				else {
					const base = statCalc(stat as Stat, data);
					if (raw.isHalfProficient) {
						output[skill] = {
							value: base + Math.floor(data.core.proficiencyBonus / 2),
							prof: 0.5,
							bonus: 0,
							adv: null
						};
					}
					else if (raw.isProficient) {
						output[skill] = {
							value: base + data.core.proficiencyBonus,
							prof: 1,
							bonus: 0,
							adv: null
						};
					}
					else if (raw.isExpertise) {
						output[skill] = {
							value: base + data.core.proficiencyBonus * 2,
							prof: 2,
							bonus: 0,
							adv: null
						};
					}
					else {
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

export function getCreatureData(creature: Statblock) {
	// HP:
	const hpObject = creature.defenses.hp;
	const hp = hpCalc(creature);
	const hitdice = `${`${hpObject.numOfHitDie}d${hpObject.sizeOfHitDie}`} + ${hpObject.numOfHitDie * statCalc("con", creature)}`;

	// Spellcastin:
	const spellcastInnateObj = creature.spellcasting.innateSpells;
	const spellcastCasterObj = creature.spellcasting.casterSpells;
	const spellcasting = {
		caster_level: spellcastCasterObj.casterLevel || 0,
		slots: spellcastCasterObj.spellSlotList || {},
		known_spells: knownSpells(creature.spellcasting),
		caster_dc: spellDc(false, creature),
		caster_sab: spellAttackBonus(false, creature),
		caster_mod: statCalc(spellcastCasterObj.spellCastingAbilityOverride ?? spellcastCasterObj.spellCastingAbility ?? null, creature),
		innate_dc: spellDc(true, creature),
		innate_sab: spellAttackBonus(true, creature),
		innate_mod: statCalc(spellcastInnateObj.spellCastingAbility, creature)
	};

	// Saves/stats
	const saves = {} as { [key: string]: unknown };
	for (const key in creature.abilities.saves) {
		const saveData = creature.abilities.saves[key as Stat];

		const newKey
			= {
				str: "strengthSave",
				dex: "dexteritySave",
				con: "constitutionSave",
				wis: "wisdomSave",
				int: "intelligenceSave",
				cha: "charismaSave"
			}[key] ?? "";

		const override = saveData.override;
		let value = statCalc(key as Stat, creature);
		let prof = 0;
		if (override != null) {
			value = override;
			prof = 1;
		}
		else if (saveData.isProficient) {
			value += creature.core.proficiencyBonus;
			prof = 1;
		}
		saves[newKey] = {
			value,
			prof,
			adv: null,
			bonus: 0
		};
	}
	// Final data
	const creatureData = {
		name: creature.description.name,
		proper: creature.description.isProperNoun,
		image_url: creature.description.image || "",
		languages: creature.core.languages,
		cr: crAsString(creature.description.cr),
		xp: creature.description.xp,
		alignment: creature.description.alignment || "",
		size: creature.core.size,
		race: creature.core.race,
		ac: creature.defenses.ac.ac,
		armortype: creature.defenses.ac.acSource,
		hp,
		hitdice,
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
		saves,
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
		spellcasting,
		passiveperc: ppCalc(creature)
	};

	const caster = creature.spellcasting.casterSpells;

	if (caster.casterLevel && caster.castingClass && caster.spellList.flat().length > 0 && Object.keys(caster.spellSlotList ?? {}).length > 0) {
		creatureData.traits.push({
			name: "Spellcasting",
			description: displayCasterCasting(creature),
			automation: null
		});
	}

	const innateCaster = creature.spellcasting.innateSpells;
	if (innateCaster.spellCastingAbility && (innateCaster.spellList[0].length > 0 || innateCaster.spellList[1].length > 0 || innateCaster.spellList[2].length > 0 || innateCaster.spellList[3].length > 0)) {
		const featureName = `Innate Spellcasting${innateCaster.isPsionics ? " (Psionics)" : ""}`;

		creatureData[innateCaster.displayAsAction ? "actions" : "traits"].push({
			name: featureName,
			description: displayInnateCasting(creature),
			automation: null
		});
	}
	return creatureData;
}
