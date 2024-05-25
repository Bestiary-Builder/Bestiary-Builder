import { possibleUser, requireUser } from "./login";
import { checkBestiaryPermission } from "./bestiaries";
import { validateCreatureInput } from "./validation";
import { app, checkCreatureAmountLimit, checkCreatureLimits, limits } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { addCreatureToBestiary, collections, deleteCreature, getBestiary, getCreature, updateCreature } from "@/utilities/database";
import type { Creature, Statblock, User } from "~/shared";
import { defaultStatblock, stringToId } from "~/shared";
import { checkBadwords } from "@/utilities/badwords";

// Check creature permissions
async function checkCreaturePermission(creature: Creature, user: User | null) {
	if (!user)
		return false;
	const bestiary = await getBestiary(creature.bestiary);
	if (!bestiary)
		return false;
	const bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
	if (bestiaryPermissionLevel === "none")
		return false;
	else return true;
}

// Get info
app.get("/api/creature/:id", possibleUser, async (req, res) => {
	try {
		const user = req.body.user;
		const _id = stringToId(req.params.id);
		if (!_id)
			return res.status(400).json({ error: "Creature id not valid." });
		const creature = await getCreature(_id);
		if (creature) {
			const permissionLevel = await checkCreaturePermission(creature, user);
			if (permissionLevel) {
				log.info(`Retrieved creature with the id ${_id}`);
				return res.json(creature);
			}
			else {
				return res.status(401).json({ error: "You don't have permission to view this creature." });
			}
		}
		else {
			return res.status(404).json({ error: "No creature with that id found." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/bestiary/:id/creatures", possibleUser, async (req, res) => {
	try {
		const user = req.body.user;
		const bestiaryId = stringToId(req.params.id);
		const bestiary = bestiaryId ? await getBestiary(bestiaryId) : null;
		if (bestiary) {
			if (checkBestiaryPermission(bestiary, user) !== "none") {
				const creatures = (await collections.creatures?.find({ _id: { $in: bestiary.creatures } }).toArray()) ?? [];
				log.info(`Retrieved creatures from bestiary with the id ${bestiaryId}`);
				return res.json(creatures);
			}
			else {
				return res.status(401).json({ error: "You don't have permission to view this bestiary." });
			}
		}
		else {
			return res.status(404).json({ error: "No bestiary with that id found." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

// Update info
app.post("/api/creature/add", requireUser, async (req, res) => {
	try {
		// Get input
		const data = req.body.data as Creature;
		if (!data)
			return res.status(400).json({ error: "Creature data not found." });
		if (!validateCreatureInput(data.stats, res))
			return;
		if (typeof data.bestiary == "string") {
			const _id = stringToId(data.bestiary);
			if (!_id)
				return res.status(400).json({ error: "Invalid creature id in body." });
			data.bestiary = _id;
		}
		if (typeof data._id == "string") {
			const _id = stringToId(data._id);
			if (!_id)
				return res.status(400).json({ error: "Invalid bestiary id." });
			data._id = _id;
		}
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });

		// Make sure all fields are present
		const oldStats = data.stats;
		data.stats = {} as Statblock;
		for (const key in defaultStatblock) {
			const k = key as keyof Statblock;
			data.stats[k] = { ...defaultStatblock[k], ...oldStats[k] } as any;
		}
		// Check limits
		const limitError = checkCreatureLimits(data);
		if (limitError)
			return res.status(400).json({ error: limitError });
		// Check image link
		let image = data.stats.description.image as string;
		// remove any url parameters from the string
		if (image) {
			try {
				image = new URL(image).origin + new URL(image).pathname;
				data.stats.description.image = image;
			}
			catch {
				return res.status(400).json({ error: `Invalid image url.` });
			}
		}
		let failedToImportImage = false;
		if (image && image !== "") {
			if (!image.startsWith("https")) {
				data.stats.description.image = "";
				failedToImportImage = true;
			}
			let isApproved = false;
			if (!failedToImportImage) {
				for (const format of limits.imageFormats) {
					if (image.endsWith(`.${format}`))
						isApproved = true;
				}
			}
			if (!isApproved) {
				data.stats.description.image = "";
				failedToImportImage = true;
			}
		}
		// Get bestiary
		const bestiary = await getBestiary(data.bestiary);
		if (!bestiary)
			return res.status(404).json({ error: "Bestiary not found" });
		// Remove bad words
		if (bestiary.status !== "private") {
			const nameError = checkBadwords(data.stats.description.name);
			if (nameError)
				return res.status(400).json({ error: `Creature name ${nameError}` });
			const descError = checkBadwords(data.stats.description.description);
			if (descError)
				return res.status(400).json({ error: `Creature description ${descError}` });
		}
		// Check permissions
		if (["none", "view"].includes(checkBestiaryPermission(bestiary, user)))
			return res.status(401).json({ error: "You don't have permission to add creature to this bestiary." });
		// Check amount of creatures:
		const amountError = checkCreatureAmountLimit(bestiary);
		if (amountError)
			return res.status(400).json({ error: amountError });
		// Add creature
		const _id = await updateCreature(data);
		if (!_id)
			return res.status(500).json({ error: "Failed to create creature." });
		await addCreatureToBestiary(_id, data.bestiary);
		data._id = _id;
		log.info(`New creature created with the id: ${_id}`);
		if (failedToImportImage)
			return res.status(400).json({ error: "Image link not recognized as an allowed image format. Make sure it is from a secure https location and ends in an image file format extension (e.g. .png)" });
		return res.status(201).json(data);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.post("/api/creature/:id/update", requireUser, async (req, res) => {
	try {
		// Get input
		const _id = stringToId(req.params.id);
		if (!_id)
			return res.status(400).json({ error: "Creature id not valid." });
		const creature = await getCreature(_id);
		if (!creature)
			return res.status(404).json({ error: "No creature with that id found." });
		const data = req.body.data as Creature;
		if (!data)
			return res.status(400).json({ error: "Creature data not found." });
		if (!validateCreatureInput(data.stats, res))
			return;
		if (typeof data.bestiary == "string") {
			const _id = stringToId(data.bestiary);
			if (!_id)
				return res.status(400).json({ error: "Invalid creature id in body." });
			data.bestiary = _id;
		}
		if (typeof data._id == "string") {
			const _id = stringToId(data._id);
			if (!_id)
				return res.status(400).json({ error: "Invalid bestiary id." });
			data._id = _id;
		}
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		// Make sure all fields are present
		const oldStats = data.stats;
		data.stats = {} as Statblock;
		for (const key in defaultStatblock) {
			const k = key as keyof Statblock;
			data.stats[k] = { ...defaultStatblock[k], ...oldStats[k] } as any;
		}
		// Check limits
		const limitError = checkCreatureLimits(data);
		if (limitError)
			return res.status(400).json({ error: limitError });
		// Check image link
		let image = data.stats.description.image as string;
		// remove any url parameters from the string
		if (image) {
			try {
				image = new URL(image).origin + new URL(image).pathname;
				data.stats.description.image = image;
			}
			catch {
				return res.status(400).json({ error: `Invalid image url.` });
			}
		}
		let failedToImportImage = false;
		if (image && image !== "") {
			if (!image.startsWith("https")) {
				data.stats.description.image = "";
				failedToImportImage = true;
			}
			let isApproved = false;
			if (!failedToImportImage) {
				for (const format of limits.imageFormats) {
					if (image.endsWith(`.${format}`))
						isApproved = true;
				}
			}
			if (!isApproved) {
				data.stats.description.image = "";
				failedToImportImage = true;
			}
		}
		// Get bestiary
		const bestiary = await getBestiary(data.bestiary);
		if (!bestiary)
			return res.status(404).json({ error: "Bestiary not found" });
		// Remove bad words
		if (bestiary.status !== "private") {
			const nameError = checkBadwords(data.stats.description.name);
			if (nameError)
				return res.status(400).json({ error: `Creature name ${nameError}` });
			const descError = checkBadwords(data.stats.description.description);
			if (descError)
				return res.status(400).json({ error: `Creature description ${descError}` });
		}
		// Check permissions
		if (["none", "view"].includes(checkBestiaryPermission(bestiary, user)))
			return res.status(401).json({ error: "You don't have permission to update this creature." });
		// Update creature
		const updatedId = await updateCreature(data, _id);
		if (updatedId) {
			log.info(`Updated creature with the id ${_id}`);
			if (failedToImportImage)
				return res.status(400).json({ error: "Image link not recognized as an allowed image format. Make sure it is from a secure https location and ends in an image file format extension (e.g. .png)" });
			return res.status(201).json(data);
		}
		else {
			throw new Error(`Failed to update creature with the id: ${_id}`);
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/creature/:id/delete", requireUser, async (req, res) => {
	try {
		// Get input
		const _id = stringToId(req.params.id);
		if (!_id)
			return res.status(400).json({ error: "Creature id not valid." });
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		// Permissions
		const creature = await getCreature(_id);
		if (!creature)
			return res.status(404).json({ error: "Couldn't find creature with that id." });
		if (!(await checkCreaturePermission(creature, user)))
			return res.status(401).json({ error: "You don't have permission to delete this creature." });
		// Remove from db
		const status = await deleteCreature(_id);
		if (status) {
			log.info(`Deleted creature with the id ${_id}`);
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
