import fetch from "node-fetch";
import { app } from "@/utilities/constants";
import basicExamples from "@/staticData/shared/basicExamples.json";
import SRDAttacks2014 from "@/staticData/2014/SRDAttacks2014.json";
import SRDCreatures2014 from "@/staticData/2014/SRDCreatures2014.json";
import SRDCreatures2024 from "@/staticData/2024/SRDCreatures2024.json";
import tOF from "@/staticData/shared/textOnlyFeatures.json";
import tags from "@/staticData/tags.json";
import limits from "@/staticData/limits.json";
import data from "@/staticData/automationDocumentation.json";

const textOnlyFeatures = tOF as { [key: string]: string };
const attacks2014 = Object.keys(textOnlyFeatures)
	.map(key => ({ name: key, description: textOnlyFeatures[key] as string, automation: null as unknown }))
	.concat(SRDAttacks2014);

// Basic example
app.get("/api/basic-examples/list", async (req, res) => {
	const names = basicExamples.map(a => a.name);
	return res.json(names);
});
app.get("/api/basic-example/:name", async (req, res) => {
	const name = decodeURIComponent(req.params.name);
	const data = basicExamples.find(a => a.name === name);
	if (data)
		return res.json(data);
	else
		return res.status(404).json({ error: "No example found with that name" });
});

// Features
app.get("/api/srd-features/2014/list", async (req, res) => {
	const names = attacks2014.map(a => a.name) ?? [];
	return res.json(names);
});
app.get("/api/srd-feature/2014/:name", async (req, res) => {
	const name = decodeURIComponent(req.params.name);
	const data = attacks2014.find(a => a.name === name);
	if (data)
		return res.json(data);
	else
		return res.status(404).json({ error: "No srd feature found with that name" });
});

// Creatures
const CreatureNames2014 = Object.keys(SRDCreatures2014);
app.get("/api/srd-creatures/2014/list", async (req, res) => {
	return res.json(CreatureNames2014);
});
app.get("/api/srd-creatures/2014/:name", async (req, res) => {
	const name = decodeURIComponent(req.params.name);
	const data = (SRDCreatures2014 as any)[name];
	if (data)
		return res.json(data);
	else
		return res.status(404).json({ error: "No srd creature found with that name" });
});

const CreatureNames2024 = Object.keys(SRDCreatures2024);
app.get("/api/srd-creatures/2024/list", async (req, res) => {
	return res.json(CreatureNames2024);
});
app.get("/api/srd-creatures/2024/:name", async (req, res) => {
	const name = decodeURIComponent(req.params.name);
	const data = (SRDCreatures2024 as any)[name];
	if (data)
		return res.json(data);
	else
		return res.status(404).json({ error: "No srd creature found with that name" });
});

// Spells
const getAllEntitlements = async () => await fetch("https://api.avrae.io/gamedata/entitlements?free=aaa", {
	method: "GET",
	headers: {
		"Content-Type": "application/json"
	},
}).then(response => response.json());

let spells: Array<{ label: string; id: number }>;
getAllEntitlements().then((x) => {
	spells = Object.values(x.data).filter((x: any) => x.entity_type === "spell").map((x: any) => ({ label: x.name, id: x.entity_id }));
});

app.get("/api/gamedata/spells", async (req, res) => {
	res.json(spells);
});

// limiteduse abilities
let limiteduse: any[] = [];
const getLimitedUse = async () => await fetch("https://api.avrae.io/gamedata/limiteduse", {
	method: "GET",
	headers: {
		"Content-Type": "application/json"
	},
}).then(response => response.json());

getLimitedUse().then(x => limiteduse = x.data);

app.get("/api/gamedata/limiteduse", async (req, res) => {
	res.json(limiteduse);
});
// json files
app.get("/api/tags", async (req, res) => {
	res.json(tags);
});
app.get("/api/limits", async (req, res) => {
	res.json(limits);
});
app.get("/api/automationDocumentation", async (req, res) => {
	res.json(data);
});
