import {app} from "../utilities/constants";
import {log} from "../utilities/logger";
import fetch from "node-fetch";

app.get("/api/critterdb/:id/:published", async (req, res) => {
	let id = req.params.id;
	let published = req.params.published.toLowerCase() == "true";
	let result = await from_critterdb(id, published);
	if (!result) {
		return res.status(500).json({error: "Failed to fetch info from critterdb.com. Are you sure the link is right?"});
	} else {
		return res.json(result);
	}
});

async function from_critterdb(url: string, published: boolean) {
	let data = {creatures: [] as any[], name: "", description: ""};
	log.info(`CritterDB | Getting bestiary ID ${url}...`);
	let api_base = published ? "https://critterdb.com:443/api/publishedbestiaries" : "https://critterdb.com:443/api/bestiaries";

	let errored = false;
	await fetch(`${api_base}/${url}`).then(async (resp) => {
		try {
			let raw = (await resp.json()) as any;
			data.name = raw["name"];
			data.description = raw["description"];
		} catch (error) {
			log.error(`CritterDB | Error importing bestiary metadata. Id: "${url}" Published: ${published}`);
			errored = true;
		}
	});
	if (!errored) {
		if (published) data.creatures = await get_published_bestiary_creatures(url, api_base);
		else data.creatures = (await get_link_shared_bestiary_creatures(url, api_base)) ?? [];
	}

	return errored ? null : data;
}

async function get_published_bestiary_creatures(id: string, api_base: string) {
	log.info(`CritterDB | Getting link published bestiary ${id}...`);
	let creatures = [] as any[];
	for (let index = 1; index <= 100 /* 100 pages max */; index++) {
		log.info(`CritterDB | Getting page ${index} of ${id}...`);
		let raw_creatures = (await fetch(`${api_base}/${id}/creatures/${index}`).then(async (resp) => {
			if (!(resp.status >= 200 && resp.status < 300)) {
				log.error(`CritterDB | Error importing published bestiary creatures. Id: "${id}".`);
				return null;
			}
			return resp.json();
		})) as any[] | null;
		if (!raw_creatures || raw_creatures.length == 0) break;
		creatures.push(raw_creatures);
	}
	return creatures.flat();
}

async function get_link_shared_bestiary_creatures(id: string, api_base: string) {
	log.info(`CritterDB | Getting link shared bestiary ${id}...`);
	let creatures = await fetch(`${api_base}/${id}/creatures`).then(async (resp) => {
		if (resp.status == 400) {
			log.error(`CritterDB | Permission error importing link shared bestiary creatures. Id: "${id}".`);
		} else if (!(resp.status >= 200 && resp.status < 300)) {
			log.error(`CritterDB | Unkown error importing link shared bestiary creatures. Id: "${id}".`);
			return null;
		}
		return (await resp.json()) as any[];
	});
	return creatures;
}
