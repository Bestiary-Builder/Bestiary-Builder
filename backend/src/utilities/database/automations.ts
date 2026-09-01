import type { Id } from "~/shared";
import type { AutomationCollectionCreateInput, AutomationCollectionUpdateInput, AutomationCreateInput, AutomationCreateManyInput, AutomationOrderByWithRelationInput, AutomationUpdateInput } from "~/shared/src/prisma-types";
import { log } from "@/utilities/logger";
import { getPrismaClient } from ".";
import { withDatabaseFallback } from "./operations";

type CreateAutomationData = Pick<AutomationCreateInput, "name" | "description" | "automation">;
const automationOrder: AutomationOrderByWithRelationInput[] = [{ index: "asc" }, { lastUpdated: "asc" }, { id: "asc" }];
const collectionIncludes = {
	editors: { select: { userId: true } },
	automations: { orderBy: automationOrder },
	_count: { select: { bookmarkedBy: true } }
};

// Automation functions
export async function getAutomation(id: Id) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Reading automation with the id ${id}.`);
		return (await getPrismaClient().automation.findUnique({ where: { id } }));
	}, null);
}
export async function getAutomationMetaData(id: Id) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Reading automation metadata with the id ${id}.`);
		return (await getPrismaClient().automation.findUnique({
			where: { id },
			include: {
				collection: {
					include: {
						owner: {
							select: {
								username: true,
							}
						}
					}
				}
			}
		}));
	}, null);
}
export async function createAutomation(data: CreateAutomationData, collectionId: Id) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Creating new automation`);
		const prisma = getPrismaClient();
		const index = ((await prisma.automation.findFirst({
			where: { collectionId },
			select: { index: true },
			orderBy: { index: "desc" }
		}))?.index ?? -1) + 1;
		return await prisma.automation.create({
			data: {
				...data,
				lastUpdated: new Date(),
				index,
				collection: { connect: { id: collectionId } }
			}
		});
	}, null);
}
export async function updateAutomation(data: AutomationUpdateInput, id: Id) {
	return await withDatabaseFallback(async () => {
		data.lastUpdated = new Date(Date.now());
		log.log("database", `Updating automation with id ${id}`);
		return (await getPrismaClient().automation.update({ where: { id }, data })).id;
	}, null);
}
export async function deleteAutomation(id: Id) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Deleting automation with the id ${id}.`);
		await getPrismaClient().automation.delete({ where: { id } });
		return true;
	}, false);
}
export async function createAutomations(data: AutomationCreateManyInput[]) {
	return await withDatabaseFallback(async () => {
		const now = new Date(Date.now());
		log.log("database", `Creating ${data.length} automations.`);
		return await getPrismaClient().automation.createMany({ data: data.map(automation => ({ ...automation, lastUpdated: now })) });
	}, null);
}

export async function getAutomationsByCollectionIds(collectionIds: Id[]) {
	return await withDatabaseFallback(async () => {
		if (!collectionIds.length)
			return [];
		return await getPrismaClient().automation.findMany({ where: { collectionId: { in: collectionIds } }, orderBy: automationOrder });
	}, []);
}

export async function getAutomationsByCollection(collectionId: Id) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().automation.findMany({ where: { collectionId }, orderBy: automationOrder });
	}, []);
}

export async function getAutomationIds(collectionId: Id) {
	return await withDatabaseFallback(async () => {
		const automations = await getPrismaClient().automation.findMany({
			where: { collectionId },
			select: { id: true },
			orderBy: automationOrder
		});
		return automations.map(automation => automation.id);
	}, []);
}

export async function updateAutomationIndexes(items: { id: Id; index: number }[]) {
	return await withDatabaseFallback(async () => {
		await getPrismaClient().$transaction(items.map(item => getPrismaClient().automation.update({
			where: { id: item.id },
			data: { index: item.index }
		})));
		return true;
	}, false);
}

export async function getAutomationCollection(id: Id) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().automationCollection.findUnique({
			where: { id },
			include: collectionIncludes
		});
	}, null);
}

export async function getAutomationCollectionMetaData(id: Id) {
	return await withDatabaseFallback(async () => {
		const result = await getPrismaClient().automationCollection.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						automations: true
					}
				},
				owner: {
					select: {
						username: true,
					}
				},
			}
		});

		if (!result)
			return null;
		return { ...result, automationCount: result._count.automations } as Omit<typeof result, "_count"> & { automationCount: number };
	}, null);
}

export async function getAutomationCollectionsByOwner(ownerId: Id) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().automationCollection.findMany({ where: { ownerId }, include: collectionIncludes });
	}, []);
}

