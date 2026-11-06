import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Adjust these two to match your layout, relative to THIS script file
const typiaInputPath = path.resolve(__dirname, "../src/typia");
const typiaOutputPath = path.resolve(__dirname, "../src/typia-output/temp");

const typeInputPath = path.resolve(__dirname, "../src");
const typesToCopy = ["statblock.ts", "attackModel.ts"];

// Clear temp folder
try {
	fs.rmSync(typiaOutputPath, { recursive: true });
}
catch { };
// Copy typia files to new temp folder
fs.cpSync(typiaInputPath, typiaOutputPath, { recursive: true });
// Copy attackModel.ts (and change IntExpression)
for (const t of typesToCopy) {
	const src = fs.readFileSync(path.join(typeInputPath, t), "utf8");
	const out = src.replace(
		"export type IntExpression = string;",
		"export type IntExpression = string | number;",
	);
	fs.writeFileSync(
		path.join(typiaOutputPath, t),
		"// AUTO-GENERATED. Do not edit or import outside Typia files. Strictly for Typia.\n".concat(out)
	);
}
