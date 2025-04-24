import { possibleUser } from "./login";
import { checkBestiaryPermission } from "./bestiaries";
import { checkCreaturePermission } from "./creatures";
import { app } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { collections, getBestiary, getCreature, incrementBestiaryViewCount } from "@/utilities/database";
import { type FeatureEntity, Id, SKILLS_BY_STAT, type SaveEntity, type Stat, type Statblock, capitalizeFirstLetter, displayCasterCasting, displayInnateCasting, displaySpeedOrSenses, hpCalc, ppCalc, statCalc, stringToId } from "~/shared";

app.get("/api/homebrewery/export/bestiary/:id", possibleUser, async (req, res) => {
	try {
		const bestiaryId = stringToId(req.params.id);
		const user = req.body.user;

		if (!bestiaryId)
			return res.status(400).json({ error: "Bestiary id not valid." });

		const bestiary = bestiaryId ? await getBestiary(bestiaryId) : null;

		if (!bestiary)
			return res.status(404).json({ error: "No bestiary with that id found." });

		if (checkBestiaryPermission(bestiary, user) === "none")
			return res.status(401).json({ error: "You don't have access to this bestiary." });

		incrementBestiaryViewCount(bestiaryId);
		const creatures: string[] = [];

		for (const creatureID of bestiary.creatures) {
			const creature = await collections.creatures?.findOne({ _id: new Id(creatureID) });

			if (!creature)
				continue;

			try {
				const creature_markdown = getCreatureMarkdown(creature.stats);
				creatures.push(creature_markdown);
			}
			catch (err) {
				log.log("critical", err);
				return res.status(500).json({ error: `Error exporting ${creature.stats.description.name}. Please contact the developers of Bestiary Builder, not Avrae.` });
			}
		}

		return res.json({ metadata: creatures.join("\n") });
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/homebrewery/export/creature/:id", possibleUser, async (req, res) => {
	try {
		const creatureID = stringToId(req.params.id);
		const user = req.body.user;

		if (!creatureID)
			return res.status(400).json({ error: "Creature id not valid." });

		const creature = await getCreature(creatureID);

		if (!creature)
			return res.status(404).json({ error: "No creature with that id found." });

		const permissionLevel = await checkCreaturePermission(creature, user);

		if (!permissionLevel)
			return res.status(401).json({ error: "You don't have permission to view this creature." });

		try {
			const creature_markdown = getCreatureMarkdown(creature.stats);
			return res.json({ metadata: creature_markdown });
		}
		catch (err) {
			log.log("critical", err);
			return res.status(500).json({ error: `Error exporting ${creature.stats.description.name}. Please contact the developers of Bestiary Builder, not Avrae.` });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

function getValue<T>(obj: Record<string, any>, key: string, def: T): T {
	const value = obj[key];

	if (Array.isArray(value) && value.length === 0)
		return def;

	return value !== undefined && value !== "" ? value : def;
}

function getStatString(stat: Stat, creature: Statblock): string {
	return `${creature.abilities.stats[stat]} (${statCalc(stat, creature) >= 0 ? "+" : ""}${statCalc(stat, creature)})`;
}

function formatActions(actions: FeatureEntity[], title: string): string | null {
	if (!actions.length || actions.length === 0)
		return null;

	const formatted_string = actions.map(action => `***${action.name}.*** ${action.description}`).join("\n:\n");
	return `### ${title}\n${formatted_string}\n:\n`;
}

function formatSaves(creature: Statblock): string | undefined {
	const output: string[] = [];
	for (const [saveName, saveInfo] of Object.entries(creature.abilities.saves) as [Stat, SaveEntity][]) {
		if (!saveInfo.isProficient && saveInfo.override === null)
			continue;

		const mod = statCalc(saveName, creature) + creature.core.proficiencyBonus;
		const value = saveInfo.override != null ? saveInfo.override : mod;
		output.push(`${capitalizeFirstLetter(saveName.toString())} ${value >= 0 ? "+" : "-"}${value}`);
	}
	return output.length > 0 ? output.join(", ") : undefined;
}

function formatSkills(creature: Statblock): string | undefined {
	const output: string[] = [];

	for (const [stat, skills] of Object.entries(SKILLS_BY_STAT) as [Stat, string[]][]) {
		skills.forEach((skill) => {
			const rawSkill = creature.abilities.skills.find(a => a.skillName.replace(" ", "").toLowerCase() === skill.toLowerCase());

			if (rawSkill && (rawSkill.isExpertise || rawSkill.isHalfProficient || rawSkill.isProficient || rawSkill.override !== null)) {
				const base = statCalc(stat, creature);
				const value = rawSkill.override
					? rawSkill.override
					: rawSkill.isHalfProficient
						? base + Math.floor(creature.core.proficiencyBonus / 2)
						: rawSkill.isProficient
							? base + creature.core.proficiencyBonus
							: rawSkill.isExpertise ? base + creature.core.proficiencyBonus * 2 : base;

				output.push(`${rawSkill.skillName} ${value >= 0 ? "+" : "-"}${value}`);
			}
		});
	}
	return output.length > 0 ? output.join(", ") : undefined;
}

export function getCreatureMarkdown(creature: Statblock) {
	// Basic Information
	const frame = "{{monster,frame,wide";
	const name = getValue(creature.description, "name", "Unknown Creature");
	const creatureType = getValue(creature.core, "race", "Uknown Type");
	const alignment = getValue(creature.description, "alignment", "Unknown Alignment");
	const ac = getValue(creature.defenses.ac, "ac", "Unknown AC");
	const armorType = getValue(creature.defenses.ac, "acSource", undefined);
	const hp = hpCalc(creature);
	const hpStr = getValue(creature.defenses.hp, "override", undefined) ? "" : ` (${creature.defenses.hp.numOfHitDie}d${creature.defenses.hp.sizeOfHitDie})`;
	const speed = displaySpeedOrSenses(creature.core.speed);
	const image = getValue(creature.description, "image", undefined);
	const imageStr = image ? `![${name}](${image}){float:right;width:100px}` : "";

	// Stats
	const statline = `|  STR  |  DEX  |  CON  |  INT  |  WIS  |  CHA  |
|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
|${getStatString("str", creature)}|${getStatString("dex", creature)}|${getStatString("con", creature)}|${getStatString("int", creature)}|${getStatString("wis", creature)}|${getStatString("cha", creature)}`;

	// Additional Attributes - Conditional
	const saves = formatSaves(creature);
	const skills = formatSkills(creature);
	const immunities = getValue(creature.defenses, "immunities", undefined);
	const resistances = getValue(creature.defenses, "resistances", undefined);
	const senses = displaySpeedOrSenses(creature.core.senses);
	const passivePerception = ppCalc(creature);
	const sense_string = senses === "" ? `Passive Perception ${passivePerception}` : `${senses}, Passive Perception ${passivePerception}`;
	const languages = getValue(creature.core, "languages", ["None"]);
	const challenge = getValue(creature.description, "cr", "Unknown Challenge");
	const xp = getValue(creature.description, "xp", 0);
	const proficiencyBonus = getValue(creature.core, "proficiencyBonus", 0);

	const attrString = [
		saves ? `**Saving Throws** :: ${saves}` : null,
		skills ? `**Skills** :: ${skills}` : null,
		immunities ? `**Condition Immunities** :: ${immunities.join(", ")}` : null,
		resistances ? `**Resistances** :: ${resistances.join(", ")}` : null,
		sense_string,
		`**Languages** :: ${languages.join(", ")}`,
		`**Challenge** :: ${challenge} (${xp} XP) {{bonus **Proficiency Bonus** +${proficiencyBonus}}}`
	].filter(x => x !== null).join("\n");

	// Pre-fetching actions
	const actions = creature.features.actions;

	// Traits
	const traits = creature.features.features;
	const caster = creature.spellcasting.casterSpells;
	const innateCaster = creature.spellcasting.innateSpells;

	if (caster.casterLevel && caster.castingClass && caster.spellList.flat().length > 0 && Object.keys(caster.spellSlotList ?? {}).length > 0) {
		traits.push({
			name: "Spellcasting",
			description: displayCasterCasting(creature).replaceAll("\n", "\n\n"),
			automation: null
		});
	}

	if (innateCaster.spellCastingAbility && (innateCaster.spellList[0].length > 0 || innateCaster.spellList[1].length > 0 || innateCaster.spellList[2].length > 0 || innateCaster.spellList[3].length > 0)) {
		const featureName = `Innate Spellcasting${innateCaster.isPsionics ? " (Psionics)" : ""}`;

		const feat = {
			name: featureName,
			description: displayInnateCasting(creature).replaceAll("\n", "\n\n"),
			automation: null
		};

		if (innateCaster.displayAsAction)
			actions.push(feat);
		else
			traits.push(feat);
	}

	const traitStr = traits.map(t => `***${t.name}.*** ${t.description}`).join("\n:\n");

	// Actions
	const actionString = [
		formatActions(actions, "Actions"),
		formatActions(creature.features.bonus, "Bonus Actions"),
		formatActions(creature.features.reactions, "Reactions"),
		formatActions(creature.features.legendary, "Legendary Actions"),
		formatActions(creature.features.lair, "Lair Actions"),
		formatActions(creature.features.mythic, "Mythic Actions"),
		formatActions(creature.features.regional, "Regional Actions")
	].filter(x => x != null).join("\n");

	return `${frame}
${imageStr}
## ${name}
*${creature.core.size} ${creatureType}, ${alignment}*
___
**Armor Class** :: ${ac}${armorType ? ` (${armorType})` : ""}
**Hit Points** :: ${hp}${hpStr}
**Speed** :: ${speed}
___
${statline}
___
${attrString}
___
${traitStr}
${actionString}
}}
{{pagenumber,auto}}
\\page`.trim();
}
