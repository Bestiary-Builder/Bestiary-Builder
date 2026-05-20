import { getPrismaClient } from ".";
import { log } from "@/utilities/logger";
import type { Id } from "~/shared";
import type { AutomationCreateInput, AutomationUpdateInput } from "~/shared/src/prisma-types";

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
export async function createAutomation(data: AutomationCreateInput) {
	try {
		data.lastUpdated = new Date(Date.now());
		log.log("database", `Creating new automation`);
		return (await getPrismaClient().automation.create({ data })).id;
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
		return await getPrismaClient().$transaction(async () => {
			const automation = await getAutomation(id);
			if (!automation)
				return false;
			await getPrismaClient().automation.delete({ where: { id } });
			return true;
		});
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function getAutomationsByOwner(ownerId: string) {
	try {
		return await getPrismaClient().automation.findMany({ where: { owner: ownerId } });
	}
	catch (err) {
		log.log("critical", err);
		return [];
	}
}
