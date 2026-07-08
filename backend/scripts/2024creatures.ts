import { writeFile } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import data from "./input/5eToolsSRDCreatures2024.json";
import { parseFrom5eTools } from "@/logic/5eTools";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export function doTheThing() {
	const parsedCreatures = [];

	for (const creature of data)
		parsedCreatures.push(parseFrom5eTools(creature)[0]);

	writeFile(path.resolve(__dirname, "../staticData/srdCreatures2024.json"), JSON.stringify(parsedCreatures, null, 4), { flag: "w" }, err => err);
}

doTheThing();
