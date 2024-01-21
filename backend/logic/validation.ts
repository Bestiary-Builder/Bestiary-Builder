import {log} from "../logger";
import {app} from "../server";
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

