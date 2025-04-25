import { requireUser } from "./login";
import { app, checkAutomationLimits } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { collections, deleteAutomation, getAutomation, updateAutomation } from "@/utilities/database";
import type { Automation } from "~/shared";
import { stringToId } from "~/shared";
import { checkBadwords } from "@/utilities/badwords";

// Get info
app.get("/api/automation/:id", requireUser, async (req, res) => {
	try {
		const _id = stringToId(req.params.id);
		if (!_id)
			return res.status(400).json({ error: "Automation id not valid." });
		const automation = await getAutomation(_id);
		if (!automation)
			return res.status(404).json({ error: "No automation with that id found." });

		const user = req.body.user;
		if (automation.owner === user?._id) {
			// Return automation
			log.info(`Retrieved automation with the id ${_id}`);
			return res.json(automation);
		}
		else {
			return res.status(401).json({ error: "You don't have access to this automation." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/my-automations", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find user" });
		const allAutomations = (await collections.automations?.find({ owner: user._id }).toArray()) ?? [];
		log.info(`Retrieved ${allAutomations.length} automations from the current user with the id ${user._id}`);
		return res.json(allAutomations);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/my-automations/list", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find user" });
		const allAutomations = (await collections.automations?.find({ owner: user._id }).toArray()) ?? [];
		log.info(`Retrieved all automations in list form from the current user with the id ${req.params.userid}`);
		return res.json(
			// eslint-disable-next-line array-callback-return
			allAutomations.map((a) => {
				// eslint-disable-next-line ts/no-unused-expressions, no-sequences
				a.name, a._id;
			}) ?? []
		);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

// Update info
app.post("/api/automation/:id/update", requireUser, async (req, res) => {
	try {
		// Get input
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		const _id = stringToId(req.params.id);
		if (!_id)
			return res.status(400).json({ error: "Invalid automation id." });
		if (!req.body.data)
			return res.status(400).json({ error: "Automation data not found." });
		const data = {
			...({
				_id,
				automation: null,
				name: "New automation",
				description: "",
				owner: user._id
			} as Automation),
			...(req.body.data as Partial<Automation>)
		} as Automation;
		data._id = _id;

		// Check limits
		const limitError = checkAutomationLimits(data);
		if (limitError)
			return res.status(400).json({ error: limitError });
		// Remove bad words
		const nameError = checkBadwords(data.name);
		if (nameError)
			return res.status(400).json({ error: `Automation name ${nameError}` });
		const descError = checkBadwords(data.description);
		if (descError)
			return res.status(400).json({ error: `Automation description ${descError}` });
		// Update existing automation
		const automation = await getAutomation(data._id);
		if (automation) {
			if (automation.owner !== user._id)
				return res.status(401).json({ error: "You don't have permission to update this automation." });
			// Limit properties that are editable:
			const update = {
				name: data.name,
				automation: data.automation,
				description: data.description
			};

			// Update:
			const updatedId = await updateAutomation(update as Automation, data._id);
			if (updatedId) {
				log.info(`Updated automation with the id ${data._id}`);
				return res.status(200).json(data);
			}
		}
		else {
			return res.status(404).json({ error: "No automation with that id found." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/automation/add", requireUser, async (req, res) => {
	try {
		// Get input
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		if (!req.body.data)
			return res.status(400).json({ error: "Automation data not found." });
		const data = {
			...({
				automation: null,
				name: "",
				description: "",
				owner: user._id
			} as Automation),
			...(req.body.data as Partial<Automation>)
		} as Automation;
		// Check limits
		const limitError = checkAutomationLimits(data);
		if (limitError)
			return res.status(400).json({ error: limitError });
		// Remove bad words
		const nameError = checkBadwords(data.name);
		if (nameError)
			return res.status(400).json({ error: `Automation name ${nameError}` });
		const descError = checkBadwords(data.description);
		if (descError)
			return res.status(400).json({ error: `Automation description ${descError}` });
		// Create new automation
		const _id = await updateAutomation(data);
		if (!_id)
			return res.status(500).json({ error: "Failed to create automation." });
		data._id = _id;
		data.owner = user._id!;
		log.info(`Created new automation with the id ${_id}`);
		return res.status(201).json(data);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/automation/:id/delete", requireUser, async (req, res) => {
	try {
		// Get input
		const _id = stringToId(req.params.id);
		if (!_id)
			return res.status(400).json({ error: "Automation id not valid." });
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		// Permissions
		const automation = await getAutomation(_id);
		if (!automation)
			return res.status(404).json({ error: "Couldn't find automation." });
		if (automation.owner !== user._id)
			return res.status(401).json({ error: "You don't have permission to delete this automation." });
		// Remove from db
		const status = await deleteAutomation(_id);
		if (status) {
			log.info(`Deleted automation with the id ${_id}`);
			res.json({});
		}
		else {
			res.status(500).json({ error: "Failed to delete creature." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
