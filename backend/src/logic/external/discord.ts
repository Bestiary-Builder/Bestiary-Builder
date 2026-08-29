import type { User } from "~/shared";
import { Buffer } from "node:buffer";
import discord from "discord.js";
import { app, isProduction } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { possibleUser } from "../main/login";

const client = new discord.Client({
	intents: [discord.IntentsBitField.Flags.Guilds, discord.IntentsBitField.Flags.GuildMessages, discord.IntentsBitField.Flags.GuildMembers]
});
export default client;

const channels = {} as {
	errorLogs?: discord.TextChannel;
	publicLogs?: discord.TextChannel;
	privateFeedback?: discord.TextChannel;
};
client.on("clientReady", async () => {
	log.info("Discord bot is ready");
	client.user?.setPresence({
		status: "invisible"
	});
	const guild = await client.guilds.fetch("1187499852221911111");
	if (!guild)
		return;

	channels.errorLogs = (await guild.channels.fetch("1188133661208477806")) as discord.TextChannel;
	channels.publicLogs = (await guild.channels.fetch("1188139329642565722")) as discord.TextChannel;
	channels.privateFeedback = (await guild.channels.fetch("1543368742736760942")) as discord.TextChannel;
});

if (isProduction) {
	log.on("data", (info) => {
		if (info.level === "request")
			return;
		let message = `[${info.timestamp}] ${info.level.toUpperCase()}`;
		if (log.levels[info.level] < log.levels.warning) {
			const attachment = new discord.AttachmentBuilder(Buffer.from(`${info.message}${info.stack ? `\n${info.stack}` : ""}`)).setName("error.txt");
			if (info.level === "critical")
				message += "\n||<@307900989455859723>||";
			channels.errorLogs?.send({ content: message, files: [attachment] });
			channels.errorLogs?.sendTyping();
		}
	});
}

// Public discord logging
export const colors = discord.Colors;
export async function publicLog(title: string, description: string, link: string, user: User, color?: discord.ColorResolvable) {
	if (!isProduction)
		return;
	const embed = new discord.EmbedBuilder()
		.setTitle(title)
		.setDescription(description)
		.setAuthor({ name: user.username, iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` })
		.setColor(color ?? discord.Colors.Green)
		.setURL(link)
		.setTimestamp();
	channels.publicLogs?.send({ embeds: [embed] });
}

// Feedback form
app.post("/api/feedback", possibleUser, async (req, res) => {
	// Get message from request body
	const { message, type } = req.body.data as { message?: string; type?: "idea" | "issue" };
	if (!message || !type)
		return res.status(400).json({ error: "Message and feedback type are both required" });

	if (type !== "issue" && type !== "idea")
		return res.status(400).json({ error: "Invalid feedback type" });

	// Get user from request
	const user = req.user;

	// Send feedback to private feedback channel
	if (!channels.privateFeedback)
		return res.status(500).json({ error: "Feedback channel not found" });

	channels.privateFeedback.send({
		embeds: [
			new discord.EmbedBuilder()
				.setAuthor(user ? { name: user.username, iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` } : { name: "Anonymous" })
				.setTitle(type === "idea" ? "Idea" : "Issue")
				.setDescription(message)
				.setTimestamp()
		]
	});

	res.status(200).json({ message: "Feedback submitted" });
});
