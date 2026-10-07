import type { Id } from "~/shared";
import type { Creature, CreatureCreateInput, CreatureCreateManyInput, Prisma } from "~/shared/src/prisma-types";
import { limits } from "@/utilities/constants";
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
type CreatureCreationResult<T> = { ok: true; value: T } | { ok: false; reason: "bestiary-not-found" | "creature-limit" };

async function withCreatureCreation<T>(bestiaryId: Id, amount: number, create: (tx: Prisma.TransactionClient, firstIndex: number) => Promise<T>): Promise<CreatureCreationResult<T> | null> {
	return await withDatabaseFallback<CreatureCreationResult<T> | null>(async () => {
		return await getPrismaClient().$transaction(async (tx): Promise<CreatureCreationResult<T>> => {
			// All creation paths lock the parent row before counting or assigning indexes.
			const bestiaries = await tx.$queryRaw<{ id: string }[]>`
				SELECT "id" FROM "Bestiaries" WHERE "id" = ${bestiaryId} FOR UPDATE
			`;
			if (bestiaries.length === 0)
				return { ok: false, reason: "bestiary-not-found" };

			const count = await tx.creature.count({ where: { bestiaryId } });
			if (count + amount > limits.creatureAmount)
				return { ok: false, reason: "creature-limit" };

			const lastCreature = await tx.creature.findFirst({
				where: { bestiaryId },
				orderBy: { index: "desc" },
				select: { index: true }
			});
			const value = await create(tx, (lastCreature?.index ?? -1) + 1);
			return { ok: true, value };
		}, {
			// The count must see commits made while this transaction waited for the lock.
			isolationLevel: "ReadCommitted",
			maxWait: 10000,
			timeout: 60000
		});
	}, null);
}

export async function createCreature(data: Creature) {
	return await withCreatureCreation(data.bestiaryId, 1, async (tx, index) => {
		const creature: CreatureCreateInput = { stats: data.stats, lastUpdated: new Date(Date.now()), index, bestiary: { connect: { id: data.bestiaryId } } };
		log.log("database", `Creating creature.`);
		return await tx.creature.create({ data: creature, select: { id: true, index: true } });
	});
}
export async function updateCreature(data: Creature, id: Id) {
	return await withDatabaseFallback(async () => {
		const creature: Omit<CreatureCreateInput, "index"> = { stats: data.stats, lastUpdated: new Date(Date.now()), bestiary: { connect: { id: data.bestiaryId } } };
		log.log("database", `Updating creature with the id ${id}.`);
		return (await getPrismaClient().creature.update({ where: { id }, data: creature })).id;
	}, null);
}
export async function createCreatures(bestiaryId: Id, data: Omit<CreatureCreateManyInput, "bestiaryId" | "index">[], requestedCount = data.length) {
	// Preserve the import limit check against all submitted creatures, including invalid ones.
	return await withCreatureCreation(bestiaryId, Math.max(requestedCount, data.length), async (tx, firstIndex) => {
		const now = new Date(Date.now());
		log.log("database", `Creating ${data.length} creatures.`);
		const BATCH_SIZE = 200;
		let count = 0;
		for (let offset = 0; offset < data.length; offset += BATCH_SIZE) {
			const batch = data.slice(offset, offset + BATCH_SIZE).map((creature, index) => ({
				...creature,
				bestiaryId,
				index: firstIndex + offset + index,
				lastUpdated: now
			}));
			count += (await tx.creature.createMany({ data: batch })).count;
		}
		return count;
	});
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
