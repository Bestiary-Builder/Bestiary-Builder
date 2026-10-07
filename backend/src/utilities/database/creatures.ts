import type { Id } from "~/shared";
import type { Creature, CreatureCreateInput, CreatureCreateManyInput } from "~/shared/src/prisma-types";
import { log } from "@/utilities/logger";
import { getPrismaClient } from ".";
import { withDatabaseFallback } from "./operations";

// Creature functions
export async function getCreature(id: Id) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Getting creature with the id ${id}.`);
		return await getPrismaClient().creature.findUnique({ where: { id } });
	}, null);
}
export async function getCreatureMetaData(id: Id) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Getting creature metadata with the id ${id}.`);
		return await getPrismaClient().creature.findUnique({
			where: { id },
			include: {
				bestiary: {
					include: {
						owner: {
							select: {
								username: true,
							}
						}
					}
				}
			}
		});
	}, null);
}
export async function createCreature(data: Creature) {
	return await withDatabaseFallback(async () => {
		const creature: CreatureCreateInput = { stats: data.stats, lastUpdated: new Date(Date.now()), index: data.index, bestiary: { connect: { id: data.bestiaryId } } };
		log.log("database", `Creating creature.`);
		return (await getPrismaClient().creature.create({ data: creature })).id;
	}, null);
}
export async function updateCreature(data: Creature, id: Id) {
	return await withDatabaseFallback(async () => {
		const creature: Omit<CreatureCreateInput, "index"> = { stats: data.stats, lastUpdated: new Date(Date.now()), bestiary: { connect: { id: data.bestiaryId } } };
		log.log("database", `Updating creature with the id ${id}.`);
		return (await getPrismaClient().creature.update({ where: { id }, data: creature })).id;
	}, null);
}
export async function createCreatures(data: CreatureCreateManyInput[]) {
	return await withDatabaseFallback(async () => {
		const now = new Date(Date.now());
		log.log("database", `Creating ${data.length} creatures.`);
		const BATCH_SIZE = 200;
		const prisma = getPrismaClient();
		if (data.length <= BATCH_SIZE) {
			return (await prisma.creature.createMany({ data: data.map(creature => ({ ...creature, lastUpdated: now })) })).count;
		}
		else {
			const splitData = [];
			for (let i = 0; i < data.length; i += BATCH_SIZE) {
				splitData.push(data.slice(i, i + BATCH_SIZE).map(creature => ({ ...creature, lastUpdated: now })));
			}
			const results = await prisma.$transaction(splitData.map(creatures => prisma.creature.createMany({ data: creatures })));

			return results.map(r => r.count).reduce((a, b) => a + b);
		}
	}, null);
}

export async function getCreaturesByBestiary(bestiaryId: Id) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().creature.findMany({ where: { bestiaryId }, orderBy: { index: "asc" } });
	}, []);
}

export async function getCreaturesByIds(ids: Id[]) {
	return await withDatabaseFallback(async () => {
		if (!ids.length)
			return [];
		return await getPrismaClient().creature.findMany({ where: { id: { in: ids } } });
	}, []);
}

export async function deleteCreature(creatureId: Id) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Deleting creature with the id ${creatureId}.`);
		return await getPrismaClient().$transaction(async () => {
			const creature = await getCreature(creatureId);
			if (!creature)
				return false;
			await getPrismaClient().creature.delete({ where: { id: creatureId } });
			return true;
		});
	}, false);
}
