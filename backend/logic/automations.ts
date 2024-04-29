import {app, badwords} from "../utilities/constants";
import {log} from "../utilities/logger";
import limits from "../staticData/limits.json";
import {requireUser, possibleUser} from "./login";
import {getUser, getAutomation, collections, updateAutomation, deleteAutomation} from "../utilities/database";
import {Automation, stringToId} from "../../shared";

//Get info
app.get("/api/automation/:id", requireUser, async (req, res) => {
	try {
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Automation id not valid."});
		let automation = await getAutomation(_id);
		if (!automation) {
			return res.status(404).json({error: "No automation with that id found."});
		}
		let user = await getUser(req.body.id);
		if (automation.owner == user?._id) {
			//Return automation
			log.info(`Retrieved automation with the id ${_id}`);
			return res.json(automation);
		} else {
			return res.status(401).json({error: "You don't have access to this automation."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/my-automations", requireUser, async (req, res) => {
	try {
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find user"});
		let allAutomations = (await collections.automations?.find({owner: user._id}).toArray()) ?? [];
		log.info(`Retrieved ${allAutomations.length} automations from the current user with the id ${user._id}`);
		return res.json(allAutomations);
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

app.get("/api/my-automations/list", requireUser, async (req, res) => {
	try {
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find user"});
		let allAutomations = (await collections.automations?.find({owner: user._id}).toArray()) ?? [];
		log.info(`Retrieved all automations in list form from the current user with the id ${req.params.userid}`);
		return res.json(
			allAutomations.map((a) => {
				a.name, a._id;
			}) ?? []
		);
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Update info
app.post("/api/automation/:id/update", requireUser, async (req, res) => {
	try {
		//Get input
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Invalid automation id."});
		if (!req.body.data) return res.status(400).json({error: "Automation data not found."});
		let data = {
			...({
				_id: _id,
				automation: null,
				name: "New automation",
				description: "",
				owner: user._id
			} as Automation),
			...(req.body.data as Partial<Automation>)
		} as Automation;
		data._id = _id;
		//Check limits
		if (data.name.length > limits.nameLength) return res.status(400).json({error: `Name exceeds the character limit of ${limits.nameLength} characters.`});
		if (data.name.length < limits.nameMin) return res.status(400).json({error: `Name is less than the minimum character limit of ${limits.nameMin} characters.`});
		if (data.description.length > limits.descriptionLength) return res.status(400).json({error: `Description exceeds the character limit of ${limits.descriptionLength} characters.`});
		//Remove bad words
		let usedBadwords: string[] = [];
		badwords.filter(data.name, (badword) => {
			usedBadwords.push(badword);
		});
		if (usedBadwords.length > 0) return res.status(400).json({error: `Automation name includes blocked words or phrases. Matched: ${usedBadwords.join(", ")}. If you think this was a mistake, please file a bug report.`});
		usedBadwords = [];
		badwords.filter(data.description, (badword) => {
			usedBadwords.push(badword);
		});
		if (usedBadwords.length > 0) return res.status(400).json({error: `Automation description includes blocked words or phrases. Matched: ${usedBadwords.join(", ")}. If you think this was a mistake, please file a bug report.`});
		//Update existing automation
		let automation = await getAutomation(data._id);
		if (automation) {
			if (automation.owner != user._id) return res.status(401).json({error: "You don't have permission to update this automation."});
			//Limit properties that are editable:
			let update = {
				name: data.name,
				automation: data.automation
			};
			//Update:
			let updatedId = await updateAutomation(update as Automation, data._id);
			if (updatedId) {
				log.info(`Updated automation with the id ${data._id}`);
				return res.status(200).json(data);
			}
		} else {
			return res.status(404).json({error: "No automation with that id found."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

app.post("/api/automation/add", requireUser, async (req, res) => {
	try {
		//Get input
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		if (!req.body.data) return res.status(400).json({error: "Automation data not found."});
		let data = {
			...({
				automation: null,
				name: "",
				description: "",
				owner: user._id
			} as Automation),
			...(req.body.data as Partial<Automation>)
		} as Automation;
		//Check limits
		if (data.name.length > limits.nameLength) return res.status(400).json({error: `Name exceeds the character limit of ${limits.nameLength} characters.`});
		if (data.name.length < limits.nameMin) return res.status(400).json({error: `Name is less than the minimum character limit of ${limits.nameMin} characters.`});
		if (data.description.length > limits.descriptionLength) return res.status(400).json({error: `Description exceeds the character limit of ${limits.descriptionLength} characters.`});
		//Remove bad words
		let usedBadwords: string[] = [];
		badwords.filter(data.name, (badword) => {
			usedBadwords.push(badword);
		});
		if (usedBadwords.length > 0) return res.status(400).json({error: `Automation name includes blocked words or phrases. Matched: ${usedBadwords.join(", ")}. If you think this was a mistake, please file a bug report.`});
		usedBadwords = [];
		badwords.filter(data.description, (badword) => {
			usedBadwords.push(badword);
		});
		if (usedBadwords.length > 0) return res.status(400).json({error: `Automation description includes blocked words or phrases. Matched: ${usedBadwords.join(", ")}. If you think this was a mistake, please file a bug report.`});
		//Create new automation
		let _id = await updateAutomation(data);
		if (!_id) return res.status(500).json({error: "Failed to create automation."});
		data._id = _id;
		data.owner = user._id!;
		log.info(`Created new automation with the id ${_id}`);
		return res.status(201).json(data);
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

app.get("/api/automation/:id/delete", requireUser, async (req, res) => {
	try {
		//Get input
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Automation id not valid."});
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		//Permissions
		let automation = await getAutomation(_id);
		if (!automation) return res.status(404).json({error: "Couldn't find automation."});
		if (automation.owner != user._id) return res.status(401).json({error: "You don't have permission to delete this automation."});
		//Remove from db
		let status = await deleteAutomation(_id);
		if (status) {
			log.info(`Deleted automation with the id ${_id}`);
			res.json({});
		} else {
			res.status(500).json({error: "Failed to delete creature."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
