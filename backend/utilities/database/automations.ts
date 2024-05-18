import { collections } from ".";
import { log } from "@/utilities/logger";
import type { Automation, Bestiary } from "~/shared";
import { Id } from "~/shared";

// Automation functions
export async function getAutomation(id: Id) {
	try {
		log.log("database", `Reading automation with the id ${id}.`);
		return (await collections.automations?.findOne({ _id: id })) as Bestiary | null;
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateAutomation(data: Automation, id?: Id) {
	try {
		data.lastUpdated = Date.now();
		if (id) {
			if (await getAutomation(id)) {
				log.log("database", `Updating automation with id ${id}`);
				await collections.automations?.updateOne({ _id: id }, { $set: data });
				return id;
			}
			else {
				/// log.error("Trying to update non existant automation
				return null;
			}
		}
		else {
			log.log("database", "Adding new automation to collection");
			const _id = new Id();
			const newData = {
				...data,
				...{
					_id
				}
			};
			await collections.automations?.insertOne(newData);
			return _id;
		}
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function deleteAutomation(_id: Id) {
	try {
		const automation = await getAutomation(_id);
		if (!automation)
			return false;
		log.log("database", `Deleting automation with the id ${_id}.`);
		await collections.automations?.deleteOne({ _id });
		return true;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}
