import { readFile } from "node:fs/promises";

import YAML from "yaml";

import { validateAutomation } from "../logic/external/automationValidation";

import "dotenv/config";
import { readFileSync } from "node:fs";

const API_URL = "https://inference.hetzner.com/api/v1/chat/completions";
const MAX_TRIES = 3;

function requireEnv(name: string): string {
	const value = process.env[name]?.trim();
	if (!value)
		throw new Error(`Missing required environment variable: ${name}`);
	return value;
}

interface AutomationExample {
	name: string;
	description: string;
	automation: unknown;
}

interface PromptExample extends AutomationExample {
	source: string;
}

interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

async function readJson(relativePath: string): Promise<unknown> {
	return JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));
}

function parseExample(value: unknown, source: string, identifier: string): PromptExample {
	if (
		typeof value !== "object"
		|| value === null
		|| typeof (value as Partial<AutomationExample>).name !== "string"
		|| typeof (value as Partial<AutomationExample>).description !== "string"
		|| !("automation" in value)
	) {
		throw new Error(`Invalid automation example ${identifier} in ${source}`);
	}

	const example = value as AutomationExample;
	return { ...example, source };
}

function selectRecordExamples(dataset: unknown, source: string, keys: string[]): PromptExample[] {
	if (typeof dataset !== "object" || dataset === null || Array.isArray(dataset))
		throw new TypeError(`Expected ${source} to contain an object of examples`);

	const examples = dataset as Record<string, unknown>;
	return keys.map((key) => {
		if (!(key in examples))
			throw new Error(`Missing automation example ${key} in ${source}`);
		return parseExample(examples[key], source, key);
	});
}

function selectArrayExamples(dataset: unknown, source: string, names: string[]): PromptExample[] {
	if (!Array.isArray(dataset))
		throw new TypeError(`Expected ${source} to contain an array of examples`);

	return names.map((name) => {
		const value = dataset.find(example => (
			typeof example === "object"
			&& example !== null
			&& "name" in example
			&& example.name === name
		));
		if (!value)
			throw new Error(`Missing automation example ${name} in ${source}`);
		return parseExample(value, source, name);
	});
}

function formatExamples(examples: PromptExample[]): string {
	return examples.map((example, index) => [
		`Example ${index + 1}: ${example.name}`,
		`Source: ${example.source}`,
		"Description:",
		example.description || "(No description provided by this generic example.)",
		"Automation:",
		JSON.stringify(example.automation, null, 2)
	].join("\n")).join("\n\n");
}

async function requestCompletion(apiToken: string, model: string, messages: ChatMessage[]): Promise<string> {
	const startTime = performance.now();
	const response = await fetch(API_URL, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${apiToken}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ model, messages })
	});
	const responseBody = await response.text();
	const responseTime = performance.now() - startTime;
	console.log(`Response time: ${responseTime.toFixed(0)} ms`);

	if (!response.ok)
		throw new Error(`Hetzner Inference API returned ${response.status} ${response.statusText}:\n${responseBody}`);

	const result = JSON.parse(responseBody) as {
		choices?: Array<{ message?: { content?: unknown } }>;
	};
	const content = result.choices?.[0]?.message?.content;
	if (typeof content !== "string")
		throw new TypeError("Hetzner Inference API response did not contain a message");

	return content.trim();
}

function parseAutomationResponse(content: string): unknown {
	return JSON.parse(content);
}

function formatValidationErrors(result: unknown): string {
	return JSON.stringify(result, null, 2) ?? String(result);
}

async function main() {
	const description = process.argv.slice(2).join(" ").trim();
	if (!description)
		throw new Error("Usage: npm run prompt:hetzner -- \"<description>\"");

	const apiToken = requireEnv("HETZNER_API_TOKEN");
	const model = requireEnv("HETZNER_AI_MODEL");

	const [srd2014, srd2024, basicExamples, automationDocumentation] = await Promise.all([
		readJson("../staticData/2014/SRDAttacks2014.json"),
		readJson("../staticData/2024/SRDAttacks2024.json"),
		readJson("../staticData/shared/basicExamples.json"),
		readJson("../staticData/automationDocumentation.json")
	]);

	const examples = [
		...selectArrayExamples(basicExamples, "basicExamples.json", [
			"Versatile Attack",
			"Save for Half Damage (Recharge 5-6)",
			"Attack with Save against Poison Damage"
		]),
		...selectRecordExamples(srd2024, "SRDAttacks2024.json", [
			"Animated Armor - Slam",
			"Ankheg - Bite",
			"Adult Black Dragon - Acid Breath (Recharge 5-6)",
			"Aboleth - Tentacle",
			"Berserker - Greataxe",
			"Phase Spider - Bite",
			"Shambling Mound - Engulf"
		])
	];

	const formattedExamples = formatExamples(examples);
	const formattedDocumentation = JSON.stringify(automationDocumentation, null, 2);
	const rstDocumentation = readFileSync("src/staticData/automationDocumentation.rst");
	const aliasStatblockType = readFileSync("src/staticData/aliasStatblockType.txt");

	const systemPrompt = `You are an Avrae automation generator.
Generate automation that follows the supplied automation documentation and the patterns demonstrated by the examples.
Return only the complete automation value as valid raw JSON. Do not include Markdown fences, explanations, commentary, or any text outside the JSON.
Use the runtime variables from the documentation to express conditionals inside a condition node.

AUTOMATION DOCUMENTATION:
${rstDocumentation}

Alias statblock class documentation:
${aliasStatblockType}

VALID EXAMPLES:
${formattedExamples}`;

	const prompt = `Generate the full automation for the following description:
${description}`;

	const messages: ChatMessage[] = [
		{ role: "system", content: systemPrompt },
		{ role: "user", content: prompt }
	];

	for (let retry = 0; retry < MAX_TRIES; retry++) {
		const content = await requestCompletion(apiToken, model, messages);
		let output: unknown;
		let validationErrors: string;

		try {
			output = parseAutomationResponse(content);
		}
		catch (error) {
			validationErrors = `The response was not valid JSON: ${error instanceof Error ? error.message : String(error)}`;
			if (retry === MAX_TRIES - 1) {
				console.error("Failed");
				return;
			}
			messages.push(
				{ role: "assistant", content },
				{
					role: "user",
					content: `The previous response was invalid. Fix it using the original instructions and description.\n\nErrors:\n${validationErrors}\n\nReturn only the corrected raw JSON.`
				}
			);
			console.log("Failed to parse response, retrying...");
			continue;
		}

		const validationResult = await validateAutomation(output);
		if (validationResult.success) {
			console.log("Response (JSON):");
			console.log(output);
			console.log("Response (YAML):");
			console.log(YAML.stringify(output));
			return;
		}

		validationErrors = formatValidationErrors(validationResult);
		if (retry === MAX_TRIES - 1) {
			console.error("Failed");
			return;
		}

		messages.push(
			{ role: "assistant", content },
			{
				role: "user",
				content: `The previous automation failed validation. Fix it using the original instructions and description.\n\nValidator errors:\n${validationErrors}\n\nReturn only the corrected raw JSON.`
			}
		);
		console.log("Response was invalid, retrying...");
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
