import http from "node:http";
// App
import { app } from "@/src/utilities/constants";
// Setup database connection
import { startConnection } from "@/src/utilities/database";
import { getFrontendHtml } from "@/src/utilities/frontend";
import { log } from "@/src/utilities/logger";
import { errorHandler } from "@/src/utilities/middleware";

import { routes } from "~/shared";

import discord from "./logic/external/discord";

// Import logic files
import "./logic";

startConnection();

// API 404
app.get(/\/api\/.*/, (req, res) => res.status(404).json({ error: "Path not found." }));

// Get frontend html
for (const route of routes.routes) {
	if (route.path.includes(".*"))
		continue;
	app.get(route.path, async (req, res) => {
		const html = await getFrontendHtml(route, req);
		return res.send(html);
	});
}

// Everything else is 404
app.get(/.*/, async (req, res) => {
	const html = await getFrontendHtml(routes.routes.find(r => r.path === "/notfound")!, req);
	return res.send(html);
});

app.use(errorHandler);

// Start HTTP server
const httpServer = http.createServer(app);
httpServer.listen(Number.parseInt(process.env.port ?? "5000"), () => {
	log.info(`Server listening to port ${process.env.port ?? "5000"}`);
});

// Start discord bot
discord.login(process.env.discordBotToken!).catch(() => log.error("Failed to connect to discord bot"));
