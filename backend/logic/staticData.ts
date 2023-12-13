import {app} from "../server";

import basicExamples from "../staticData/basicExamples.json";
import srdFeatures from "../staticData/srdFeatures.json";

app.get("/api/basic-examples/list", (req, res) => {
	let names = [] as string[];
	for (let example of basicExamples) {
		names.push(example.name);
	}
	return res.json(names);
});
app.get("/api/basic-example/:name", (req, res) => {
	let name = req.params.name;
	let data = basicExamples.find((a) => a.name == name);
	if (data) {
		return res.json(data);
	} else {
		return res.status(404).json({error: "No example found with that name"});
	}
});
app.get("/api/srd-features/list", (req, res) => {
	let names = [] as string[];
	for (let example of srdFeatures) {
		names.push(example.name);
	}
	return res.json(names);
});
app.get("/api/srd-feature/:name", (req, res) => {
	let name = req.params.name;
	let data = srdFeatures.find((a) => a.name == name);
	if (data) {
		return res.json(data);
	} else {
		return res.status(404).json({error: "No srd feature found with that name"});
	}
});
