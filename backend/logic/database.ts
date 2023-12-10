import {MongoClient, ServerApiVersion} from "mongodb";
import type {Db, ObjectId, Collection} from "mongodb";
import {app} from "../server";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MongoDB!, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true
	}
});
//Connect to database
let database = null as Db | null;
startConnection();
async function startConnection() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		// Send a ping to confirm a successful connection
		database = client.db("bestiarybuilder");
		collections.users = database.collection("Users");
		console.log(`Successfully connected to database: ${database.databaseName} and collection: ${collections.users.collectionName}`);
	} catch (e: any) {
		console.error(e);
		// Ensures that the client will close on error
		await client.close();
	}
}
//Collections
export class User {
	constructor(public id: string, public username: string, public avatar: string, public email: string, public verified: boolean, public banner_color: string, public global_name: string, public creatures: ObjectId[] = [], public _id?: ObjectId) {}
}
const collections: {users?: Collection} = {};

//DB functions
export async function getUser(id: string) {
	let user = (await collections.users?.findOne({id: id})) as User;
	return user;
}
export async function updateUser(data: {id: string; username: string; avatar: string; email: string; verified: boolean; banner_color: string; global_name: string}) {
	console.log("Updating user", data);
	if ((await getUser(data.id)) != null) {
		console.log("Updating user with id " + data.id);
		collections.users?.updateOne({id: data.id}, {$set: data});
	} else {
		console.log("Added new user to collection");
		let userData = data as User;
		userData.creatures = [];
		collections.users?.insertOne(userData);
	}
	return await getUser(data.id);
}
