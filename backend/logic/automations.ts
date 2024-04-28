import {app} from "../utilities/constants";
import {log} from "../utilities/logger";
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
		log.info(`Retrieved all automations from the current user with the id ${req.params.userid}`);
		return res.json(allAutomations);
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
				json: "",
				name: "",
				owner: user._id
			} as Automation),
			...(req.body.data as Partial<Automation>)
		} as Automation;
		data._id = _id;
		//Update existing automation
		let automation = await getAutomation(data._id);
		if (automation) {
			if (automation.owner != user._id) return res.status(401).json({error: "You don't have permission to update this automation."});
			//Limit properties that are editable:
			let update = {
				name: data.name,
				json: data.json
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

app.post("api/automation/add", requireUser, async (req, res) => {
	try {
		//Get input
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		if (!req.body.data) return res.status(400).json({error: "Automation data not found."});
		let data = {
			...({
				json: "",
				name: "",
				owner: user._id
			} as Automation),
			...(req.body.data as Partial<Automation>)
		} as Automation;
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
