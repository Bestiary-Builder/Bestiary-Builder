import { app } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { collections, getBestiary, incrementBestiaryViewCount } from "@/utilities/database";
import { type FeatureEntity, Id, type SaveEntity, type Saves, type Stat, type Statblock, fullSpellAbilityName, hpCalc, statCalc, stringToId } from "~/shared";


app.get("/api/homebrewery/export/bestiary/:id", async (req, res) => {
	log.info("HERE")
	try {
		const bestiaryId = stringToId(req.params.id);

		if (!bestiaryId)
			return res.status(400).json({ error: "Bestiary id not valid." });

		const bestiary = bestiaryId ? await getBestiary(bestiaryId) : null;

		if (!bestiary)
			return res.status(404).json({ error: "No bestiary with that id found." });

		if (bestiary.status === "private")
			return res.status(401).json({ error: "This bestiary is private" });

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

        const data = {
            metadata: {
                name: "HERE"
            }
        }
        return res.json(data)
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

function getValue<T>(obj: Record<string, any>, key: string, def: T): T {
	const value = obj[key];

	return value !== undefined && value !== "" ? value : def;
}

function getStatString(stat: Stat, creature: Statblock): string {
	return `${creature.abilities.stats[stat]} (${statCalc(stat, creature) >= 0 ? "+" : ""}${statCalc("str", creature)})`
}

function formatActions(actions: FeatureEntity[], title: string): string {
	if (!actions.length)
		return "";

	const formatted_string = actions.map(action => `***${action.name}.*** ${action.description}`).join("\n:\n");
	return `### ${title}\n${formatted_string}\n:\n`;
}

function formatSaves(creature: Statblock): string{
	const saves: string[] = []
	for (const [saveName, saveInfo] of Object.entries(creature.abilities.saves) as [Stat, SaveEntity][]) {
		if (!saveInfo.isProficient)
			continue;

		const mod = statCalc(saveName, creature) + creature.core.proficiencyBonus
		const value = saveInfo.override != null ? saveInfo.override : mod
		saves.push(`${saveName} ${value}`);
	}

	return saves.join(", ")
}

export function getCreatureMarkdown(creature: Statblock) {
	const frame = "{{monster,frame,wide";
	const name = getValue(creature.description, "name", "Unknown Creature");
	const creature_type = getValue(creature.core, "race", "Uknown Type");
	const alignment = getValue(creature.description, "alignment", "Unknown Alignment");
	const ac = getValue(creature.defenses, "ac", "Unknown AC");
	const hp = hpCalc(creature);

	// Stats
	const statline = `|  STR  |  DEX  |  CON  |  INT  |  WIS  |  CHA  |
    |:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
    |${getStatString("str", creature)}|${getStatString("dex", creature)}|${getStatString("con",creature)}|${getStatString("int", creature)}|${getStatString("wis", creature)}|${getStatString("cha", creature)}`;

	// Additional Attributes
	const attr_string = [formatSaves(creature)].filter(x => x != null).join("\n")

	return `
    ${frame}
    ## ${name}
    *${creature.core.size} ${creature_type}, ${alignment}*

    **Armor Class** :: ${ac}
    **Hit Points** :: ${hp}
    ___
    ${statline}
	___
	${attr_string}
    ___
    ${formatActions(creature.features.actions, "Actions")}
    }}}}
    {{pagenumber,auto}}
    \\page
    `.trim();
}
