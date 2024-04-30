import {MongoClient, ServerApiVersion, Db, Collection} from "mongodb";
import {generateUserSecret} from "./constants";
import {log} from "./logger";
import {User, Bestiary, Creature, Id, Automation} from "../../shared";
//Connect to database
let database = null as Db | null;
export async function startConnection() {
	// Create a MongoClient with a MongoClientOptions object to set the Stable API version
	const client = new MongoClient(process.env.MongoDB!, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: false
		},
		monitorCommands: true
	});
	try {
		// Connect the client to the server
		await client.connect();
		// Connect to databse
		database = client.db("bestiarybuilder");
		// Get collections
		collections.users = database.collection("Users");
		collections.bestiaries = database.collection("Bestiaries");
		collections.creatures = database.collection("Creatures");
		collections.automations = database.collection("Automations");
		log.info(`Successfully connected to the database.`);
		log.log("database", `Established connection to ${database.databaseName} with ${(await database.collections()).length} collections.`);

		//Database change
		const runDataBaseChange = false;
		if (runDataBaseChange) {
			//Change speed & senses (remove 0 values)
			let result = await collections.creatures.updateMany({}, {$pull: {"stats.core.speed": {value: 0, name: {$ne: "Walk"}}, "stats.core.senses": {value: 0}}});
			log.log("database", `Updated ${result.modifiedCount} creatures to remove empty speed and senses.`);
		}
	} catch (err: any) {
		log.log("critical", err);
		// Ensures that the client will close on error
		await client.close();
	}
}

export const collections: {users?: Collection<User>; bestiaries?: Collection<Bestiary>; creatures?: Collection<Creature>; automations?: Collection<Automation>} = {};

//Add changes to all in database
export async function addValue(collection: Collection<any>, key: string, value: any) {
	collection.updateMany({[key]: {$exists: false}}, {$set: {[key]: value}});
	log.log("database", `Added key "${key}" to all documents in collection "${collection.collectionName}" with the value: ${value}`);
}
export async function updateValue(collection: Collection<any>, key: string, value: any) {
	collection.updateMany({}, {$set: {[key]: value}});
}

//User cache
let userCache = {} as {[key: string]: User};
function resetUserCache(id: string) {
	delete userCache[id];
}
let userSecretCache = {} as {[key: string]: string};
//User functions
export async function getUser(id: string) {
	try {
		let user = userCache[id] as User | null;
		if (!user) {
			user = (await collections.users?.findOne({_id: id})) as User | null;
			if (user) userCache[user._id] = user;
			log.log("database", "Reading user info for " + id + ".");
		}
		return user;
	} catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function getUserFromSecret(secret: string) {
	try {
		if (!secret) return null;
		let user = userSecretCache[secret] as string | null;
		if (!user) {
			user = (await collections.users?.findOne({secret: secret}))?._id ?? null;
			if (user) userSecretCache[secret] = user;
			log.log("database", "Reading user from secret.");
		}
		return user;
	} catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateUser(data: {_id: string; username: string; avatar: string; email: string; verified: boolean; banner_color: string; global_name: string}) {
	try {
		if (await getUser(data._id)) {
			log.log("database", "Updating user with id " + data._id);
			await collections.users?.updateOne({_id: data._id}, {$set: data});
			resetUserCache(data._id);
			return (await getUser(data._id))?.secret ?? null;
		} else {
			log.log("database", "Adding new user to collection with id " + data._id);
			let userData = {...(data as User), joinedAt: Date.now(), secret: generateUserSecret(), bestiaries: [], bookmarks: [], supporter: 0} as User;
			await collections.users?.insertOne(userData);
			return userData.secret;
		}
	} catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function addBookmark(userId: string, bestiaryId: Id) {
	try {
		log.log("database", `Adding bookmark to user ${userId}.`);
		await collections.users?.updateOne({_id: userId}, {$push: {bookmarks: bestiaryId}});
		await collections.bestiaries?.updateOne({_id: bestiaryId}, {$inc: {bookmarks: 1}});
		return true;
	} catch (err) {
		log.log("critical", err);
		return false;
	}
}
export async function removeBookmark(userId: string, bestiaryId: Id) {
	try {
		log.log("database", `Removing bookmark from user ${userId}.`);
		await collections.users?.updateOne({_id: userId}, {$pull: {bookmarks: bestiaryId}});
		await collections.bestiaries?.updateOne({_id: bestiaryId}, {$inc: {bookmarks: -1}});
		return true;
	} catch (err) {
		log.log("critical", err);
		return false;
	}
}
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
//Automation functions
export async function getAutomation(id: Id) {
	try {
		log.log("database", `Reading bestiary with the id ${id}.`);
		return (await collections.automations?.findOne({_id: id})) as Bestiary | null;
	} catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateAutomation(data: Automation, id?: Id) {
	try {
		data.lastUpdated = Date.now();
		if (id) {
			if (await getAutomation(id)) {
				log.log("database", "Updating automation with id " + id);
				await collections.automations?.updateOne({_id: id}, {$set: data});
				return id;
			} else {
				///log.error("Trying to update non existant bestiary");
				return null;
			}
		} else {
			log.log("database", "Adding new automation to collection");
			let _id = new Id();
			let newData = {
				...data,
				...{
					_id: _id
				}
			};
			await collections.automations?.insertOne(newData);
			return _id;
		}
	} catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function deleteAutomation(_id: Id) {
	try {
		let automation = await getAutomation(_id);
		if (!automation) return false;
		log.log("database", `Deleting bestiary with the id ${_id}.`);
		await collections.automations?.deleteOne({_id});
		return true;
	} catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function getGlobalStats(): Promise<{
	creatures: number;
	bestiaries: number;
	users: number;
} | null> {
	try {
		return {
			creatures: (await collections.creatures?.countDocuments()) ?? 0,
			bestiaries: (await collections.bestiaries?.countDocuments()) ?? 0,
			users: (await collections.users?.countDocuments()) ?? 0
		};
	} catch (err) {
		log.log("critical", err);
		return null;
	}
}
