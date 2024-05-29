// this script imports a list of 5etools creatures into Bestiary Builder data.
// It will attempt to add SRD automation from Avrae to the creature, matching by name
// Use export5eToolsData.js to get bulk data from 5e.tools.
import { writeFile } from "node:fs";
import path from "node:path";
import features from "../staticData/srdFeatures.json";
import data from "./input/5eToolsSRDCreatures.json";
import { parseFrom5eTools } from "@/logic/5eTools";
import type { Features } from "~/shared";

export const activationTypeToDataKey: Record<number, keyof Features> = {
	1: "actions",
	3: "bonus",
	4: "reactions",
	9: "legendary",
	10: "mythic",
	11: "lair",
	// the rest does not have an explicit home in a statblock and therefore goes into features.
	2: "features",
	5: "features",
	6: "features",
	7: "features",
	8: "features",
};
export const dataKeys: Array<keyof Features> = Object.values(activationTypeToDataKey);

const output: Record<string, unknown> = {};

const parsedCreatures = [];

for (const creature of data) {
	parsedCreatures.push(parseFrom5eTools(creature)[0]);
}

// for each srd feature (#903)
for (const feat of features) {
	// formatted as: Goblin - Shortsword
	const belongsTo = feat.name.split(" - ")[0];
	const action = feat.name.split(" - ")[1];
	// for each creature (#322)
	for (const creature of parsedCreatures) {
		const name = creature.description.name;
		// if the current srd feature belongs to the current creature
		if (name === belongsTo) {
			const activationType = feat.automation.activation_type;
			if (!activationType)
				break;

			const key = activationTypeToDataKey[activationType];
			let hasFound = false;
			// if it is of an valid action type
			if (key in dataKeys) {
				// loop through each already known action
				for (const entry in creature.features[key]) {
					const cFeat = creature.features[key][entry];

					// if the srd feature is the current action of the current action type
					if (action.trim() === cFeat.name.replace("(3/Day)", "").replace("(2/Day)", "").replace("(1/Day)", "").replace("(Costs 2 Actions)", "").replace("(Costs 3 Actions)", "").replace("(Costs 1 Actions)", "").trim()) {
						feat.name = cFeat.name;
						feat.automation.name = cFeat.name;
						// save it
						creature.features[key][entry] = feat;
						hasFound = true;
						break;
					}
				}
			}
			if (!hasFound) {
				const type = feat.automation.activation_type;
				const key = activationTypeToDataKey[type];
				// get rid of creature name in action name
				feat.name = action;
				feat.automation.name = action;
				// save it
				creature.features[key].push(feat);
			}
		}
		output[name] = creature;
	}
}

writeFile(path.resolve(__dirname, "../staticData/srdCreatures.json"), JSON.stringify(output, null, 4), { flag: "w" }, err => err);
