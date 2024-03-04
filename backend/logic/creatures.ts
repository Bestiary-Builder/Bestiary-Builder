import {badwords, app} from "../utilities/constants";
import {log} from "../utilities/logger";
import {requireUser, possibleUser} from "./login";
import {addCreatureToBestiary, collections, getBestiary, getCreature, getUser, updateCreature, deleteCreature} from "../utilities/database";
import {User, Bestiary, Creature, Statblock, defaultStatblock, Id, stringToId} from "../../shared";
import {checkBestiaryPermission} from "./bestiaries";
import limits from "../staticData/limits.json";
import { validateCreatureInput } from "./validation"
//Get info
app.get("/api/creature/:id", possibleUser, async (req, res) => {
	try {
		let user = await getUser(req.body.id);
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Creature id not valid."});
		let creature = await getCreature(_id);
		if (creature) {
			let bestiary = await getBestiary(creature.bestiary);
			if (!bestiary) return res.status(404).json({error: "Bestiary creature is in, was not found-"});
			let bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
			if (bestiaryPermissionLevel != "none") {
				log.info(`Retrieved creature with the id ${_id}`);
				return res.json(creature);
			} else {
				return res.status(401).json({error: "You don't have permission to view this creature-"});
			}
		} else {
			return res.status(404).json({error: "No creature with that id found-"});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/bestiary/:id/creatures", possibleUser, async (req, res) => {
	try {
		let user = await getUser(req.body.id);
		let bestiaryId = new Id(req.params.id);
		let bestiary = await getBestiary(bestiaryId);
		if (bestiary) {
			if (checkBestiaryPermission(bestiary, user) != "none") {
				let creatures = (await collections.creatures?.find({_id: {$in: bestiary.creatures}}).toArray()) ?? [];
				log.info(`Retrieved creatures from bestiary with the id ${bestiaryId}`);
				return res.json(creatures);
			} else {
				return res.status(401).json({error: "You don't have permission to view this bestiary."});
			}
		} else {
			return res.status(404).json({error: "No bestiary with that id found."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Update info
app.post("/api/creature/:id?/update", requireUser, async (req, res) => {
	try {
		//Get input
		let id = req.params.id;
		let data = req.body.data as Creature;
		if (!data) return res.status(400).json({error: "Creature data not found."});
		if (!validateCreatureInput(data.stats, res)) return;
		if (typeof data.bestiary == "string") {
			let _id = stringToId(data.bestiary);
			if (!_id) return res.status(400).json({error: "Invalid creature id in body."});
			data.bestiary = _id;
		}
		if (typeof data._id == "string") {
			let _id = stringToId(data._id);
			if (!_id) return res.status(400).json({error: "Invalid bestiary id."});
			data._id = _id;
		}
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find current user."});

		//Make sure all fields are present
		let oldStats = data.stats;
		data.stats = {} as Statblock;
		for (let key in defaultStatblock) {
			//@ts-ignore
			data.stats[key] = {...defaultStatblock[key], ...oldStats[key]};
		}
		//Check limits
		if (data.stats.description.name.length > limits.nameLength) return res.status(400).json({error: `Name exceeds the character limit of ${limits.nameLength} characters.`});
		if (data.stats.description.name.length < limits.nameMin) return res.status(400).json({error: `Name is less than the minimum character limit of ${limits.nameMin} characters.`});
		if (data.stats.description.description.length > limits.descriptionLength) return res.status(400).json({error: `Description exceeds the character limit of ${limits.descriptionLength} characters.`});
		//Check image link
		let image = data.stats.description.image as string;
		// remove any url parameters from the string
		if (image) {
			image = new URL(image).origin + new URL(image).pathname;
			data.stats.description.image = image;
		}

		let failedToImportImage = false;
		if (image && image != "") {
			if (!image.startsWith("https")) {
				data.stats.description.image = "";
				failedToImportImage = true;
			}
			let isApproved = false;
			if (!failedToImportImage)
				for (let format of limits.imageFormats) {
					if (image.endsWith("." + format)) isApproved = true;
				}
			if (!isApproved) {
				data.stats.description.image = "";
				failedToImportImage = true;
			}
		}
		//Update or add
		if (id) {
			//Update existing creature
			let _id = stringToId(id);
			if (!_id) return res.status(400).json({error: "Creature id not valid."});
			let creature = await getCreature(_id);
			if (!creature) return res.status(404).json({error: "No creature with that id found."});
			let bestiary = await getBestiary(creature.bestiary);
			if (!bestiary) return res.status(404).json({error: "Bestiary not found."});
			//Check owner
			let bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
			if (["none", "view"].includes(bestiaryPermissionLevel)) return res.status(401).json({error: "You don't have permission to update this creature."});
			//Remove bad words
			if (bestiary.status != "private") {
				let usedBadwords: string[] = [];
				badwords.filter(data.stats.description.name, (badword) => {
					usedBadwords.push(badword);
				});
				if (usedBadwords.length > 0) return res.status(400).json({error: `Creature name includes blocked words or phrases. Remove the badwords or make the bestiary private. Matched: ${usedBadwords.join(", ")}. If you think this was a mistake, please file a bug report.`});
				usedBadwords = [];
				badwords.filter(data.stats.description.description, (badword) => {
					usedBadwords.push(badword);
				});
				if (usedBadwords.length > 0) return res.status(400).json({error: `Creature description includes blocked words or phrases. Remove the badwords or make the bestiary private. Matched: ${usedBadwords.join(", ")}. If you think this was a mistake, please file a bug report.`});
			}
			//Update creature
			let updatedId = await updateCreature(data, _id);
			if (updatedId) {
				log.info(`Updated creature with the id ${_id}`);
				if (failedToImportImage) return res.status(400).json({error: "Image link not recognized as an allowed image format. Make sure it is from a secure https location and ends in an image file format extension (e.g. .png)"});
				return res.status(201).json(data);
			} else {
				throw new Error(`Failed to update creature with the id: ${_id}`);
			}
		} else {
			//Create new creature
			let bestiary = await getBestiary(data.bestiary);
			if (!bestiary) return res.status(404).json({error: "Bestiary not found"});
			//Check owner
			let bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
			if (["none", "view"].includes(bestiaryPermissionLevel)) return res.status(401).json({error: "You don't have permission to add creature to this bestiary."});
			//Check amount of creatures:
			if (bestiary.creatures.length >= limits.creatureAmount) return res.status(400).json({error: `Number of creatures exceeds the limit of ${limits.creatureAmount}.`});
			//Remove bad words
			if (bestiary.status != "private") {
				if (badwords.check(data.stats.description.name)) return res.status(400).json({error: "Creature name includes blocked words or phrases. Remove the badwords or make the bestiary private."});
				if (badwords.check(data.stats.description.description)) return res.status(400).json({error: "Creature description includes blocked words or phrases. Remove the badwords or make the bestiary private."});
			}
			let _id = await updateCreature(data);
			if (!_id) return res.status(500).json({error: "Failed to create creature."});
			await addCreatureToBestiary(_id, data.bestiary);
			data._id = _id;
			log.info(`New creature created with the id: ${_id}`);
			if (failedToImportImage) return res.status(400).json({error: "Image link not recognized as an allowed image format. Make sure it is from a secure https location and ends in an image file format extension (e.g. .png)"});
			return res.status(201).json(data);
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/creature/:id/delete", requireUser, async (req, res) => {
	try {
		//Get input
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Creature id not valid."});
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		//Permissions
		let creature = await getCreature(_id);
		if (!creature) return res.status(404).json({error: "Couldn't find creature with that id."});
		let bestiary = await getBestiary(creature.bestiary);
		if (!bestiary) return res.status(404).json({error: "Couldn't find bestiary creature is in."});
		let bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
		if (["none", "view"].includes(bestiaryPermissionLevel)) return res.status(401).json({error: "You don't have permission to delete this creature."});
		//Remove from db
		let status = await deleteCreature(_id);
		if (status) {
			log.info(`Deleted creature with the id ${_id}`);
			res.json({});
		} else {
			res.status(500).json({error: "Failed to delete creature."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
