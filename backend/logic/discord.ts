import { Buffer } from "node:buffer";
import discord from "discord.js";
import { isProduction } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { collections } from "@/utilities/database";
import type { User } from "~/shared";

const client = new discord.Client({
	intents: [discord.IntentsBitField.Flags.Guilds, discord.IntentsBitField.Flags.GuildMessages, discord.IntentsBitField.Flags.GuildMembers]
});
export default client;

let guild: discord.Guild | null;
const channels = {} as {
	errorLogs?: discord.TextChannel;
	publicLogs?: discord.TextChannel;
};
client.on("ready", async () => {
	log.info("Discord bot is ready");
	client.user?.setPresence({
		status: "invisible"
	});
	guild = await client.guilds.fetch("1187499852221911111");
	if (!guild)
		return;
	checkUserStatuses(guild);
	// Interval check:
	setInterval(() => {
		if (!guild)
			return;
		checkUserStatuses(guild);
	}, 60 * 60 * 1000); // Once an hour

	channels.errorLogs = (await guild.channels.fetch("1188133661208477806")) as discord.TextChannel;
	channels.publicLogs = (await guild.channels.fetch("1188139329642565722")) as discord.TextChannel;
});

if (isProduction) {
	log.on("data", (info) => {
		if (info.level === "request")
			return;
		let message = `[${info.timestamp}]-(${info.label}) ${info.level.toUpperCase()}`;
		if (log.levels[info.level] < log.levels.warning) {
			const attachment = new discord.AttachmentBuilder(Buffer.from(`${info.message}${info.stack ? `\n${info.stack}` : ""}`)).setName("error.txt");
			if (info.level === "critical")
				message += "\n||<@307900989455859723>||";
			channels.errorLogs?.send({ content: message, files: [attachment] });
			channels.errorLogs?.sendTyping();
		}
	});
}

async function checkUserStatuses(guild: discord.Guild) {
	const supporterTier1Role = await guild.roles.fetch("1187500073836367965");
	const supporterTier2Role = await guild.roles.fetch("1189343430820778055");
	if (!supporterTier1Role || !supporterTier2Role) {
		log.error("Failed to fetch supporter roles");
		return;
	}
	// Fetch all member info
	await guild.members.fetch();
	// Find supporters
	const tier1Ids = supporterTier1Role.members.map(m => m.id);
	const tier2Ids = supporterTier2Role.members.map(m => m.id);
	log.info(`Tier 1: ${tier1Ids}`);
	log.info(`Tier 2: ${tier2Ids}`);
	// Update database
	await collections.users?.updateMany({ $and: [{ _id: { $nin: tier1Ids } }, { _id: { $nin: tier2Ids } }] }, { $set: { supporter: 0 } });
	await collections.users?.updateMany({ _id: { $in: tier1Ids } }, { $set: { supporter: 1 } });
	await collections.users?.updateMany({ _id: { $in: tier2Ids } }, { $set: { supporter: 2 } });
}

// Public discord logging
export const colors = discord.Colors;
export async function publicLog(title: string, description: string, link: string, user: User, color?: discord.ColorResolvable) {
	if (!isProduction)
		return;
	const embed = new discord.EmbedBuilder()
		.setTitle(title)
		.setDescription(description)
		.setAuthor({ name: user.username, iconURL: `https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png` })
		.setColor(color ?? discord.Colors.Green)
		.setURL(link)
		.setTimestamp();
	channels.publicLogs?.send({ embeds: [embed] });
}
