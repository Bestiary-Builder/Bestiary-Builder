import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "~/shared/src/prisma-types";
import type { Creature } from "~/shared";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({ adapter });

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value || !value.trim()) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

async function main() {
	requireEnv("DATABASE_URL");

	// Start time
	const startTime = Date.now();

	const totalCount = await prisma.creature.count({});
	console.log(`Found ${totalCount} creatures to update`);
	for (let i = 0; i < totalCount;) {
		// Add new data to creature statblocks
		const creaturesToUpdate = await prisma.creature.findMany({
			take: 1000,
			skip: i
		});
		const result = await prisma.$transaction(creaturesToUpdate.map(creature => createOperation(creature)));
		i += result.length;
		console.log(`Updated ${result.length} (${i}) creature statblocks`);
	}

	const endTime = Date.now();

	console.log(`Total time: ${endTime - startTime}ms`);
}

function createOperation(creature: Creature) {
	const stats = creature.stats;
	stats.abilities.saves.str.adv = null;
	stats.abilities.saves.dex.adv = null;
	stats.abilities.saves.con.adv = null;
	stats.abilities.saves.wis.adv = null;
	stats.abilities.saves.int.adv = null;
	stats.abilities.saves.cha.adv = null;
	return prisma!.creature.update({
		where: { id: creature.id },
		data: { stats }
	});
}

main().catch(async (err) => {
	console.error("Migration failed ❌");
	console.error(err);
	try {
		await prisma.$disconnect();
	}
	catch {}
	process.exit(1);
});
