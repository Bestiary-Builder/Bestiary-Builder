import { possibleUser, requireUser } from "./login";
import { checkBestiaryPermission } from "./bestiaries";
import { validateCreatureInput } from "./validation";
import { app, checkCreatureAmountLimit, checkCreatureLimits, limits } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { createCreature, deleteCreature, getBestiary, getBestiaryCreatureCount, getCreature, getCreaturesByBestiary, getPrismaClient, updateCreature } from "@/utilities/database";
import type { Creature, Statblock, User } from "~/shared";
import { defaultStatblock } from "~/shared";
import { checkBadwords } from "@/utilities/badwords";

// Check creature permissions
export async function checkCreaturePermission(creature: Creature, user: User | null) {
	if (!user)
		return false;
	const bestiary = await getBestiary(creature.bestiaryId);
	if (!bestiary)
		return false;
	const bestiaryPermissionLevel = await checkBestiaryPermission(bestiary, user);
	if (bestiaryPermissionLevel === "none")
		return false;
	else return true;
}

// Get info
app.get("/api/creature/:id", possibleUser, async (req, res) => {
	try {
		const user = req.body.user;
		const _id = req.params.id;
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
		const bestiaryId = req.params.id;
		const bestiary = bestiaryId ? await getBestiary(bestiaryId) : null;
		if (bestiary) {
			if (await checkBestiaryPermission(bestiary, user) !== "none") {
				const creatures = await getCreaturesByBestiary(bestiaryId);
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
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });

		// Make sure all fields are present
		const oldStats = data.stats;
		const stats = {} as Statblock;
		for (const key in defaultStatblock) {
			const k = key as keyof Statblock;
			stats[k] = { ...defaultStatblock[k], ...(oldStats ? oldStats[k] : {}) } as any;
		}
		// Check limits
		const limitError = checkCreatureLimits(stats);
		if (limitError)
			return res.status(400).json({ error: limitError });
		// Check image link
		let image = stats.description.image as string;
		// remove any url parameters from the string
		if (image) {
			try {
				image = new URL(image).origin + new URL(image).pathname;
				stats.description.image = image;
			}
			catch {
				return res.status(400).json({ error: `Invalid image url.` });
			}
		}
		let failedToImportImage = false;
		if (image && image !== "") {
			if (!image.startsWith("https")) {
				stats.description.image = "";
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
				stats.description.image = "";
				failedToImportImage = true;
			}
		}
		data.stats = stats;
		// Get bestiary
		const bestiary = await getBestiary(data.bestiaryId);
		if (!bestiary)
			return res.status(404).json({ error: "Bestiary not found" });
		// Remove bad words
		if (bestiary.status !== "private") {
			const nameError = checkBadwords(stats.description.name);
			if (nameError)
				return res.status(400).json({ error: `Creature name ${nameError}` });
			const descError = checkBadwords(stats.description.description);
			if (descError)
				return res.status(400).json({ error: `Creature description ${descError}` });
		}
		// Check permissions
		if (["none", "view"].includes(await checkBestiaryPermission(bestiary, user)))
			return res.status(401).json({ error: "You don't have permission to add creature to this bestiary." });
		// Check amount of creatures:
		const count = await getBestiaryCreatureCount(bestiary.id);
		const amountError = checkCreatureAmountLimit(count);
		if (amountError)
			return res.status(400).json({ error: amountError });
		// Set creature index
		data.index = (await getPrismaClient().creature.findFirst({ where: { bestiaryId: bestiary.id }, orderBy: { index: "desc" } }))?.index ?? count ?? 0;
		// Add creature
		const _id = await createCreature(data);
		if (!_id)
			return res.status(500).json({ error: "Failed to create creature." });
		data.id = _id;
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
		const _id = req.params.id;
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
		if (typeof data.bestiaryId == "string") {
			const _id = data.bestiaryId;
			if (!_id)
				return res.status(400).json({ error: "Invalid creature id in body." });
			data.bestiaryId = _id;
		}
		if (typeof data.id == "string") {
			const _id = data.id;
			if (!_id)
				return res.status(400).json({ error: "Invalid bestiary id." });
			data.id = _id;
		}
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		// Make sure all fields are present
		const oldStats = data.stats;
		const stats = {} as Statblock;
		for (const key in defaultStatblock) {
			const k = key as keyof Statblock;
			stats[k] = { ...defaultStatblock[k], ...oldStats[k] } as any;
		}
		// Check limits
		const limitError = checkCreatureLimits(stats);
		if (limitError)
			return res.status(400).json({ error: limitError });
		// Check image link
		let image = stats.description.image as string;
		// remove any url parameters from the string
		if (image) {
			try {
				image = new URL(image).origin + new URL(image).pathname;
				stats.description.image = image;
			}
			catch {
				return res.status(400).json({ error: `Invalid image url.` });
			}
		}
		let failedToImportImage = false;
		if (image && image !== "") {
			if (!image.startsWith("https")) {
				stats.description.image = "";
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
				stats.description.image = "";
				failedToImportImage = true;
			}
		}
		data.stats = stats;
		// Get bestiary
		const bestiary = await getBestiary(data.bestiaryId);
		if (!bestiary)
			return res.status(404).json({ error: "Bestiary not found" });
		// Remove bad words
		if (bestiary.status !== "private") {
			const nameError = checkBadwords(stats.description.name);
			if (nameError)
				return res.status(400).json({ error: `Creature name ${nameError}` });
			const descError = checkBadwords(stats.description.description);
			if (descError)
				return res.status(400).json({ error: `Creature description ${descError}` });
		}
		// Check permissions
		if (["none", "view"].includes(await checkBestiaryPermission(bestiary, user)))
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
		const _id = req.params.id;
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

// Update creature order
app.post("/api/bestiary/:id/creatures/order", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		const bestiaryId = req.params.id;
		const bestiary = bestiaryId ? await getBestiary(bestiaryId) : null;
		if (!bestiary)
			return res.status(404).json({ error: "No bestiary with that id found." });

		const prisma = getPrismaClient();

		const creatureIds = req.body.data;
		if (!creatureIds || !Array.isArray(creatureIds))
			return res.status(400).json({ error: "Invalid creature id array." });

		// Get creatures from bestiary
		const bestiaryCreatures = (await prisma.creature.findMany({ where: { bestiaryId: bestiary.id }, select: { id: true } })).map(c => c.id);

		// Check that user owns all bestiarie
		if (creatureIds.some(id => !bestiaryCreatures.includes(id)))
			return res.status(403).json({ error: "Specified creatures are not part of this bestiary." });

		// Set index for each bestiary, and any unspecified gets set last
		const result = await prisma.$transaction(bestiaryCreatures.map((creatureId) => {
			let index = creatureIds.indexOf(creatureId);
			if (index < 0)
				index = creatureIds.length + 1;
			return prisma.creature.update(({ where: { id: creatureId }, data: { index } }))
		}));

		if (result.length === bestiaryCreatures.length)
			return res.status(200).json({});
		else
			return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
