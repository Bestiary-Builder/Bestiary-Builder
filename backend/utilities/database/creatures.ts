import type { JsonObject } from "@prisma/client/runtime/client";
import { getPrismaClient } from ".";
import { log } from "@/utilities/logger";
import type { Id } from "~/shared";
import type { Creature, CreatureCreateInput, CreatureCreateManyInput } from "~/shared/src/prisma-types";

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
export async function createCreature(data: Creature) {
	try {
		const creature: CreatureCreateInput = { stats: data.stats as JsonObject, lastUpdated: new Date(Date.now()), bestiary: { connect: { id: data.bestiaryId } } };
		log.log("database", `Creating creature.`);
		return (await getPrismaClient().creature.create({ data: creature })).id;
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateCreature(data: Creature, id: Id) {
	try {
		const creature: CreatureCreateInput = { stats: data.stats as JsonObject, lastUpdated: new Date(Date.now()), bestiary: { connect: { id: data.bestiaryId } } };
		log.log("database", `Updating creature with the id ${id}.`);
		return (await getPrismaClient().creature.update({ where: { id }, data: creature })).id;
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
		return await getPrismaClient().creature.findMany({ where: { bestiaryId }, orderBy: { index: "asc" } });
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
