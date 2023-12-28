import {Bestiary, collections} from "../database";
import type {Filter, FindOptions, Sort} from "mongodb";
import {app, log} from "../server";
import allTags from "../staticData/tags.json";

const amountPerPage = 11;

app.post("/api/search", async (req, res) => {
	try {
		//Parse search inputs
		let searchOptions = req.body.options as {
			search: string;
			page: number;
			mode: "popular" | "recent";
			tags: string[];
		};
		if (!searchOptions) return res.status(400).json({error: "No search options were found"});
		if (!searchOptions.search) searchOptions.search = ".";
		if (!searchOptions.page) searchOptions.page = 0;
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
		//console.log(output.results.map((x: any) => ({name: x.name, creatureAmount: x.creatures.length, popularityScore: x.popularityScore, bookmarks: x.bookmarks, viewCount: x.viewCount})));
		log.info(`Search completed with ${output.pageAmount} pages`);
		return res.json(output);
	} catch (err) {
		log.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
