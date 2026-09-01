import type { AttackModel, AutomationConsumables } from "~/shared";
import fetch from "node-fetch";
import { app } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import "@/utilities/env";
import type { AutomationConsumable } from "~/shared";

const API = "https://api.avrae.io";

app.get("/api/character/list", async (req, res) => {
	try {
		const result = await fetch(`${API}/characters`, {
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

const mergeByName = <T extends AttackModel>(firstList: T[], secondList: T[]): T[] => {
	const secondNames = new Set(secondList.map(item => item.name));
	const filteredFirstList = firstList.filter(item => !secondNames.has(item.name));
	return [...filteredFirstList, ...secondList];
};

app.post("/api/character/:upstream/attacks/add", async (req, res) => {
	const body: { automationList: AttackModel[], consumables: AutomationConsumables } = req.body.data
	const automationList = body.automationList
	const consumables = body.consumables

	const upstream = req.params.upstream;

	if (!upstream)
		return res.status(400).json({ error: "No character ID given." });
	try {
		const currentAttacks = await fetch(`${API}/characters/${upstream}/attacks`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": req.headers["avrae-token"] || ""
			}
		}).then(response => response.json());

		if (currentAttacks?.error)
			return res.status(500).json({ error: currentAttacks.error });

		const attacks = mergeByName(currentAttacks, automationList);
		const putAttacks = await fetch(`${API}/characters/${upstream}/attacks`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				"Authorization": req.headers["avrae-token"] || ""
			},
			body: JSON.stringify(attacks)
		}).then(response => response.json());

		if (putAttacks?.error)
			return res.status(500).json({ error: putAttacks.error });

		if (consumables.length > 0) {
			const currentConsumables = await fetch(`${API}/characters/${upstream}/consumables`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": req.headers["avrae-token"] || ""
				}
			}).then(response => response.json());

			if (currentConsumables?.error)
				return res.status(500).json({ error: currentAttacks.error });

			for (const consumable of consumables) {
				if (!currentConsumables.map((c: AutomationConsumable) => c.name).includes(consumable.name)) {
					if (consumable.value === null) {
						consumable.value = 0
					}

					const addConsumable = await fetch(`${API}/characters/${upstream}/consumables`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": req.headers["avrae-token"] || ""
						},
						body: JSON.stringify(consumable)
					}).then(response => response.json());

					if (addConsumable.error) {
						return res.status(500).json({ error: addConsumable.error });
					}
				}
			}
		}

		return res.json(putAttacks);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/character/:upstream/attacks/set", async (req, res) => {
	const automationList = req.body.data;
	const upstream = req.params.upstream;

	if (!upstream)
		return res.status(400).json({ error: "No character ID given." });
	try {
		const putAttacks = await fetch(`${API}/characters/${upstream}/attacks`, {
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

const GVAR_CREATED_REGEX = /^Gvar ([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}) created\.$/;
app.post("/api/character/makeattackgvar", async (req, res) => {
	const automationList = req.body.data;

	if (!automationList)
		return res.status(400).json({ error: "No automation given." });

	try {
		const createGvar = await fetch(`${API}/customizations/gvars`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": process.env.DUMMY_AVRAE_TOKEN || ""
			},
			body: JSON.stringify({ value: automationList })
		}).then(response => response.text());

		const match = createGvar.match(GVAR_CREATED_REGEX);
		if (match) {
			return res.json({ gvarId: match[1] });
		}
		else {
			return res.status(500).json({ error: createGvar });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});