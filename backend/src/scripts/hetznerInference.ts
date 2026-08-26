import { readFile } from "node:fs/promises";

import YAML from "yaml";

import "dotenv/config";

const API_URL = "https://inference.hetzner.com/api/v1/chat/completions";

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

async function main() {
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
		...selectRecordExamples(srd2014, "SRDAttacks2014.json", [
			"Aarakocra - Talon",
			"Aboleth - Mucous Cloud"
		]),
		...selectRecordExamples(srd2024, "SRDAttacks2024.json", [
			"Animated Armor - Slam",
			"Ankheg - Bite",
			"Adult Black Dragon - Acid Breath (Recharge 5-6)"
		])
	];

	const formattedExamples = formatExamples(examples);
	const formattedDocumentation = JSON.stringify(automationDocumentation, null, 2);

	const systemPrompt = `You are an Avrae automation generator.
Generate automation that follows the supplied automation documentation and the patterns demonstrated by the examples.
Return only the complete automation value as valid raw JSON. Do not include Markdown fences, explanations, commentary, or any text outside the JSON.

AUTOMATION DOCUMENTATION
${formattedDocumentation}

VALID EXAMPLES
${formattedExamples}`;

	const newDescription = `*Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 5 (1d6 + 2) slashing damage.`;
	const prompt = `Generate the automation for the following description:
${newDescription}`;
	const startTime = performance.now();

	const response = await fetch(API_URL, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${apiToken}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			model,
			messages: [
				{
					role: "system",
					content: systemPrompt
				},
				{
					role: "user",
					content: prompt
				}
			]
		})
	});

	const responseBody = await response.text();
	const responseTime = performance.now() - startTime;
	console.log(`Response time: ${responseTime.toFixed(0)} ms`);

	if (!response.ok) {
		throw new Error(`Hetzner Inference API returned ${response.status} ${response.statusText}:\n${responseBody}`);
	}

	try {
		const response = JSON.parse(responseBody);
		// console.dir(response, { depth: null });

		for (const choice of response.choices) {
			const output = JSON.parse(choice.message.content.trim());

			console.log(`Response ${choice.index} (JSON):`);
			console.log(output);
			console.log(`Response ${choice.index} (YAML):`);
			console.log(YAML.stringify(output));
		}
	}
	catch {
		console.log(responseBody);
	}
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
