import { v4 as uuid } from "uuid";
import { getPrismaClient } from ".";
import { log } from "@/utilities/logger";
import type { BestiaryCreateInput, BestiaryUpdateInput } from "~/shared/src/prisma-types";
import type { Id, User } from "~/shared";

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
	}
};

// Bestiary functions
export async function getBestiary(id: Id, includeCreatures = false) {
	if (!id)
		return null;
	try {
		log.log("database", `Reading bestiary with the id ${id}.`);
		return await getPrismaClient().bestiary.findUnique({ where: { id }, include: includeCreatures ? { ...defaultIncludes, creatures: includeCreatures } : defaultIncludes });
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateBestiary(data: BestiaryUpdateInput, id: Id) {
	try {
		data.lastUpdated = new Date(Date.now());
		log.log("database", `Updating bestiary with id ${id}`);
		return (await getPrismaClient().bestiary.update({ where: { id }, data })).id;
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function createBestiary(data: Omit<BestiaryCreateInput, "id" | "owner">, owner: User) {
	try {
		data.lastUpdated = new Date(Date.now());
		const id = uuid().replaceAll("-", "");
		log.log("database", `Creating bestiary`);
		const prisma = getPrismaClient();
		// Get next sorted index
		const sortedIndex = ((await prisma.user.findUnique({ where: { id: owner.id }, select: { ordered: { orderBy: { index: "desc" }, take: 1 } } }))?.ordered[0]?.index ?? -1) + 1;
		return (await prisma.bestiary.create({ data: { ...data, id, owner: { connect: { id: owner.id } }, orderedBy: { create: { user: { connect: { id: owner.id } }, index: sortedIndex } } } })).id;
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function incrementBestiaryViewCount(id: Id) {
	log.log("database", `Incrementing viewcount of bestiary with the id ${id}.`);
	await getPrismaClient().bestiary.update({ where: { id }, data: { viewCount: { increment: 1 } } });
}
export async function deleteBestiary(bestiaryId: Id) {
	try {
		log.log("database", `Deleting bestiary with the id ${bestiaryId}.`);
		return await getPrismaClient().$transaction(async () => {
			const bestiary = await getBestiary(bestiaryId);
			if (!bestiary)
				return false;
			await getPrismaClient().bestiary.delete({ where: { id: bestiaryId } });
			return true;
		});
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function getBestiariesByUser(userId: string) {
	try {
		return await getPrismaClient().bestiary.findMany({
			where: {
				OR: [
					{ ownerId: userId },
					{ editors: { some: { userId } } }
				]
			},
			include: { ...defaultIncludes, orderedBy: { where: { userId } } },
		});
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function getBestiariesByOwner(userId: string) {
	try {
		return await getPrismaClient().bestiary.findMany({
			where: { ownerId: userId },
			include: defaultIncludes
		});
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function getPublicBestiariesByOwner(userId: string) {
	try {
		return await getPrismaClient().bestiary.findMany({
			where: { ownerId: userId, status: "public" },
			include: defaultIncludes
		});
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function getBookmarkedBestiariesForUser(userId: string) {
	try {
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
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function getBestiaryBookmarkIdsForUser(userId: string) {
	try {
		const bookmarks = await getPrismaClient().userBestiaryBookmark.findMany({
			where: { userId },
			select: { bestiaryId: true }
		});
		return bookmarks.map(b => b.bestiaryId);
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function addBestiaryEditor(bestiaryId: Id, userId: string) {
	try {
		await getPrismaClient().bestiaryEditor.upsert({
			where: { bestiaryId_userId: { bestiaryId, userId } },
			update: {},
			create: { bestiaryId, userId }
		});
		return true;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function removeBestiaryEditor(bestiaryId: Id, userId: string) {
	try {
		await getPrismaClient().bestiaryEditor.deleteMany({
			where: { bestiaryId, userId }
		});
		return true;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function getBestiaryEditorIds(bestiaryId: Id) {
	try {
		const editors = await getPrismaClient().bestiaryEditor.findMany({
			where: { bestiaryId },
			select: { userId: true }
		});
		return editors.map(e => e.userId);
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function isBestiaryEditor(bestiaryId: Id, userId: string) {
	try {
		const count = await getPrismaClient().bestiaryEditor.count({
			where: { bestiaryId, userId }
		});
		return count > 0;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function getBestiaryCreatureIds(bestiaryId: Id) {
	try {
		const creatures = await getPrismaClient().creature.findMany({
			where: { bestiaryId },
			select: { id: true }
		});
		return creatures.map(c => c.id);
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function getBestiaryCreatureCount(bestiaryId: Id) {
	try {
		return await getPrismaClient().creature.count({
			where: { bestiaryId }
		});
	}
	catch (err) {
		log.log("critical", err);
		return 0;
	}
}
