import {Bestiary, collections} from "../database";
import type {Filter, FindOptions} from "mongodb";
import {app} from "../server";
import allTags from "../staticData/tags.json";

const amountPerPage = 11;

app.post("/api/search", async (req, res) => {
	try {
		//Parse search inputs
		let searchOptions = req.body.options as {
			search: string;
			page: number;
			tags: string[];
		};
		if (!searchOptions) return res.status(400).json({error: "No search options were found"});
		if (!searchOptions.search) searchOptions.search = ".";
		if (!searchOptions.page) searchOptions.page = 0;
		if (searchOptions.page < 0) return res.status(400).json({error: "Page out of bounds"});
		//Do the search
		let filter = {
			status: "public",
			$or: [{name: {$regex: "(?i)" + searchOptions.search + "(?-i)"}}, {description: {$regex: "(?i)" + searchOptions.search + "(?-i)"}}]
		} as Filter<Bestiary>;
		if (searchOptions.tags && searchOptions.tags.length > 0) filter.tags = {$elemMatch: {$in: searchOptions.tags}};
		let finder = collections.bestiaries?.find(filter).sort({bookmarks: -1, viewCount: -1, lastUpdated: -1, name: 1});
		let amountFound = (await finder?.count()) ?? 0;
		if (amountFound == 0) amountFound = 1;
		let results = await finder
			?.skip(searchOptions.page * amountPerPage)
			.limit(amountPerPage)
			.toArray();
		console.log(`Search completed with ${amountFound} results`);
		return res.json({results: results, totalAmount: Math.ceil(amountFound / amountPerPage)});
	} catch (err) {
		console.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
