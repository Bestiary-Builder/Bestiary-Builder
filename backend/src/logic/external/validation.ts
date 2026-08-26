import type { Response } from "express";
import type { Checker } from "ts-interface-checker";

import type { Statblock } from "~/shared";
import { createCheckers } from "ts-interface-checker";
import { app } from "@/utilities/constants";
import { interfaceValidation, typeInterface } from "~/shared";
import { validateAutomation } from "./automationValidation";

app.post("/api/validate/automation", async (req, res) => {
	const result = await validateAutomation(req.body.data);

	if (result.success)
		return res.json(result);
	else
		return res.status(400).json(result);
});
const { SearchOptions: SearchOptionsChecker, Statblock: StatblockChecker } = createCheckers(typeInterface);

export { SearchOptionsChecker, StatblockChecker };

export function validateInput(input: unknown, checker: Checker, res: Response, dataName: string) {
	if (checker.test(input))
		return true;

	res.status(400).json({ error: `${dataName} data not valid:\n${interfaceValidation(checker.validate(input) ?? [])}` });
	return false;
}

export function validateCreatureInput(input: Statblock, res: Response) {
	return validateInput(input, StatblockChecker, res, "Creature");
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
