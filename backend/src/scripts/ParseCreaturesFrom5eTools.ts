import type { Statblock } from "../../shared";
import { writeFile } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrom5eTools } from "../logic/5eTools";
import data from "./input/5eToolsSRDCreatures2014.json";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export function doTheThing() {
	console.log("Updating creatures is currently manually disabled because it wipes out all the actions which have to be manually readded. Reconsider.");
	return;
	// return;
	const parsedCreatures = {} as { [key: string]: Statblock };

	for (const creature of data) {
		const cData = parseFrom5eTools(creature)[0];
		parsedCreatures[cData.description.name] = cData;
	}

	writeFile(path.resolve(__dirname, "../staticData/2014/SRDCreatures2014.json"), JSON.stringify(parsedCreatures, null, 4), { flag: "w" }, err => err);
}
