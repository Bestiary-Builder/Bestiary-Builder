import {log} from "@/utilities/logger";
import {User, Bestiary, Creature, Id, Automation} from "~/shared";
import {collections} from ".";

//Bestiary functions
export async function getBestiary(id: Id) {
	try {
		log.log("database", `Reading bestiary with the id ${id}.`);
		return (await collections.bestiaries?.findOne({_id: id})) as Bestiary | null;
	} catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateBestiary(data: Bestiary, id?: Id) {
	try {
		data.lastUpdated = Date.now();
		if (id) {
			if (await getBestiary(id)) {
				log.log("database", "Updating bestiary with id " + id);
				await collections.bestiaries?.updateOne({_id: id}, {$set: data});
				return id;
			} else {
				///log.error("Trying to update non existant bestiary");
				return null;
			}
		} else {
			log.log("database", "Adding new bestiary to collection");
			let _id = new Id();
			let newData = {
				...data,
				...{
					_id: _id,
					bookmarks: 0,
					viewCount: 0,
					editors: []
				}
			};
			await collections.bestiaries?.insertOne(newData);
			return _id;
		}
	} catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function incrementBestiaryViewCount(id: Id) {
	log.log("database", `Incrementing viewcount of bestiary with the id ${id}.`);
	await collections.bestiaries?.updateOne({_id: id}, {$inc: {viewCount: 1}});
}
export async function addBestiaryToUser(bestiaryId: Id, userId: string) {
	try {
		log.log("database", `Adding bestiary with the id ${bestiaryId} to user with the id ${userId}.`);
		await collections.users?.updateOne({_id: userId}, {$push: {bestiaries: bestiaryId}});
		await collections.bestiaries?.updateOne({_id: bestiaryId}, {$set: {owner: userId}});
		return true;
	} catch (err) {
		log.log("critical", err);
		return false;
	}
}
export async function deleteBestiary(bestiaryId: Id) {
	try {
		let bestiary = await getBestiary(bestiaryId);
		if (!bestiary) return false;
		log.log("database", `Deleting bestiary with the id ${bestiaryId}.`);
		await collections.users?.updateOne({_id: bestiary.owner}, {$pull: {bestiaries: bestiaryId}});
		await collections.creatures?.deleteMany({bestiary: bestiaryId});
		await collections.bestiaries?.deleteOne({_id: bestiaryId});
		return true;
	} catch (err) {
		log.log("critical", err);
		return false;
	}
}
