import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Adjust these two to match your layout, relative to THIS script file
const inputPath = resolve(__dirname, "../attackModel.ts");
const outputPath = resolve(__dirname, "attackModelForTypia.ts");

const src = readFileSync(inputPath, "utf8");
const out = src.replace(
	"export type IntExpression = string;",
	"export type IntExpression = string | number;",
);

if (out === src) {
	throw new Error("IntExpression alias not found; the types file may have changed.");
}

writeFileSync(
	outputPath,
	"// AUTO-GENERATED from attackModel.ts. Do not edit or import outside src/validation. Strictly for Typia.\n" +
		out,
);