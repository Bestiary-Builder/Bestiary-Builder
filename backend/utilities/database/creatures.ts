import type { JsonObject } from "@prisma/client/runtime/client";
import { getPrismaClient } from ".";
import { log } from "@/utilities/logger";
import type { Creature, CreatureCreateInput, CreatureCreateManyInput, Id } from "~/shared";

// Creature functions
export async function getCreature(id: Id) {
	try {
		log.log("database", `Getting creature with the id ${id}.`);
		return await getPrismaClient().creature.findUnique({ where: { id } });
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateCreature(data: Creature, id?: Id) {
	try {
		const creature: CreatureCreateInput = { ...data, stats: data.stats as JsonObject, bestiary: { connect: { id: data.bestiaryId } } };
		data.lastUpdated = new Date(Date.now());
		log.log("database", `Upserting creature with the id ${id}.`);
		return (await getPrismaClient().creature.upsert({ where: { id }, update: creature, create: creature })).id;
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function createCreatures(data: CreatureCreateManyInput[]) {
	try {
		const now = new Date(Date.now());
		log.log("database", `Creating ${data.length} creatures.`);
		return await getPrismaClient().creature.createMany({ data: data.map(creature => ({ ...creature, lastUpdated: now })) });
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}

export async function getCreaturesByBestiary(bestiaryId: Id) {
	try {
		return await getPrismaClient().creature.findMany({ where: { bestiaryId } });
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function getCreaturesByIds(ids: Id[]) {
	try {
		if (!ids.length)
			return [];
		return await getPrismaClient().creature.findMany({ where: { id: { in: ids } } });
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function deleteCreature(creatureId: Id) {
	try {
		log.log("database", `Deleting creature with the id ${creatureId}.`);
		return await getPrismaClient().$transaction(async () => {
			const creature = await getCreature(creatureId);
			if (!creature)
				return false;
			await getPrismaClient().creature.delete({ where: { id: creatureId } });
			return true;
		});
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}
