import { writeFile } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import data from "./input/5eToolsSRDCreatures2024.json";
import { parseFrom5eTools } from "@/logic/5eTools";
import type { Statblock } from "~/shared";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export function doTheThing() {
	console.log("Updating 2024 creatures is currently manually disabled because it wipes out all the actions which have to be manually readded. Reconsider.");
	return;
	const parsedCreatures = {} as { [key: string]: Statblock };

	for (const creature of data) {
		const cData = parseFrom5eTools(creature)[0];
		parsedCreatures[cData.description.name] = cData;
	}

	writeFile(path.resolve(__dirname, "../staticData/2024/SRDCreatures2024.json"), JSON.stringify(parsedCreatures, null, 4), { flag: "w" }, err => err);
}
