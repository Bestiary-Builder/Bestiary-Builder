import { writeFile } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const creatures = {}; // copied from SrdCreatures.json

for (const creature in creatures) {
	const data = creatures[creature];

	for (const save in data.abilities.saves) {
		data.abilities.saves[save].adv = null;
	}

	for (const skill in data.abilities.skills) {
		data.abilities.skills[skill].adv = null;
	}
}

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

writeFile(path.resolve(__dirname, "../staticData/srdCreatures.json"), JSON.stringify(creatures, null, 4), { flag: "w" }, err => err);
