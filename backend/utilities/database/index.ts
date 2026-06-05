import { PrismaPg } from "@prisma/adapter-pg";
import { log } from "@/utilities/logger";
import type { GlobalStats, Statblock } from "~/shared";

// Connect to database
import { PrismaClient } from "~/shared/src/prisma-types";
import type { JsonObject } from "~/shared/prisma/internal/prismaNamespace";

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
			// Add new data to creature statblocks
			const creaturesToUpdate = await prisma.creature.findMany({});
			const result = await prisma.$transaction(creaturesToUpdate.map((creature) => {
				const stats = creature.stats as unknown as Statblock;
				return prisma!.creature.update({
					where: { id: creature.id },
					data: {
						stats: {
							...stats,
							abilities: {
								...stats.abilities,
								saves: {
									str: { ...stats.abilities.saves.str, adv: stats.abilities.saves.str.adv ?? null },
									dex: { ...stats.abilities.saves.dex, adv: stats.abilities.saves.dex.adv ?? null },
									con: { ...stats.abilities.saves.con, adv: stats.abilities.saves.con.adv ?? null },
									wis: { ...stats.abilities.saves.wis, adv: stats.abilities.saves.wis.adv ?? null },
									int: { ...stats.abilities.saves.int, adv: stats.abilities.saves.int.adv ?? null },
									cha: { ...stats.abilities.saves.cha, adv: stats.abilities.saves.cha.adv ?? null },
								}
							}
						} as Statblock as unknown as JsonObject
					}
				});
			}));
			log.info(`Updated ${result.length} creature statblocks`);
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
