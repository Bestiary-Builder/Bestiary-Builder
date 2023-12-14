import {MongoClient, ServerApiVersion} from "mongodb";
import {Db, ObjectId, Collection} from "mongodb";
//Connect to database
let database = null as Db | null;
export async function startConnection() {
	// Create a MongoClient with a MongoClientOptions object to set the Stable API version
	const client = new MongoClient(process.env.MongoDB!, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true
		}
	});
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		// Send a ping to confirm a successful connection
		database = client.db("bestiarybuilder");
		collections.users = database.collection("Users");
		collections.bestiaries = database.collection("Bestiaries");
		collections.creatures = database.collection("Creatures");
		console.log(`Successfully connected to database: ${database.databaseName} and collection: ${collections.users.collectionName}`);
	} catch (e: any) {
		console.error(e);
		// Ensures that the client will close on error
		await client.close();
	}
}

//Collections
export class User {
	constructor(public username: string, public avatar: string, public email: string, public verified: boolean, public banner_color: string, public global_name: string, public bestiaries: ObjectId[] = [], public _id?: string, public secret?: ObjectId) {}
}
export class Bestiary {
	constructor(public name: string, public owner: string, public status: "public" | "private" | "unlisted", public description: string, public creatures: ObjectId[], public viewCount: number, public lastUpdated: Date, public _id?: ObjectId) {}
}
export class Creature {
	constructor(public lastUpdated: Date, public stats: any, public bestiary: ObjectId, public _id?: ObjectId) {}
}
export const collections: {users?: Collection<User>; bestiaries?: Collection<Bestiary>; creatures?: Collection<Creature>} = {};

//Basic DB functions
export async function getUser(id: string) {
	return (await collections.users?.findOne({_id: id})) as User;
}
export async function getUserFromSecret(secret: ObjectId) {
	if (!secret) return null;
	return (await collections.users?.findOne({secret: secret})) as User;
}
export async function updateUser(data: {_id: string; username: string; avatar: string; email: string; verified: boolean; banner_color: string; global_name: string}) {
	console.log("Updating user", data);
	if (await getUser(data._id)) {
		console.log("Updating user with id " + data._id.toString());
		await collections.users?.updateOne({_id: data._id}, {$set: data});
	} else {
		console.log("Adding new user to collection with id " + data._id.toString());
		let userData = data as User;
		userData._id = data._id;
		userData.secret = new ObjectId();
		userData.bestiaries = [];
		await collections.users?.insertOne(userData);
	}
}
export async function getBestiary(id: ObjectId) {
	return (await collections.bestiaries?.findOne({_id: id})) as Bestiary;
}
export async function updateBestiary(data: Bestiary, id?: ObjectId) {
	data.lastUpdated = new Date(Date.now());
	if (id) {
		if (await getBestiary(id)) {
			console.log("Updating bestiary with id " + id.toString());
			await collections.bestiaries?.updateOne({_id: id}, {$set: data});
			return id;
		} else {
			console.error("Trying to update non existant bestiary");
			return null;
		}
	} else {
		console.log("Adding new bestiary to collection");
		let _id = new ObjectId();
		data._id = _id;
		await collections.bestiaries?.insertOne(data);
		return _id;
	}
}
export async function incrementBestiaryViewCount(id: ObjectId) {
	await collections.bestiaries?.updateOne({_id: id}, {$inc: {viewCount: 1}});
}
export async function addBestiaryToUser(bestiaryId: ObjectId, userId: string) {
	let user = await getUser(userId);
	user.bestiaries.push(bestiaryId);
	await collections.users?.updateOne({_id: user._id}, {$set: user});
	await collections.bestiaries?.updateOne({_id: bestiaryId}, {$set: {owner: userId}});
}
export async function deleteBestiary(bestiaryId: ObjectId) {
	let bestiary = await getBestiary(bestiaryId);
	for (let creatureId of bestiary.creatures) {
		await collections.creatures?.deleteOne({_id: creatureId});
	}
	await collections.bestiaries?.deleteOne({_id: bestiaryId});
}
export async function getCreature(id: ObjectId) {
	return (await collections.creatures?.findOne({_id: id})) as Creature;
}
export async function updateCreature(data: Creature, id?: ObjectId) {
	data.lastUpdated = new Date(Date.now());
	if (id) {
		if (await getBestiary(data.bestiary)) {
			console.log("Updating creature with id " + id.toString());
			await collections.creatures?.updateOne({_id: id}, {$set: data});
			//Update bestiary last updated
			await updateBestiary({} as Bestiary, data.bestiary);
			return id;
		} else {
			console.error("Trying to update non existant bestiary");
			return null;
		}
	} else {
		console.log("Adding new creature to collection");
		let _id = new ObjectId();
		data._id = _id;
		await collections.creatures?.insertOne(data);
		return _id;
	}
}
export async function addCreatureToBestiary(creatureId: ObjectId, bestiaryId: ObjectId) {
	let bestiary = await getBestiary(bestiaryId);
	bestiary.creatures.push(creatureId);
	await collections.bestiaries?.updateOne({_id: bestiaryId}, {$set: bestiary});
}
export async function deleteCreature(creatureId: ObjectId) {
	let creature = await getCreature(creatureId);
	let bestiary = await getBestiary(creature.bestiary);
	bestiary.creatures = bestiary.creatures.filter((c) => c != creatureId);
	await collections.creatures?.deleteOne({_id: creatureId});
	await collections.bestiaries?.updateOne({_id: creature.bestiary}, {$set: bestiary});
}
