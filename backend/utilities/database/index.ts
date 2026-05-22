import { PrismaPg } from "@prisma/adapter-pg";
import { v4 as uuid } from "uuid";
import { log } from "@/utilities/logger";
import type { GlobalStats } from "~/shared";

// Connect to database
import { PrismaClient } from "~/shared/src/prisma-types";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

let prisma: PrismaClient | undefined;
export function getPrismaClient() {
	if (prisma === undefined)
		throw new Error("Prisma client is not initialized. Please call startConnection() first.");
	return prisma;
}

export async function startConnection() {
	while (true) {
		try {
			// Create prisma client and connect
			prisma = new PrismaClient({ adapter });
			// Fix old wrong bestiary ids
			const bestiariesToUpdate = await prisma.bestiary.findMany({
				where: {
					id: {
						startsWith: "cmp"
					}
				}
			});
			for (const bestiary of bestiariesToUpdate) {
				log.info(`Updating bestiary with id ${bestiary.id} to new format.`);
				await prisma.bestiary.update({
					where: { id: bestiary.id },
					data: { id: uuid().replaceAll("-", "") }
				});
			}
			// Stop waiting loop
			return;
		}
		catch (err) {
			log.log("critical", err);
			log.info("Waiting 5 seconds to retry database connection...");
			await new Promise(resolve => setTimeout(resolve, 5000));
		}
	}
}

// Show error screen when no database connection
export function isDatabaseConnected(): boolean {
	return prisma !== undefined;
}

// Global stats
export async function getGlobalStats(): Promise<GlobalStats | null> {
	try {
		const prisma = getPrismaClient();
		return {
			creatures: await prisma.creature.count(),
			bestiaries: await prisma.bestiary.count(),
			users: await prisma.user.count()
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
