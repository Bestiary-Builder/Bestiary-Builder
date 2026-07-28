import http from "node:http";
// App
import { app } from "@/utilities/constants";
// Setup database connection
import { startConnection } from "@/utilities/database";
import { getFrontendHtml } from "@/utilities/frontend";
import { log } from "@/utilities/logger";
import { errorHandler } from "@/utilities/middleware";

// Import frontend stuff
import { routes } from "~/shared";

// Logging
import discord from "./logic/discord";

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
