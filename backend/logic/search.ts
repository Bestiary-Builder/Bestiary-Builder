import { createCheckers } from "ts-interface-checker";
import type { Response } from "express";
import { getGlobalStats, getPrismaClient } from "@/utilities/database";
import { Prisma } from "~/shared/prisma/client";
import type { BestiaryWithCount, SearchOptions } from "~/shared";
import { app } from "@/utilities/constants";
import { log } from "@/utilities/logger";

// Validate input
import { interfaceValidation, typeInterface } from "~/shared";

const amountPerPage = 12;

function normalizeSearchTerm(term: string | undefined | null): string | null {
	if (!term)
		return null;
	const trimmed = term.trim();
	if (!trimmed || trimmed === ".")
		return null;
	return trimmed;
}

function buildWhereSql(searchTerm: string | null, tags: string[]) {
	const conditions: Prisma.Sql[] = [
		Prisma.sql`"status" = 'public'`
	];

	if (searchTerm) {
		const pattern = `%${searchTerm}%`;
		conditions.push(Prisma.sql`("name" ILIKE ${pattern} OR "description" ILIKE ${pattern})`);
	}

	if (tags.length > 0) {
		conditions.push(Prisma.sql`"tags" && ARRAY[${Prisma.join(tags)}]::text[]`);
	}

	let whereSql = conditions[0];
	for (let i = 1; i < conditions.length; i++) {
		whereSql = Prisma.sql`${whereSql} AND ${conditions[i]}`;
	}
	return whereSql;
}

app.post("/api/search", async (req, res) => {
	try {
		// Parse search inputs
		const input = req.body.data as Partial<SearchOptions> | null;
		const searchOptions: SearchOptions = {
			...{
				search: ".",
				page: 0,
				mode: "popular",
				tags: []
			},
			...(input ?? {})
		};

		if (!validateSearchInput(searchOptions, res))
			return;
		if (searchOptions.page < 0)
			return res.status(400).json({ error: "Page out of bounds" });

		const searchTerm = normalizeSearchTerm(searchOptions.search);
		const tags = searchOptions.tags ?? [];
		const whereSql = buildWhereSql(searchTerm, tags);

		const prisma = getPrismaClient();

		const totalCountRows = await prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
			SELECT COUNT(*)::int AS count
			FROM "Bestiaries"
			WHERE ${whereSql}
		`);

		const totalCount = totalCountRows[0]?.count ?? 0;
		const pageAmount = Math.max(1, Math.ceil(totalCount / amountPerPage));

		const offset = searchOptions.page * amountPerPage;
		const orderBy = searchOptions.mode === "popular"
			? Prisma.sql`ORDER BY ("bookmarks" * 10 + "viewCount") DESC, "lastUpdated" DESC, "name" ASC`
			: Prisma.sql`ORDER BY "lastUpdated" DESC, "name" ASC`;

		const results = await prisma.$queryRaw<BestiaryWithCount[]>(Prisma.sql`
			SELECT
				"id",
				"name",
				"owner" AS "ownerId",
				"status",
				"description",
				"tags",
				"viewCount",
				"bookmarks",
				"lastUpdated",
				(SELECT COUNT(*)::int FROM "Creatures" WHERE "bestiary" = "Bestiaries"."id") AS "creatureCount"
			FROM "Bestiaries"
			WHERE ${whereSql}
			${orderBy}
			LIMIT ${amountPerPage} OFFSET ${offset}
		`);

		const output = {
			results,
			pageAmount
		};

		log.info(`Search completed with ${output.pageAmount} pages`);
		return res.json(output);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

const { SearchOptions: SearchChecker } = createCheckers(typeInterface);
function validateSearchInput(input: SearchOptions, res: Response) {
	if (SearchChecker.test(input)) {
		return true;
	}
	else {
		res.status(400).json({ error: `Creature data not valid:\n${interfaceValidation(SearchChecker.validate(input) ?? [])}` });
		return false;
	}
}

// Global stats
app.get("/api/stats", async (req, res) => {
	const stats = await getGlobalStats();
	if (!stats)
		return res.status(500).json({ error: "Failed to retrieve stats." });
	return res.json(stats);
});
