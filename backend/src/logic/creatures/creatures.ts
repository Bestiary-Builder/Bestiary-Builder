import type { Creature, User } from "~/shared";
import { app, checkCreatureAmountLimit } from "@/src/utilities/constants";
import { createCreature, deleteCreature, getBestiary, getBestiaryCreatureCount, getCreature, getCreaturesByBestiary, getPrismaClient, updateCreature } from "@/src/utilities/database";
import { log } from "@/src/utilities/logger";
import { canEditBestiary, checkBestiaryPermission } from "../collections/bestiaries";
import { validateCreatureInput } from "../external/validation";
import { possibleUser, requireUser } from "../main/login";
import { prepareCreatureStats } from "./creaturePreparation";

// Check creature permissions
export async function checkCreaturePermission(creature: Creature, user: User | null) {
	const bestiary = await getBestiary(creature.bestiaryId);
	if (!bestiary)
		return false;
	const bestiaryPermissionLevel = await checkBestiaryPermission(bestiary, user);
	return bestiaryPermissionLevel !== "none";
}

// Get info
app.get("/api/creature/:id", possibleUser, async (req, res) => {
	const user = req.user;
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
});
app.get("/api/bestiary/:id/creatures", possibleUser, async (req, res) => {
	const user = req.user;
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
});

// Update info
app.post("/api/creature/add", requireUser, async (req, res) => {
	// Get input
	const data = req.body.data as Creature;
	if (!data)
		return res.status(400).json({ error: "Creature data not found." });
	if (!validateCreatureInput(data.stats, res))
		return;
	const user = req.user!;

	// Get bestiary
	const bestiary = await getBestiary(data.bestiaryId);
	if (!bestiary)
		return res.status(404).json({ error: "Bestiary not found" });
	const prepared = prepareCreatureStats(data.stats, bestiary.status);
	if (prepared.error)
		return res.status(400).json({ error: prepared.error });
	data.stats = prepared.stats;
	// Check permissions
	if (!await canEditBestiary(bestiary, user))
		return res.status(401).json({ error: "You don't have permission to add creatures to this bestiary." });
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
	if (prepared.imageWarning)
		return res.status(400).json({ error: prepared.imageWarning });
	return res.status(201).json(data);
});
app.post("/api/creature/:id/update", requireUser, async (req, res) => {
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
	const user = req.user!;
	// Get bestiary
	const bestiary = await getBestiary(data.bestiaryId);
	if (!bestiary)
		return res.status(404).json({ error: "Bestiary not found" });
	const prepared = prepareCreatureStats(data.stats, bestiary.status);
	if (prepared.error)
		return res.status(400).json({ error: prepared.error });
	data.stats = prepared.stats;
	// Check permissions
	if (!await canEditBestiary(bestiary, user))
		return res.status(401).json({ error: "You don't have permission to update this creature." });
	// Update creature
	const updatedId = await updateCreature(data, _id);
	if (updatedId) {
		log.info(`Updated creature with the id ${_id}`);
		if (prepared.imageWarning)
			return res.status(400).json({ error: prepared.imageWarning });
		return res.status(201).json(data);
	}
	else {
		throw new Error(`Failed to update creature with the id: ${_id}`);
	}
});
app.get("/api/creature/:id/delete", requireUser, async (req, res) => {
	// Get input
	const _id = req.params.id;
	if (!_id)
		return res.status(400).json({ error: "Creature id not valid." });
	const user = req.user!;
	// Permissions
	const creature = await getCreature(_id);
	if (!creature)
		return res.status(404).json({ error: "Couldn't find creature with that id." });
	const bestiary = await getBestiary(creature.bestiaryId);
	if (!bestiary || !await canEditBestiary(bestiary, user))
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
});

// Update creature order
app.post("/api/bestiary/:id/creatures/order", requireUser, async (req, res) => {
	const user = req.user!;
	const bestiaryId = req.params.id;
	const bestiary = bestiaryId ? await getBestiary(bestiaryId) : null;
	if (!bestiary)
		return res.status(404).json({ error: "No bestiary with that id found." });
	if (!await canEditBestiary(bestiary, user))
		return res.status(401).json({ error: "You don't have permission to reorder creatures in this bestiary." });

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
		return prisma.creature.update(({ where: { id: creatureId }, data: { index } }));
	}));

	if (result.length === bestiaryCreatures.length)
		return res.status(200).json({});
	throw new Error("Failed to update creature order.");
});
