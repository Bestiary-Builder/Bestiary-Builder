import type { Id, User } from "~/shared";
import type { BestiaryCreateInput, BestiaryUpdateInput } from "~/shared/src/prisma-types";
import { v4 as uuid } from "uuid";
import { log } from "@/utilities/logger";
import { getPrismaClient } from ".";
import { withDatabaseFallback } from "./operations";

const defaultIncludes = {
	creatures: {
		select: {
			id: true
		}
	},
	editors: {
		select: {
			userId: true
		}
	},
	_count: {
		select: {
			bookmarkedBy: true
		}
	}
};

// Bestiary functions
export async function getBestiary(id: Id, includeCreatures = false) {
	if (!id)
		return null;
	return await withDatabaseFallback(async () => {
		log.log("database", `Reading bestiary with the id ${id}.`);
		return await getPrismaClient().bestiary.findUnique({ where: { id }, include: includeCreatures ? { ...defaultIncludes, creatures: includeCreatures } : defaultIncludes });
	}, null);
}
export async function updateBestiary(data: BestiaryUpdateInput, id: Id) {
	return await withDatabaseFallback(async () => {
		data.lastUpdated = new Date(Date.now());
		log.log("database", `Updating bestiary with id ${id}`);
		return (await getPrismaClient().bestiary.update({ where: { id }, data })).id;
	}, null);
}
export async function createBestiary(data: Omit<BestiaryCreateInput, "id" | "owner">, owner: User) {
	return await withDatabaseFallback(async () => {
		data.lastUpdated = new Date(Date.now());
		const id = uuid().replaceAll("-", "");
		log.log("database", `Creating bestiary`);
		const prisma = getPrismaClient();
		// Get next sorted index
		const sortedIndex = ((await prisma.user.findUnique({ where: { id: owner.id }, select: { ordered: { orderBy: { index: "desc" }, take: 1 } } }))?.ordered[0]?.index ?? -1) + 1;
		return (await prisma.bestiary.create({ data: { ...data, id, owner: { connect: { id: owner.id } }, orderedBy: { create: { user: { connect: { id: owner.id } }, index: sortedIndex } } } })).id;
	}, null);
}
export async function incrementBestiaryViewCount(id: Id) {
	log.log("database", `Incrementing viewcount of bestiary with the id ${id}.`);
	await getPrismaClient().bestiary.update({ where: { id }, data: { viewCount: { increment: 1 } } });
}
export async function deleteBestiary(bestiaryId: Id) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Deleting bestiary with the id ${bestiaryId}.`);
		return await getPrismaClient().$transaction(async () => {
			const bestiary = await getBestiary(bestiaryId);
			if (!bestiary)
				return false;
			await getPrismaClient().bestiary.delete({ where: { id: bestiaryId } });
			return true;
		});
	}, false);
}

export async function getBestiariesByUser(userId: string) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().bestiary.findMany({
			where: {
				OR: [
					{ ownerId: userId },
					{ editors: { some: { userId } } }
				]
			},
			include: { ...defaultIncludes, orderedBy: { where: { userId } } },
		});
	}, []);
}

export async function getBestiariesByOwner(userId: string) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().bestiary.findMany({
			where: { ownerId: userId },
			include: defaultIncludes
		});
	}, []);
}

export async function getOwnedBestiaryIds(userId: Id) {
	return await withDatabaseFallback(async () => {
		const bestiaries = await getPrismaClient().bestiary.findMany({ where: { ownerId: userId }, select: { id: true } });
		return bestiaries.map(bestiary => bestiary.id);
	}, []);
}

export async function updateUserBestiaryIndexes(userId: Id, items: { id: Id; index: number }[]) {
	return await withDatabaseFallback(async () => {
		await getPrismaClient().$transaction(items.map(item => getPrismaClient().userBestiaryOrder.upsert({
			where: { userId_bestiaryId: { userId, bestiaryId: item.id } },
			update: { index: item.index },
			create: { userId, bestiaryId: item.id, index: item.index }
		})));
		return true;
	}, false);
}

export async function getPublicBestiariesByOwner(userId: string) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().bestiary.findMany({
			where: { ownerId: userId, status: "public" },
			include: defaultIncludes
		});
	}, []);
}

export async function getBookmarkedBestiariesForUser(userId: string) {
	return await withDatabaseFallback(async () => {
		const bookmarkIds = await getBestiaryBookmarkIdsForUser(userId);
		if (!bookmarkIds.length)
			return [];
		return await getPrismaClient().bestiary.findMany({
			where: {
				id: { in: bookmarkIds },
				OR: [
					{ ownerId: userId },
					{ status: { not: "private" } }
				]
			},
			include: defaultIncludes
		});
	}, []);
}

export async function getBestiaryBookmarkIdsForUser(userId: string) {
	return await withDatabaseFallback(async () => {
		const bookmarks = await getPrismaClient().userBestiaryBookmark.findMany({
			where: { userId },
			select: { bestiaryId: true }
		});
		return bookmarks.map(b => b.bestiaryId);
	}, []);
}

export async function addBestiaryEditor(bestiaryId: Id, userId: string) {
	return await withDatabaseFallback(async () => {
		await getPrismaClient().bestiaryEditor.upsert({
			where: { bestiaryId_userId: { bestiaryId, userId } },
			update: {},
			create: { bestiaryId, userId }
		});
		return true;
	}, false);
}

export async function removeBestiaryEditor(bestiaryId: Id, userId: string) {
	return await withDatabaseFallback(async () => {
		await getPrismaClient().bestiaryEditor.deleteMany({
			where: { bestiaryId, userId }
		});
		return true;
	}, false);
}

export async function getBestiaryEditorIds(bestiaryId: Id) {
	return await withDatabaseFallback(async () => {
		const editors = await getPrismaClient().bestiaryEditor.findMany({
			where: { bestiaryId },
			select: { userId: true }
		});
		return editors.map(e => e.userId);
	}, []);
}

export async function isBestiaryEditor(bestiaryId: Id, userId: string) {
	return await withDatabaseFallback(async () => {
		const count = await getPrismaClient().bestiaryEditor.count({
			where: { bestiaryId, userId }
		});
		return count > 0;
	}, false);
}

export async function getBestiaryCreatureIds(bestiaryId: Id) {
	return await withDatabaseFallback(async () => {
		const creatures = await getPrismaClient().creature.findMany({
			where: { bestiaryId },
			select: { id: true },
			orderBy: [{ index: "asc" }, { lastUpdated: "asc" }, { id: "asc" }]
		});
		return creatures.map(c => c.id);
	}, []);
}

export async function updateBestiaryCreatureIndexes(items: { id: Id; index: number }[]) {
	return await withDatabaseFallback(async () => {
		await getPrismaClient().$transaction(items.map(item => getPrismaClient().creature.update({
			where: { id: item.id },
			data: { index: item.index }
		})));
		return true;
	}, false);
}

export async function getBestiaryCreatureCount(bestiaryId: Id) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().creature.count({
			where: { bestiaryId }
		});
	}, 0);
}
