import type { Request } from "express";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { getAutomationCollectionMetaData, getAutomationMetaData, getBestiaryMetaData, getCreatureMetaData, isDatabaseConnected } from "@/utilities/database";
import { routes } from "~/shared";
import { app } from "./constants";
import { log } from "./logger";

export async function getFrontendHtml(route: routes.Route, req: Request) {
	// Get information
	let title = "Bestiary Builder";
	if (route?.name)
		title = `${route.name} | Bestiary Builder`;
	let description = route?.meta?.description;
	let image: string | null = null;
	if (route?.meta?.dynamic && req.params.id) {
		const paramId = req.params.id;
		if (route.path.startsWith("/bestiary/view") || route.path.startsWith("/bestiary/edit")) {
			const bestiary = await getBestiaryMetaData(paramId);
			if (bestiary) {
				if (bestiary.status === "private") {
					title = "Private bestiary | Bestiary Builder";
					description = "A bestiary that is unavailable to anyone but its editors.";
				}
				else {
					title = `${bestiary.name} | Bestiary Builder`;
					description = `${bestiary.creatureCount} creature${bestiary.creatureCount !== 1 ? "s" : ""} created by ${bestiary.owner.username}.\n${bestiary.description?.length > 0 ? bestiary.description : "No description set."}`;
					image = bestiary.image?.length > 0 ? bestiary.image : null;
				}
			}
		}
		else if (route.path.startsWith("/creature/view") || route.path.startsWith("/creature/edit")) {
			const creature = await getCreatureMetaData(paramId);
			if (creature) {
				if (creature.bestiary.status === "private") {
					title = "Private creature | Bestiary Builder";
					description = "A creature that is unavailable to anyone but its editors.";
				}
				else {
					title = `${creature.stats.description.name} | Bestiary Builder`;
					description = `From bestiary ${creature.bestiary.name} created by ${creature.bestiary.owner.username}.\n${creature.stats.description.description?.length > 0 ? creature.stats.description.description : "No description set."}`;
					image = creature.stats.description.image?.length > 0 ? creature.stats.description.image : null;
				}
			}
		}
		else if (route.path.startsWith("/armory/view") || route.path.startsWith("/armory/edit")) {
			const armory = await getAutomationCollectionMetaData(paramId);
			if (armory) {
				if (armory.status === "private") {
					title = "Private bestiary | Bestiary Builder";
					description = "A bestiary that is unavailable to anyone but its editors.";
				}
				else {
					title = `${armory.name} | Bestiary Builder`;
					description = `${armory.automationCount} automation${armory.automationCount !== 1 ? "s" : ""} created by${armory.owner.username}.\n${armory.description?.length > 0 ? armory.description : "No description set."}`;
					image = armory.image?.length > 0 ? armory.image : null;
				}
			}
		}
		else if (route.path.startsWith("/automation/view") || route.path.startsWith("/automation/edit")) {
			const automation = await getAutomationMetaData(paramId);
			if (automation) {
				if (automation.collection.status === "private") {
					title = "Private creature | Bestiary Builder";
					description = "A creature that is unavailable to anyone but its editors.";
				}
				else {
					title = `${automation.name} | Bestiary Builder`;
					description = `From collection ${automation.collection.name} created by ${automation.collection.owner.username}.\n${automation.description?.length > 0 ? automation.description : "No description set."}`;
				}
			}
		}
	}
	// Sanitize title and description
	title = title.replace(/"/g, "&quot;").trim();
	description = description?.replace(/"/g, "&quot;").trim();

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

			if (tagDef.name.includes("image") && image)
				tagDef.content = image;
			else if (tagDef.name.includes("image") && route?.meta?.image)
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
