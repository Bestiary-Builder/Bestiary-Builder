import fetch from "node-fetch";
import { app } from "@/utilities/constants";
import { requireUser } from "../main/login";
import "@/utilities/env";

const API = "https://api.avrae.io/characters";
const HEADERS = {
	"Content-Type": "application/json",
	"Authorization": process.env.AVRAE_TOKEN || ""
};

app.get("/api/character/list", requireUser, async (req, res) => {
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
});

app.post("/api/character/:upstream/attacks/add/", requireUser, async (req, res) => {
	const automationList = req.body.data;
	const upstream = req.params.upstream;

	if (!upstream)
		return res.status(400).json({ error: "No character ID given." });
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
		headers: HEADERS,
		body: JSON.stringify(currentAttacks.concat(automationList))
	}).then(response => response.json());
	if (putAttacks?.error)
		return res.status(500).json({ error: putAttacks.error });
	return res.json(putAttacks);
});

app.post("/api/character/:upstream/attacks/set/", requireUser, async (req, res) => {
	const automationList = req.body.data;
	const upstream = req.params.upstream;

	if (!upstream)
		return res.status(400).json({ error: "No character ID given." });
	const putAttacks = await fetch(`${API}/${upstream}/attacks`, {
		method: "PUT",
		headers: HEADERS,
		body: JSON.stringify(automationList)
	}).then(response => response.json());
	if (putAttacks?.error)
		return res.status(500).json({ error: putAttacks.error });
	return res.json(putAttacks);
});
