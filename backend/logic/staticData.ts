import {app} from "../utilities/constants";
import {log} from "../utilities/logger";

import basicExamples from "../staticData/basicExamples.json";
import srdFeatures from "../staticData/srdFeatures.json";
import textOnlyFeatures from "../staticData/textOnlyFeatures.json";
const allSrdFeatures = Object.keys(textOnlyFeatures)
	// @ts-ignore
	.map((key) => ({name: key, description: textOnlyFeatures[key], automation: null}))
	// @ts-ignore
	.concat(srdFeatures);

//Basic example
app.get("/api/basic-examples/list", async (req, res) => {
	let names = basicExamples.map((a) => a.name);
	return res.json(names);
});
app.get("/api/basic-example/:name", async (req, res) => {
	let name = decodeURIComponent(req.params.name);
	let data = basicExamples.find((a) => a.name == name);
	if (data) {
		return res.json(data);
	} else {
		return res.status(404).json({error: "No example found with that name"});
	}
});
//Features
app.get("/api/srd-features/list", async (req, res) => {
	let names = allSrdFeatures.map((a) => a.name) ?? [];
	return res.json(names);
});
app.get("/api/srd-feature/:name", async (req, res) => {
	let name = decodeURIComponent(req.params.name);
	let data = allSrdFeatures.find((a) => a.name == name);
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
