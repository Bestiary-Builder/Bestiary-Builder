import fs from "fs";
import path from "path";
import express, {NextFunction, Request, Response} from "express";
//Setup environment variables
import dotenv from "dotenv";
dotenv.config();
//Logging
import {log} from "./utilities/logger";
//App
import {app, isProduction} from "./utilities/constants";

//Import middleware
import "./utilities/middleware";

//Setup database connection
import {getBestiary, getCreature, getUser, startConnection} from "./utilities/database";
startConnection();

//Setup http server
import http from "http";
const httpServer = http.createServer(app);
httpServer.listen(parseInt(process.env.port ?? "5000"), () => {
	log.info("Server listening to port " + (process.env.port ?? "5000"));
});

//Load frontend
import {routes, defaultMetaTags, Route} from "./utilities/routes";
import {Id, stringToId} from "../shared";
async function getFrontendHtml(route: Route, req: Request) {
	const frontendPath = process.env.frontendPath as string;
	//Get information
	let title = "Bestiary Builder";
	if (route.name) title = route.name + " | Bestiary Builder";
	let description = route.meta.description;
	if (route.meta.dynamic) {
		switch (route.path) {
			case "/bestiary-viewer/:id":
				let bId = stringToId(req.params.id);
				if (bId) {
					let bestiary = await getBestiary(new Id(bId));
					if (bestiary) {
						if (bestiary.status == "private") {
							title = "Private bestiary | Bestiary Builder";
							description = "A bestiary that is unavailable to anyone but its editors.";
						} else {
							title = bestiary.name + " | Bestiary Builder";
							let desc = bestiary.description ?? "No description set.";
							let owner = await getUser(bestiary.owner);
							desc += `\n${bestiary.creatures.length} creature${bestiary.creatures.length > 1 ? "s" : ""}${owner ? ` created by ${owner.username}` : ""}.`;
							description = desc;
						}
					}
				}
				break;
			// case "/statblock-editor/:id":
			// 	let sId = stringToId(req.params.id);
			// 	if (sId) {
			// 		let creature = await getCreature(new Id(sId));
			// 		if (creature) {
			// 			title = `${creature.stats.description.name.substring(0, 16)} | Bestiary Builder`;
			// 			if (creature.stats.description.description) description = creature.stats.description.description;
			// 		}
			// 	}
			// 	break;
			default:
				break;
		}
	}
	//Get index.html
	let html = null;
	const filePath = path.join(frontendPath, "index.html");
	console.log(filePath);
	html = fs.readFileSync(filePath, {encoding: "utf-8"});
	//Create metatags
	let metatags = [
		`<title>${title}</title>`,
		...defaultMetaTags.map((tagInfo) => {
			let tagDef = {...tagInfo};
			//Change content of tag:
			if (tagDef.name.includes("title") || tagDef.name.includes("name")) tagDef.content = title;
			if (tagDef.name.includes("description") && description) tagDef.content = description;
			if (tagDef.name.includes("image") && route.meta.image) tagDef.content = route.meta.image;
			if (tagDef.name.includes("keywords") && route.meta.keywords) tagDef.content = route.meta.keywords;
			//Return new tag
			return `<meta ${tagDef.type}="${tagDef.name}" content="${tagDef.content}">`;
		})
	];
	//Return index.html with tags
	return html.replace("<!-- meta tags -->", metatags.join("\n		"));
}
for (let route of routes) {
	app.get(route.path, async (req, res) => {
		try {
			let html = await getFrontendHtml(route, req);
			if (html) return res.send(html);
		} catch (err) {
			log.error(err);
			res.status(500).send("Internal Server Error");
		}
	});
}
//Static frontend files
app.use(express.static(path.join(__dirname, process.env.frontendPath as string)));

//Import logic files
import "./logic/logic";

//Start discord bot
import {startDiscordBot} from "./logic/discord";
startDiscordBot();

//Everything else is 404
app.get("/api/*", (req, res) => res.status(404).json({error: "Path not found."}));
app.get("/*", async (req, res) => {
	try {
		let html = await getFrontendHtml(routes.find((r) => r.path == "/notfound")!, req);
		return res.send(html);
	} catch (err) {
		log.error(err);
		return res.status(500).send("Internal Server Error");
	}
});
