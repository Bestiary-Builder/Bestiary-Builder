import fetch from "node-fetch";
import SRDAttacks2014 from "@/staticData/2014/SRDAttacks2014.json";
import SRDCreatures2014 from "@/staticData/2014/SRDCreatures2014.json";
import SRDAttacks2024 from "@/staticData/2024/SRDAttacks2024.json";
import SRDCreatures2024 from "@/staticData/2024/SRDCreatures2024.json";
import data from "@/staticData/automationDocumentation.json";
import automationTags from "@/staticData/automationTags.json";
import bestiaryTags from "@/staticData/bestiaryTags.json";
import limits from "@/staticData/limits.json";
import basicExamples from "@/staticData/shared/basicExamples.json";
import spells from "@/staticData/shared/spells.json";
import tOF from "@/staticData/shared/textOnlyFeatures.json";

import { app } from "@/utilities/constants";

// Basic example attacks
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

// Actions
const textOnlyFeatures = {} as { [key: string]: { name: string; description: string; automation: null } };

for (const [key, value] of Object.entries(tOF)) {
	textOnlyFeatures[key] = { name: key, description: value, automation: null };
}

Object.assign(SRDAttacks2014, textOnlyFeatures);
Object.assign(SRDAttacks2024, textOnlyFeatures);

const registerStaticDataRoutes = (routes: Array<{
	path: string;
	data: Record<string, unknown>;
	error: string;
}>) => {
	for (const { path, data, error } of routes) {
		const names = Object.keys(data);
		app.get(`${path}/list`, async (req, res) => {
			return res.json(names);
		});
		app.get(`${path}/:name`, async (req, res) => {
			const name = decodeURIComponent(req.params.name);
			const item = data[name];
			if (item)
				return res.json(item);
			else
				return res.status(404).json({ error });
		});
	}
};

registerStaticDataRoutes([
	{
		path: "/api/srd-features/2014",
		data: SRDAttacks2014 as Record<string, unknown>,
		error: "No SRD feature found with that name"
	},
	{
		path: "/api/srd-features/2024",
		data: SRDAttacks2024 as Record<string, unknown>,
		error: "No SRD feature found with that name"
	},
	{
		path: "/api/srd-creatures/2014",
		data: SRDCreatures2014 as Record<string, unknown>,
		error: "No srd creature found with that name"
	},
	{
		path: "/api/srd-creatures/2024",
		data: SRDCreatures2024 as Record<string, unknown>,
		error: "No srd creature found with that name"
	}
]);

// Spells
app.get("/api/spells/all", async (req, res) => {
	return res.json(spells);
});

let spellListFlattenedTemp: string[] = [];
for (const list of Object.values(spells))
	spellListFlattenedTemp = spellListFlattenedTemp.concat(list);
spellListFlattenedTemp.sort();
export const spellListFlattened = [...spellListFlattenedTemp];

// Gamedata from avrae
const getAllEntitlements = async () => await fetch("https://api.avrae.io/gamedata/entitlements?free=aaa", {
	method: "GET",
	headers: {
		"Content-Type": "application/json"
	},
}).then(response => response.json());

let gameDataspells: Array<{ label: string; id: number }>;
getAllEntitlements().then((x) => {
	gameDataspells = Object.values(x.data).filter((x: any) => x.entity_type === "spell").map((x: any) => ({ label: x.name, id: x.entity_id }));
});

app.get("/api/gamedata/spells", async (req, res) => {
	res.json(gameDataspells);
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
	res.json(bestiaryTags);
});
app.get("/api/automationTags", async (req, res) => {
	res.json(automationTags);
});
app.get("/api/limits", async (req, res) => {
	res.json(limits);
});
app.get("/api/automationDocumentation", async (req, res) => {
	res.json(data);
});
