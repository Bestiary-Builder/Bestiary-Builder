import type { Id } from "~/shared";
import type { AutomationCollectionCreateInput, AutomationCollectionUpdateInput, AutomationCreateInput, AutomationUpdateInput } from "~/shared/src/prisma-types";
import { log } from "@/utilities/logger";
import { getPrismaClient } from ".";

type CreateAutomationData = Pick<AutomationCreateInput, "name" | "description" | "automation">;

// Automation functions
export async function getAutomation(id: Id) {
	try {
		log.log("database", `Reading automation with the id ${id}.`);
		return (await getPrismaClient().automation.findUnique({ where: { id } }));
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function createAutomation(data: CreateAutomationData, collectionId: Id) {
	try {
		log.log("database", `Creating new automation`);
		return await getPrismaClient().automation.create({
			data: {
				...data,
				lastUpdated: new Date(),
				collection: { connect: { id: collectionId } }
			}
		});
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateAutomation(data: AutomationUpdateInput, id: Id) {
	try {
		data.lastUpdated = new Date(Date.now());
		log.log("database", `Updating automation with id ${id}`);
		return (await getPrismaClient().automation.update({ where: { id }, data })).id;
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function deleteAutomation(id: Id) {
	try {
		log.log("database", `Deleting automation with the id ${id}.`);
		await getPrismaClient().automation.delete({ where: { id } });
		return true;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function getAutomationsByCollectionIds(collectionIds: Id[]) {
	try {
		if (!collectionIds.length)
			return [];
		return await getPrismaClient().automation.findMany({ where: { collectionId: { in: collectionIds } } });
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function getAutomationCollection(id: Id) {
	try {
		return await getPrismaClient().automationCollection.findUnique({
			where: { id },
			include: { editors: { select: { userId: true } } }
		});
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}

export async function getAutomationCollectionsByOwner(ownerId: Id) {
	try {
		return await getPrismaClient().automationCollection.findMany({ where: { ownerId } });
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function getAutomationCollectionsByUser(userId: Id) {
	try {
		return await getPrismaClient().automationCollection.findMany({
			where: {
				OR: [
					{ ownerId: userId },
					{ editors: { some: { userId } } }
				]
			},
			include: {
				editors: { select: { userId: true } },
				automations: true
			}
		});
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}

export async function createAutomationCollection(data: AutomationCollectionCreateInput) {
	try {
		return await getPrismaClient().automationCollection.upsert({
			where: { id: data.id },
			update: data,
			create: data,
			include: { editors: { select: { userId: true } } }
		});
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}

export async function updateAutomationCollection(data: AutomationCollectionUpdateInput, id: Id) {
	try {
		return await getPrismaClient().automationCollection.update({ where: { id }, data });
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
