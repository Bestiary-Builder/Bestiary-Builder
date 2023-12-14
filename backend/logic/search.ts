import {Bestiary, collections} from "../database";
import type {Filter, FindOptions} from "mongodb";
import {app} from "../server";

const amountPerPage = 10;

app.get("/api/search/:page/:searchterm?", async (req, res) => {
	let searchTerm, page;
	try {
		searchTerm = req.params.searchterm ?? ".";
		page = parseInt(req.params.page);
		if (page < 0) throw EvalError("Page out of bounds");
	} catch {
		return res.status(400).json({error: "Failed to parse search inputs"});
	}
	console.log(page);
	console.log(searchTerm);
	let filter = {
		status: "public",
		$or: [{name: {$regex: "(?i)" + searchTerm + "(?-i)"}}, {description: {$regex: "(?i)" + searchTerm + "(?-i)"}}]
	} as Filter<Bestiary>;
	let finder = collections.bestiaries?.find(filter).sort({viewCount: -1, lastUpdated: -1, name: 1});
	let amountFound = await finder?.count();
	console.log(amountFound);
	let results = await finder
		?.skip(page * amountPerPage)
		.limit(amountPerPage)
		.toArray();
	console.log(results);
	return res.json({results: results, totalAmount: Math.ceil(((amountFound ?? 0) + 1) / amountPerPage)});
});
