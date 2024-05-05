import {collections, getGlobalStats} from "@/utilities/database";
import {User, Bestiary, Creature, SearchOptions} from "~/shared";
import {type Filter, type FindOptions, type Sort} from "mongodb";
import {app} from "@/utilities/constants";
import {log} from "@/utilities/logger";

const amountPerPage = 12;

app.post("/api/search", async (req, res) => {
	try {
		//Parse search inputs
		let input = req.body.options as Partial<SearchOptions> | null;
		let searchOptions = {
			...({
				search: ".",
				page: 0,
				mode: "popular",
				tags: []
			} as SearchOptions),
			...(input ?? {})
		} as SearchOptions;
		if (!validateSearchInput(searchOptions, res)) return;
		if (searchOptions.page < 0) return res.status(400).json({error: "Page out of bounds"});
		//Filter
		let filter = {
			status: "public",
			$or: [{name: {$regex: "(?i)" + searchOptions.search + "(?-i)"}}, {description: {$regex: "(?i)" + searchOptions.search + "(?-i)"}}]
		} as Filter<Bestiary>;
		if (searchOptions.tags && searchOptions.tags.length > 0) filter.tags = {$elemMatch: {$in: searchOptions.tags}};
		//Sort
		let sort: Sort;
		if (searchOptions.mode === "popular") {
			sort = {popularityScore: -1, lastUpdated: -1, name: 1};
		} else sort = {lastUpdated: -1, name: 1};
		//Aggregate:
		let finder = await collections.bestiaries
			?.aggregate([
				{
					$match: filter
				},
				{
					$addFields: {
						popularityScore: {
							$sum: [
								{
									$multiply: ["$bookmarks", 10]
								},
								"$viewCount"
							]
						}
					}
				},
				{
					$sort: sort
				},
				{
					$facet: {
						totalCount: [
							{
								$count: "count"
							}
						],
						results: [{$skip: searchOptions.page * amountPerPage}, {$limit: amountPerPage}]
					}
				}
			])
			.toArray();
		//Return the final search results
		let output;
		if (!finder) output = {results: [], pageAmount: 1};
		else {
			let pageAmount = Math.ceil(finder[0].totalCount[0]?.count / amountPerPage);
			if (Number.isNaN(pageAmount)) pageAmount = 1;
			output = {
				results: finder[0].results,
				pageAmount
			};
		}
		log.info(`Search completed with ${output.pageAmount} pages`);
		return res.json(output);
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Validate input
import {createCheckers} from "ts-interface-checker";
import {Response} from "express";
import {typeInterface, interfaceValidation} from "~/shared";
const {SearchOptions: SearchChecker} = createCheckers(typeInterface);
function validateSearchInput(input: any, res: Response) {
	if (SearchChecker.test(input)) {
		return true;
	} else {
		res.status(400).json({error: `Creature data not valid:\n${interfaceValidation(SearchChecker.validate(input) ?? [])}`});
		return false;
	}
}

//Global stats
app.get("/api/stats", async (req, res) => {
	const stats = await getGlobalStats();
	if (!stats) return res.status(500).json({error: "Failed to retrieve stats."});
	return res.json(stats);
});
