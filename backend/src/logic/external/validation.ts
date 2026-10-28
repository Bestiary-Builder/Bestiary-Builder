import type { Response } from "express";

import type { AutomationConsumables, AutomationModel, IValidation, Statblock } from "~/shared";
import fetch from "node-fetch";
// Validate input
import { app } from "@/utilities/constants";
import { interfaceValidation, validateAutomationConsumables, validateAutomationModel, validateStatblock } from "~/shared";

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

type Checker = (input: unknown) => IValidation;

export function validateInput(input: unknown, checker: Checker, res: Response, dataName: string) {
	const result = checker(input);
	if (result.success)
		return true;

	res.status(400).json({ error: `${dataName} data not valid:\n${interfaceValidation(result.errors)}` });
	return false;
}

export function validateCreatureInput(input: Statblock, res: Response) {
	return validateInput(input, validateStatblock, res, "Creature");
}

export function validateAutomationInput(input: AutomationModel, res: Response) {
	return validateInput(input, validateAutomationModel, res, "Automation");
}

export function validateAutomationConsumablesInput(input: AutomationConsumables, res: Response) {
	return validateInput(input, validateAutomationConsumables, res, "Automation consumables");
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
