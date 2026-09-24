import type { Response } from "express";
import type { Checker } from "ts-interface-checker";

import type { AutomationConsumables, Statblock } from "~/shared";
import fetch from "node-fetch";
// Validate input
import { createCheckers } from "ts-interface-checker";
import { app } from "@/utilities/constants";
import { interfaceValidation, typeInterface } from "~/shared";

app.post("/api/validate/automation", async (req, res) => {
	const automation = req.body.data;
	const result = await fetch("https://api.avrae.io/characters/attacks/validate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(automation)
	}).then(response => response.json());

	if (result.success)
		return res.json(result);
	else
		return res.status(400).json(result);
});
const {
	AutomationConsumables: AutomationConsumablesChecker,
	SearchOptions: SearchOptionsChecker,
	Statblock: StatblockChecker
} = createCheckers(typeInterface);

export { AutomationConsumablesChecker, SearchOptionsChecker, StatblockChecker };

export function validateInput(input: unknown, checker: Checker, res: Response, dataName: string) {
	if (checker.test(input))
		return true;

	res.status(400).json({ error: `${dataName} data not valid:\n${interfaceValidation(checker.validate(input) ?? [])}` });
	return false;
}

export function validateCreatureInput(input: Statblock, res: Response) {
	return validateInput(input, StatblockChecker, res, "Creature");
}

export function validateAutomationConsumablesInput(input: AutomationConsumables, res: Response) {
	return validateInput(input, AutomationConsumablesChecker, res, "Automation consumables");
}

app.post("/api/validate/creature", async (req, res) => {
	// Get input
	const data = req.body.data as Statblock;
	if (!data)
		return res.status(400).json({ error: "Creature data not found." });
	// Validate input
	if (!validateCreatureInput(data, res))
		return;
	return res.json({ valid: true });
});
