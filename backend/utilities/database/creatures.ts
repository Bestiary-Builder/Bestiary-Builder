import {log} from "@/utilities/logger";
import {User, Bestiary, Creature, Id, Automation} from "~/shared";
import {collections} from ".";
import {getBestiary, updateBestiary} from "./bestiaries";

//Creature functions
export async function getCreature(id: Id) {
	try {
		log.log("database", `Getting creature with the id ${id}.`);
		return (await collections.creatures?.findOne({_id: id})) as Creature | null;
	} catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateCreature(data: Creature, id?: Id) {
	try {
		data.lastUpdated = Date.now();
		if (id) {
			if (await getBestiary(data.bestiary)) {
				log.log("database", `Updating creature with the id ${id}.`);
				await collections.creatures?.updateOne({_id: id}, {$set: data});
				//Update bestiary last updated
				await updateBestiary({} as Bestiary, data.bestiary);
				return id;
			} else {
				log.log("database", `ERROR - Tried to update non existant creature`);
				return null;
			}
		} else {
			log.log("database", "Adding new creature to collection");
			let _id = new Id();
			data._id = _id;
			await collections.creatures?.insertOne(data);
			return _id;
		}
	} catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function addCreatureToBestiary(creatureId: Id, bestiaryId: Id) {
	try {
		log.log("database", `Adding creature with the id ${creatureId} to bestiary with the id ${bestiaryId}.`);
		await collections.bestiaries?.updateOne({_id: bestiaryId}, {$push: {creatures: creatureId}});
		return true;
	} catch (err) {
		log.log("critical", err);
		return false;
	}
}
export async function deleteCreature(creatureId: Id) {
	try {
		let creature = await getCreature(creatureId);
		if (!creature) return false;
		log.log("database", `Deleting creature with the id ${creatureId}.`);
		await collections.bestiaries?.updateOne({_id: creature.bestiary}, {$pull: {creatures: creatureId}});
		await collections.creatures?.deleteOne({_id: creature._id});
		return true;
	} catch (err) {
		log.log("critical", err);
		return false;
	}
}