export async function getPublicAutomationCollectionsByOwner(ownerId: Id) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().automationCollection.findMany({
			where: { ownerId, status: "public" },
			include: collectionIncludes
		});
	}, []);
}

export async function getAutomationCollectionsByUser(userId: Id) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().automationCollection.findMany({
			where: {
				OR: [
					{ ownerId: userId },
					{ editors: { some: { userId } } }
				]
			},
			include: { ...collectionIncludes, orderedBy: { where: { userId } } }
		});
	}, []);
}

export async function createAutomationCollection(data: AutomationCollectionCreateInput, ownerId: Id) {
	return await withDatabaseFallback(async () => {
		const prisma = getPrismaClient();
		const index = ((await prisma.userAutomationCollectionOrder.findFirst({
			where: { userId: ownerId },
			select: { index: true },
			orderBy: { index: "desc" }
		}))?.index ?? -1) + 1;
		return await prisma.automationCollection.create({
			data: { ...data, orderedBy: { create: { userId: ownerId, index } } },
			include: collectionIncludes
		});
	}, null);
}

export async function getOwnedAutomationCollectionIds(userId: Id) {
	return await withDatabaseFallback(async () => {
		const collections = await getPrismaClient().automationCollection.findMany({ where: { ownerId: userId }, select: { id: true } });
		return collections.map(collection => collection.id);
	}, []);
}

export async function updateUserAutomationCollectionIndexes(userId: Id, items: { id: Id; index: number }[]) {
	return await withDatabaseFallback(async () => {
		await getPrismaClient().$transaction(items.map(item => getPrismaClient().userAutomationCollectionOrder.upsert({
			where: { userId_collectionId: { userId, collectionId: item.id } },
			update: { index: item.index },
			create: { userId, collectionId: item.id, index: item.index }
		})));
		return true;
	}, false);
}

export async function updateAutomationCollection(data: AutomationCollectionUpdateInput, id: Id) {
	try {
		return await getPrismaClient().automationCollection.update({ where: { id }, data, include: collectionIncludes });
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}

export async function deleteAutomationCollection(id: Id) {
	try {
		await getPrismaClient().automationCollection.delete({ where: { id } });
		return true;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function addAutomationCollectionEditor(collectionId: Id, userId: Id) {
	try {
		await getPrismaClient().automationCollectionEditor.upsert({
			where: { collectionId_userId: { collectionId, userId } },
			update: {},
			create: { collectionId, userId }
		});
		return true;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function removeAutomationCollectionEditor(collectionId: Id, userId: Id) {
	try {
		const result = await getPrismaClient().automationCollectionEditor.deleteMany({ where: { collectionId, userId } });
		return result.count === 1;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function incrementAutomationCollectionViewCount(collectionId: Id) {
	await getPrismaClient().automationCollection.update({ where: { id: collectionId }, data: { viewCount: { increment: 1 } } });
}

export async function getAutomationCollectionAutomationCount(collectionId: Id) {
	return await withDatabaseFallback(async () => {
		return await getPrismaClient().automation.count({ where: { collectionId } });
	}, 0);
}

export async function addAutomationCollectionBookmark(userId: Id, collectionId: Id) {
	return await withDatabaseFallback(async () => {
		await getPrismaClient().userAutomationCollectionBookmark.create({ data: { userId, collectionId } });
		return true;
	}, false);
}

export async function removeAutomationCollectionBookmark(userId: Id, collectionId: Id) {
	return await withDatabaseFallback(async () => {
		await getPrismaClient().userAutomationCollectionBookmark.delete({ where: { userId_collectionId: { userId, collectionId } } });
		return true;
	}, false);
}

export async function isAutomationCollectionBookmarked(userId: Id, collectionId: Id) {
	return await withDatabaseFallback(async () => {
		return Boolean(await getPrismaClient().userAutomationCollectionBookmark.findUnique({ where: { userId_collectionId: { userId, collectionId } } }));
	}, false);
}

export async function getBookmarkedAutomationCollectionsForUser(userId: Id) {
	return await withDatabaseFallback(async () => {
		const bookmarks = await getPrismaClient().userAutomationCollectionBookmark.findMany({ where: { userId }, select: { collectionId: true } });
		if (!bookmarks.length)
			return [];
		return await getPrismaClient().automationCollection.findMany({
			where: {
				id: { in: bookmarks.map(bookmark => bookmark.collectionId) },
				OR: [{ ownerId: userId }, { status: { not: "private" } }]
			},
			include: collectionIncludes
		});
	}, []);
}
