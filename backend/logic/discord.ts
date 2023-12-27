import {log, isProduction} from "../server";
import discord, {PresenceUpdateStatus, Status} from "discord.js";
import {collections, getUser, type User} from "../database";
const client = new discord.Client({
	intents: [discord.IntentsBitField.Flags.Guilds, discord.IntentsBitField.Flags.GuildMessages, discord.IntentsBitField.Flags.GuildMembers]
});
const token = process.env.discordBotToken ?? "";

let guild: discord.Guild | null;
let channels = {} as {
	combinedLogs?: discord.TextBasedChannel;
	errorLogs?: discord.TextBasedChannel;
	publicLogs?: discord.TextBasedChannel;
};
client.on("ready", async () => {
	log.info("Discord bot is ready");
	client.user?.setPresence({
		status: "invisible"
	});
	guild = await client.guilds.fetch("1187499852221911111");
	if (!guild) return;
	checkUserStatuses(guild);
	//Interval check:
	setInterval(function () {
		if (!guild) return;
		checkUserStatuses(guild);
	}, 60 * 60 * 1000); //Once an hour

	channels.combinedLogs = (await guild.channels.fetch("1188124583975460954")) as discord.TextBasedChannel;
	channels.errorLogs = (await guild.channels.fetch("1188133661208477806")) as discord.TextBasedChannel;
	channels.publicLogs = (await guild.channels.fetch("1188139329642565722")) as discord.TextBasedChannel;
});

if (isProduction) {
	log.on("data", (info) => {
		if (info.level == "request") return;
		let message = `[${info.timestamp}]-(${info.label}) ${info.level.toUpperCase()} > ${info.message}${info.stack ? "\n" + info.stack : ""}`;
		channels.combinedLogs?.send(message);
		channels.combinedLogs?.sendTyping();
		if (info.level == "error" || info.level == "warn") {
			channels.errorLogs?.send(message);
			channels.errorLogs?.sendTyping();
		}
	});
}

client.login(token).catch(() => log.error("Failed to connect to discord bot"));

async function checkUserStatuses(guild: discord.Guild) {
	let supporterTier1Role = await guild.roles.fetch("1187500073836367965");
	let supporterTier2Role = await guild.roles.fetch("1189343430820778055");
	if (!supporterTier1Role || !supporterTier2Role) {
		log.error("Failed to fetch supporter role");
		return;
	}
	//Fetch all member info
	await guild.members.fetch();
	//Find supporters
	let tier1Ids = supporterTier1Role.members.map((m) => m.id);
	let tier2Ids = supporterTier2Role.members.map((m) => m.id);
	log.info("Tier 1: " + tier1Ids);
	log.info("Tier 2: " + tier2Ids);
	//Update database
	collections.users?.updateMany({$and: [{_id: {$nin: tier1Ids}}, {_id: {$nin: tier2Ids}}]}, {$set: {supporter: 0}});
	collections.users?.updateMany({_id: {$in: tier1Ids}}, {$set: {supporter: 1}});
	collections.users?.updateMany({_id: {$in: tier2Ids}}, {$set: {supporter: 2}});
}

//Public discord logging
export const colors = discord.Colors;
export async function publicLog(title: string, description: string, link: string, user: User, color?: discord.ColorResolvable) {
	if (!isProduction) return;
	let embed = new discord.EmbedBuilder()
		.setTitle(title)
		.setDescription(description)
		.setAuthor({name: user.username, iconURL: "https://cdn.discordapp.com/avatars/" + user._id + "/" + user.avatar + ".png"})
		.setColor(color ?? discord.Colors.Green)
		.setURL(link)
		.setTimestamp();
	channels.publicLogs?.send({embeds: [embed]});
}
