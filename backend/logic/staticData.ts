import {app} from "../server";
import {log} from "../logger";

import basicExamples from "../staticData/basicExamples.json";
import srdFeatures from "../staticData/srdFeatures.json";

//Basic example
app.get("/api/basic-examples/list", async (req, res) => {
	let names = basicExamples.map((a) => a.name);
	return res.json(names);
});
app.get("/api/basic-example/:name", async (req, res) => {
	let name = req.params.name;
	let data = basicExamples.find((a) => a.name == name);
	if (data) {
		return res.json(data);
	} else {
		return res.status(404).json({error: "No example found with that name"});
	}
});
//Features
app.get("/api/srd-features/list", async (req, res) => {
	let names = srdFeatures.map((a) => a.name) ?? [];
	return res.json(names);
});
app.get("/api/srd-feature/:name", async (req, res) => {
	let name = req.params.name;
	let data = srdFeatures.find((a) => a.name == name);
	if (data) {
		return res.json(data);
	} else {
		return res.status(404).json({error: "No srd feature found with that name"});
	}
});

//Tags
import tags from "../staticData/tags.json";
app.get("/api/tags", async (req, res) => {
	res.json(tags);
});

//Limits
import limits from "../staticData/limits.json";
app.get("/api/limits", async (req, res) => {
	res.json(limits);
});
