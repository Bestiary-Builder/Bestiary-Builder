import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import express from "express";
import type { Request } from "express";
import dotenv from "dotenv";
// Logging
import discord from "./logic/discord";
import { log } from "@/utilities/logger";
// App
import { app } from "@/utilities/constants";

// Import middleware
import "@/utilities/middleware";

// Setup database connection
import { getBestiary, getUser, startConnection } from "@/utilities/database";

// Import shared stuff
import { Id, routes, stringToId } from "~/shared";

// Import logic files
import "./logic";

// Load .env
dotenv.config();
// Connect to database
startConnection();

// Static frontend files
log.info(`Reading frontend files from: \"${path.resolve(process.env.frontendPath as string)}\"`);
app.use("/", express.static(path.resolve(process.env.frontendPath as string)));

// API 404
app.get(/\/api\/.*/, (req, res) => res.status(404).json({ error: "Path not found." }));

// Get frontend html
async function getFrontendHtml(route: routes.Route, req: Request) {
	// Get information
	let title = "Bestiary Builder";
	if (route?.name)
		title = `${route.name} | Bestiary Builder`;
	let description = route?.meta?.description;
	if (route?.meta?.dynamic) {
		switch (route.path) {
			case "/bestiary-viewer/:id":
				// eslint-disable-next-line no-case-declarations
				const bId = stringToId(req.params.id);
				if (bId) {
					const bestiary = await getBestiary(new Id(bId));
					if (bestiary) {
						if (bestiary.status === "private") {
							title = "Private bestiary | Bestiary Builder";
							description = "A bestiary that is unavailable to anyone but its editors.";
						}
						else {
							title = `${bestiary.name} | Bestiary Builder`;
							let desc = bestiary.description ?? "No description set.";
							const owner = await getUser(bestiary.owner);
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
	// Create metatags
	const metatags = [
		`<title>${title}</title>`,
		...routes.defaultMetaTags.map((tagInfo) => {
			const tagDef = { ...tagInfo };
			// Change content of tag:
			if (tagDef.name.includes("title") || tagDef.name.includes("name"))
				tagDef.content = title;
			if (tagDef.name.includes("description") && description)
				tagDef.content = description;
			if (tagDef.name.includes("image") && route?.meta?.image)
				tagDef.content = route.meta.image;
			if (tagDef.name.includes("keywords") && route?.meta?.keywords)
				tagDef.content = route.meta.keywords;
			// Return new tag
			return `<meta ${tagDef.type}="${tagDef.name}" content="${tagDef.content}">`;
		})
	];
	// Get index.html
	let html = null;
	const filePath = path.join(process.env.frontendPath as string, "index.html");
	html = fs.readFileSync(filePath, { encoding: "utf-8" });
	// Return index.html with tags
	return html.replace("<!-- meta tags -->", metatags.join("\n		"));
}
for (const route of routes.routes) {
	if(route.path.includes(".*")) continue;
	app.get(route.path, async (req, res) => {
		try {
			const html = await getFrontendHtml(route, req);
			if (html)
				return res.send(html);
		}
		catch (err) {
			log.error(err);
			res.status(500).send("Internal Server Error");
		}
	});
}

// Everything else is 404
app.get(/.*/, async (req, res) => {
	try {
		const html = await getFrontendHtml(routes.routes.find(r => r.path === "/notfound")!, req);
		return res.send(html);
	}
	catch (err) {
		log.error(err);
		return res.status(500).send("Internal Server Error");
	}
});

// Start HTTP server
const httpServer = http.createServer(app);
httpServer.listen(Number.parseInt(process.env.port ?? "5000"), () => {
	log.info(`Server listening to port ${process.env.port ?? "5000"}`);
});

// Start discord bot
discord.login(process.env.discordBotToken!).catch(() => log.error("Failed to connect to discord bot"));
