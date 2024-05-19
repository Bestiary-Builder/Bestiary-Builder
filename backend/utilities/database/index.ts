import type { Collection, Db } from "mongodb";
import { MongoClient, ServerApiVersion } from "mongodb";
import { log } from "@/utilities/logger";
import type { Automation, Bestiary, Creature, GlobalStats, User } from "~/shared";

// Connect to database
export const collections: { users?: Collection<User>; bestiaries?: Collection<Bestiary>; creatures?: Collection<Creature>; automations?: Collection<Automation> } = {};

let database = null as Db | null;
export async function startConnection() {
	let client;
	try {
		// Create a MongoClient with a MongoClientOptions object to set the Stable API version
		client = new MongoClient(process.env.MongoDB ?? "", {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: false
			},
			monitorCommands: true
		});
	}
	catch (err) {
		log.log("critical", `Invalid mongodb connection url. ${err}`);
		return;
	}

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

		// Database change
		const runDataBaseChange = false;
		if (runDataBaseChange) {
			// Change speed & senses (remove 0 values)
			const result = await collections.creatures.updateMany({}, { $pull: { "stats.core.speed": { value: 0, name: { $ne: "Walk" } }, "stats.core.senses": { value: 0 } } });
			log.log("database", `Updated ${result.modifiedCount} creatures to remove empty speed and senses.`);
		}
	}
	catch (err) {
		log.log("critical", err);
		// Ensures that the client will close on error
		await client.close();
	}
}

// Add changes to all in database
export async function addValue(collection: Collection<any>, key: string, value: any) {
	collection.updateMany({ [key]: { $exists: false } }, { $set: { [key]: value } });
	log.log("database", `Added key "${key}" to all documents in collection "${collection.collectionName}" with the value: ${value}`);
}
export async function updateValue(collection: Collection<any>, key: string, value: any) {
	collection.updateMany({}, { $set: { [key]: value } });
}

// Global stats
export async function getGlobalStats(): Promise<GlobalStats | null> {
	try {
		return {
			creatures: (await collections.creatures?.countDocuments()) ?? 0,
			bestiaries: (await collections.bestiaries?.countDocuments()) ?? 0,
			users: (await collections.users?.countDocuments()) ?? 0
		};
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}

// Export other functions
export * from "./automations";
export * from "./bestiaries";
export * from "./creatures";
export * from "./users";
