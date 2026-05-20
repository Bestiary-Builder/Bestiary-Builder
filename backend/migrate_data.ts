import "dotenv/config";
import type { ObjectId } from "mongodb";
import { MongoClient } from "mongodb";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateUserSecret } from "./utilities/constants";
import { BestiaryStatus, PrismaClient, SupporterStatus } from "~/shared/src/prisma-types";

/**
 * Standalone migration script:
 * MongoDB -> PostgreSQL (via Prisma)
 *
 * Required env vars:
 * - MongoDB                 (Mongo connection URI)
 * - MongoDB_DBName          (Mongo database name, default: bestiarybuilder)
 * - DATABASE_URL            (PostgreSQL URL used by Prisma)
 *
 * Run:
 *   npx tsx migrate_data.ts
 */

interface MongoUser {
	_id: string;
	username: string;
	avatar: string;
	email: string;
	verified: boolean;
	banner_color: string;
	global_name: string;
	bestiaries?: ObjectId[];
	bookmarks?: ObjectId[];
	supporter?: 0 | 1 | 2 | number;
	joinedAt?: number;
	secret?: string;
}

interface MongoBestiary {
	_id: ObjectId;
	name: string;
	owner: string;
	editors?: string[];
	status: "public" | "private" | "unlisted" | string;
	description: string;
	creatures?: ObjectId[];
	tags?: string[];
	viewCount?: number;
	bookmarks?: number;
	lastUpdated?: number;
}

interface MongoCreature {
	_id: ObjectId;
	lastUpdated?: number;
	stats: unknown;
	bestiary: ObjectId;
}

interface MongoAutomation {
	_id: ObjectId;
	name: string;
	description: string;
	owner: string;
	lastUpdated?: number;
	automation?: unknown;
}

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

function toStatus(status: string): BestiaryStatus {
	switch (status) {
		case "public": return BestiaryStatus.public;
		case "unlisted": return BestiaryStatus.unlisted;
		default: return BestiaryStatus.private;
	}
}

function toSupporterStatus(supporter: number | undefined): SupporterStatus {
	switch (supporter) {
		case 1: return SupporterStatus.wirmling;
		case 2: return SupporterStatus.greatwyrm;
		default: return SupporterStatus.none;
	}
}

