import {MongoClient, ServerApiVersion} from "mongodb";
import {Db, ObjectId, Collection} from "mongodb";
import {generateUserSecret} from "./server";
//Connect to database
let database = null as Db | null;
export async function startConnection() {
	// Create a MongoClient with a MongoClientOptions object to set the Stable API version
	const client = new MongoClient(process.env.MongoDB!, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: false
		}
	});
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		// Connect to databse
		database = client.db("bestiarybuilder");
		// Get collections
		collections.users = database.collection("Users");
		collections.bestiaries = database.collection("Bestiaries");
		collections.creatures = database.collection("Creatures");
		console.log(`Successfully connected to database: ${database.databaseName}`);
	} catch (e: any) {
		console.error(e);
		// Ensures that the client will close on error
		await client.close();
	}
}

//Collections
export class User {
	constructor(public username: string, public avatar: string, public email: string, public verified: boolean, public banner_color: string, public global_name: string, public bestiaries: ObjectId[] = [], public bookmarks: ObjectId[] = [], public _id: string, public secret?: string) {}
}
export class Bestiary {
	constructor(public name: string, public owner: string, public editors: string[], public status: "public" | "private" | "unlisted", public description: string, public creatures: ObjectId[], public viewCount: number, public bookmarks: number, public lastUpdated: Date, public _id?: ObjectId) {}
}
export class Creature {
	constructor(public lastUpdated: Date, public stats: any, public bestiary: ObjectId, public _id?: ObjectId) {}
}
export const collections: {users?: Collection<User>; bestiaries?: Collection<Bestiary>; creatures?: Collection<Creature>} = {};

//User functions
export async function getUser(id: string) {
	try {
		return (await collections.users?.findOne({_id: id})) as User | null;
	} catch (err) {
		console.error(err);
		return null;
	}
}
export async function getUserFromSecret(secret: string) {
	try {
		if (!secret) return null;
		return (await collections.users?.findOne({secret: secret})) as User | null;
	} catch (err) {
		console.error(err);
		return null;
	}
}
export async function updateUser(data: {_id: string; username: string; avatar: string; email: string; verified: boolean; banner_color: string; global_name: string}) {
	try {
		if (await getUser(data._id)) {
			///console.log("Updating user with id " + data._id.toString());
			await collections.users?.updateOne({_id: data._id}, {$set: data});
			return (await getUser(data._id))?.secret ?? null;
		} else {
			///console.log("Adding new user to collection with id " + data._id.toString());
			let userData = data as User;
			userData._id = data._id;
			userData.secret = generateUserSecret();
			userData.bestiaries = [];
			await collections.users?.insertOne(userData);
			return userData.secret;
		}
	} catch (err) {
		console.error(err);
		return null;
	}
}
export async function addBookmark(userId: string, bestiaryId: ObjectId) {
	try {
		await collections.users?.updateOne({_id: userId}, {$push: {bookmarks: bestiaryId}});
		await collections.bestiaries?.updateOne({_id: bestiaryId}, {$inc: {bookmarks: 1}});
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}
export async function removeBookmark(userId: string, bestiaryId: ObjectId) {
	try {
		await collections.users?.updateOne({_id: userId}, {$pull: {bookmarks: bestiaryId}});
		await collections.bestiaries?.updateOne({_id: bestiaryId}, {$inc: {bookmarks: -1}});
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}
//Bestiary functions
export async function getBestiary(id: ObjectId) {
	try {
		return (await collections.bestiaries?.findOne({_id: id})) as Bestiary | null;
	} catch (err) {
		console.error(err);
		return null;
	}
}
export async function updateBestiary(data: Bestiary, id?: ObjectId) {
	try {
		data.lastUpdated = new Date(Date.now());
		if (id) {
			if (await getBestiary(id)) {
				///console.log("Updating bestiary with id " + id.toString());
				await collections.bestiaries?.updateOne({_id: id}, {$set: data});
				return id;
			} else {
				///console.error("Trying to update non existant bestiary");
				return null;
			}
		} else {
			///console.log("Adding new bestiary to collection");
			let _id = new ObjectId();
			data._id = _id;
			await collections.bestiaries?.insertOne(data);
			return _id;
		}
	} catch (err) {
		console.error(err);
		return null;
	}
}
export async function incrementBestiaryViewCount(id: ObjectId) {
	await collections.bestiaries?.updateOne({_id: id}, {$inc: {viewCount: 1}});
}
export async function addBestiaryToUser(bestiaryId: ObjectId, userId: string) {
	try {
		await collections.users?.updateOne({_id: userId}, {$push: {bestiaries: bestiaryId}});
		await collections.bestiaries?.updateOne({_id: bestiaryId}, {$set: {owner: userId}});
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}
export async function deleteBestiary(bestiaryId: ObjectId) {
	try {
		let bestiary = await getBestiary(bestiaryId);
		if (!bestiary) return false;
		await collections.users?.updateOne({_id: bestiary.owner}, {$pull: {bestiaries: bestiaryId}});
		for (let creatureId of bestiary.creatures) {
			await collections.creatures?.deleteOne({_id: creatureId});
		}
		await collections.bestiaries?.deleteOne({_id: bestiaryId});
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}
//Creature functions
export async function getCreature(id: ObjectId) {
	try {
		return (await collections.creatures?.findOne({_id: id})) as Creature | null;
	} catch (err) {
		console.error(err);
		return null;
	}
}
export async function updateCreature(data: Creature, id?: ObjectId) {
	try {
		data.lastUpdated = new Date(Date.now());
		if (id) {
			if (await getBestiary(data.bestiary)) {
				///console.log("Updating creature with id " + id.toString());
				await collections.creatures?.updateOne({_id: id}, {$set: data});
				//Update bestiary last updated
				await updateBestiary({} as Bestiary, data.bestiary);
				return id;
			} else {
				///console.error("Trying to update non existant bestiary");
				return null;
			}
		} else {
			///console.log("Adding new creature to collection");
			let _id = new ObjectId();
			data._id = _id;
			await collections.creatures?.insertOne(data);
			return _id;
		}
	} catch (err) {
		console.error(err);
		return null;
	}
}
export async function addCreatureToBestiary(creatureId: ObjectId, bestiaryId: ObjectId) {
	try {
		await collections.bestiaries?.updateOne({_id: bestiaryId}, {$push: {creatures: creatureId}});
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}
export async function deleteCreature(creatureId: ObjectId) {
	try {
		let creature = await getCreature(creatureId);
		if (!creature) return false;
		await collections.bestiaries?.updateOne({_id: creature.bestiary}, {$pull: {creatures: creatureId}});
		await collections.creatures?.deleteOne({_id: creature._id});
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}
