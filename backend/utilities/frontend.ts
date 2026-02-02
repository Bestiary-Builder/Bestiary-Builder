import fs from "node:fs";
import path from "node:path";
import express, { type Request } from "express";
import { log } from "./logger";
import { app } from "./constants";
import { Id, routes, stringToId } from "~/shared";
import { getBestiary, getUser, isDatabaseConnected } from "@/utilities/database";

export async function getFrontendHtml(route: routes.Route, req: Request) {
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
	// Get home.html
	let html = null;
	const filePath = path.join(process.env.frontendPath as string, "home.html");
	html = fs.readFileSync(filePath, { encoding: "utf-8" });
	// Return html with tags
	return html.replace("<!-- meta tags -->", metatags.join("\n		"));
}

// Static frontend files (before any middleware)
log.info(`Reading frontend files from: \"${path.resolve(process.env.frontendPath as string)}\"`);
app.use("/", express.static(path.resolve(process.env.frontendPath as string)));

// Show error when no database is connected
app.use(async (req, res, next) => {
	if (req.url.startsWith("/server-error")) {
		res.status(500);
		return next();
	}
	if (isDatabaseConnected())
		return next();
	// API error
	if (req.url.startsWith("/api"))
		return res.status(500).json({ error: "Server having issues" });

	// Frontend error
	return res.redirect("/server-error");
});