async function main() {
	const mongoUri = requireEnv("MongoDB");
	const mongoDbName = process.env.MongoDB_DBName || "bestiarybuilder";
	requireEnv("DATABASE_URL");

	const mongo = new MongoClient(mongoUri);

	console.log("Connecting to MongoDB...");
	await mongo.connect();
	const db = mongo.db(mongoDbName);

	const usersCol = db.collection<MongoUser>("Users");
	const bestiariesCol = db.collection<MongoBestiary>("Bestiaries");
	const creaturesCol = db.collection<MongoCreature>("Creatures");
	const automationsCol = db.collection<MongoAutomation>("Automations");

	console.log("Reading source data from MongoDB...");
	const [users, bestiaries, creatures, automations] = await Promise.all([
		usersCol.find({}).toArray(),
		bestiariesCol.find({}).toArray(),
		creaturesCol.find({}).toArray(),
		automationsCol.find({}).toArray(),
	]);

	console.log(`Users: ${users.length}`);
	console.log(`Bestiaries: ${bestiaries.length}`);
	console.log(`Creatures: ${creatures.length}`);
	console.log(`Automations: ${automations.length}`);

	// Build quick-lookup sets for integrity checks
	const userIds = new Set(users.map(u => u._id));
	const bestiaryIds = new Set(bestiaries.map(b => b._id.toHexString()));

	console.log("Clearing target PostgreSQL tables...");
	await prisma.$transaction([
		prisma.bestiaryEditor.deleteMany(),
		prisma.userBestiaryBookmark.deleteMany(),
		prisma.creature.deleteMany(),
		prisma.automation.deleteMany(),
		prisma.bestiary.deleteMany(),
		prisma.user.deleteMany(),
	]);

    console.log("Migrating users...");
    await prisma.user.createMany({
        data: users.map(u => ({
            id: u._id,
            username: u.username ?? "",
            avatar: u.avatar ?? "",
            email: u.email ?? "",
            verified: Boolean(u.verified),
            globalName: u.global_name ?? "",
            bannerColor: u.banner_color ?? "",
            supporter: toSupporterStatus(u.supporter ?? 0),
            joinedAt: new Date(u.joinedAt ?? Date.now()),
            secret: u.secret ?? generateUserSecret(),
        }))
    });

    console.log("Migrating bestiaries...");
    await prisma.bestiary.createMany({
        data: bestiaries.filter(b => {
            if (userIds.has(b.owner)) return true;
            console.warn(`Skipping bestiary ${b._id.toHexString()} because owner ${b.owner} does not exist`);
            return false;
        }).map(b => ({
            id: b._id.toHexString(),
			name: b.name ?? "",
			ownerId: b.owner,
			status: toStatus(b.status),
			description: b.description ?? "",
			tags: Array.isArray(b.tags) ? b.tags : [],
			viewCount: b.viewCount ?? 0,
			bookmarks: b.bookmarks ?? 0,
			lastUpdated: new Date(b.lastUpdated ?? Date.now()),
        }))
	})

    console.log("Migrating bestiary editors...");
    await prisma.bestiaryEditor.createMany({
        data: bestiaries.filter(b => bestiaryIds.has(b._id.toHexString())).flatMap(b => b.editors?.filter(editorId => {
            if (!userIds.has(editorId)) {
                console.warn(`Skipping editor ${editorId} for bestiary ${b._id.toHexString()} because user does not exist`);
                return false;
            }
            return true;
        }).map(editorId => ({
            bestiaryId: b._id.toHexString(),
            userId: editorId
        })) ?? [])
    });

    console.log("Migrating automations...");
    await prisma.automation.createMany({
        data: automations.filter(a => userIds.has(a._id.toHexString())).map(a => ({
            id: a._id.toHexString(),
            name: a.name ?? "",
            description: a.description ?? "",
            owner: a.owner,
            lastUpdated: new Date(a.lastUpdated ?? Date.now()),
            automation: (a.automation ?? undefined) as object | undefined,
        }))
    });

	console.log("Migrating bookmarks...");
	// In MongoDB, User.bookmarks stores bestiary ids.
	// We normalize into UserBestiaryBookmark join rows.
    await prisma.userBestiaryBookmark.createMany({
        data: users.filter(u => Array.isArray(u.bookmarks)).flatMap(
            u => {
                const bookmarks = u.bookmarks?.map(bId => bId.toHexString()) ?? [];

                return bookmarks.filter((bId, pos) => bookmarks.indexOf(bId) === pos).filter(bId => bestiaryIds.has(bId)).map(bId => ({
                    userId: String(u._id),
                    bestiaryId: bId
                }));
            }
        )
    })

    console.log("Migrating creatures...");
    const pageSize = 10000;
    let page = 1;
    while (creatures.length > (page - 1) * pageSize) {
        await prisma.creature.createMany({
            data: creatures.slice((page - 1) * pageSize, page * pageSize).filter(c => bestiaryIds.has(c.bestiary.toHexString())).map(c =>
                ({
                    id: c._id.toHexString(),
                    bestiaryId: c.bestiary?.toHexString?.() ?? "",
                    lastUpdated: new Date(c.lastUpdated ?? Date.now()),
                    stats: JSON.parse(JSON.stringify(c.stats ?? {}).replaceAll("\\u0000", "")),
                })
            )
        });
        console.log(`\t${page * pageSize}/${creatures.length} migrated...`);
        page++;
    }

	console.log("Migration complete ✅");

	await prisma.$disconnect();
	await mongo.close();
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
