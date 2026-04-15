import type { JsonObject } from "@prisma/client/runtime/client";
import { getPrismaClient } from ".";
import { log } from "@/utilities/logger";
import type { Automation, AutomationCreateInput, Id } from "~/shared";

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
export async function updateAutomation(data: Automation, id?: Id) {
	try {
		const automation: AutomationCreateInput = { ...data, automation: data.automation as JsonObject, lastUpdated: new Date(Date.now()) };
		log.log("database", `Upserting automation with id ${id}`);
		return (await getPrismaClient().automation.upsert({ where: { id }, update: automation, create: automation })).id;
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
			await getPrismaClient().bestiary.delete({ where: { id } });
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
