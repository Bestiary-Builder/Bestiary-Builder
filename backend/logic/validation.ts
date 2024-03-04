import {log} from "../utilities/logger";
import {app} from "../utilities/constants";
import fetch from "node-fetch";

app.post("/api/validate/automation", async (req, res) => {
	let automation = req.body.data;
	let result = await fetch("https://api.avrae.io/characters/attacks/validate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(automation)
	}).then((response) => response.json());
	return res.json(result);
});

//Validate input
import {createCheckers} from "ts-interface-checker";
import {Response} from "express";
import {typeInterface, interfaceValidation, Statblock} from "../../shared";
const {Statblock: StatblockChecker} = createCheckers(typeInterface);

export function validateCreatureInput(input: Statblock, res: Response) {
	if (StatblockChecker.test(input)) {
		return true;
	} else {
		res.status(400).json({error: `Creature data not valid:\n${interfaceValidation(StatblockChecker.validate(input) ?? [])}`});
		return false;
	}
}

app.post("/api/validate/creature", async (req, res) => {
	try {
		//Get input
		let data = req.body.data as Statblock;
		log.log("critical", data);
		if (!data) return res.status(400).json({error: "Creature data not found."});
		//Validate input
		if (!validateCreatureInput(data, res)) return;
		return res.json({valid: true});
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
