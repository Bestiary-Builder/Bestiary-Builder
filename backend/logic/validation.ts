import fetch from "node-fetch";

// Validate input
import { createCheckers } from "ts-interface-checker";
import type { Response } from "express";
import { app } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import type { Statblock } from "~/shared";
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
	return res.json(result);
});
const { Statblock: StatblockChecker } = createCheckers(typeInterface);

export function validateCreatureInput(input: Statblock, res: Response) {
	if (StatblockChecker.test(input)) {
		return true;
	}
	else {
		res.status(400).json({ error: `Creature data not valid:\n${interfaceValidation(StatblockChecker.validate(input) ?? [])}` });
		return false;
	}
}

app.post("/api/validate/creature", async (req, res) => {
	try {
		// Get input
		const data = req.body.data as Statblock;
		if (!data)
			return res.status(400).json({ error: "Creature data not found." });
		// Validate input
		if (!validateCreatureInput(data, res))
			return;
		return res.json({ valid: true });
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
