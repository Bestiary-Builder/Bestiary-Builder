import fetch from "node-fetch";
import { app } from "@/src/utilities/constants";
import { log } from "@/src/utilities/logger";
import { requireUser } from "../main/login";
import "@/src/utilities/env";

const API = "https://api.avrae.io/characters";

app.get("/api/character/list", requireUser, async (req, res) => {
	try {
		const result = await fetch(`${API}/meta`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": req.headers["avrae-token"] || ""
			}
		}).then(response => response.json());
		if (result?.error)
			return res.status(500).json({ error: result.error });
		else
			return res.json(result);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/character/:upstream/attacks/add/", requireUser, async (req, res) => {
	const automationList = req.body.data;
	const upstream = req.params.upstream;

	if (!upstream)
		return res.status(400).json({ error: "No character ID given." });
	try {
		const currentAttacks = await fetch(`${API}/${upstream}/attacks`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": req.headers["avrae-token"] || ""
			}
		}).then(response => response.json());
		if (currentAttacks?.error)
			return res.status(500).json({ error: currentAttacks.error });

		const putAttacks = await fetch(`${API}/${upstream}/attacks`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": req.headers["avrae-token"] || ""
			},
			body: JSON.stringify(currentAttacks.concat(automationList))
		}).then(response => response.json());
		if (putAttacks?.error)
			return res.status(500).json({ error: putAttacks.error });
		return res.json(putAttacks);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/character/:upstream/attacks/set/", requireUser, async (req, res) => {
	const automationList = req.body.data;
	const upstream = req.params.upstream;

	if (!upstream)
		return res.status(400).json({ error: "No character ID given." });
	try {
		const putAttacks = await fetch(`${API}/${upstream}/attacks`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": req.headers["avrae-token"] || ""
			},
			body: JSON.stringify(automationList)
		}).then(response => response.json());
		if (putAttacks?.error)
			return res.status(500).json({ error: putAttacks.error });
		return res.json(putAttacks);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/character/makeattackgvar", async (req, res) => {
	const automationList = req.body.data;
	if (!automationList)
		return res.status(400).json({ error: "No automation given." });

	const makeGvar = await fetch(`${API}/customizations/gvars`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": process.env.DUMMY_AVRAE_TOKEN || ""
		},
	});
});
