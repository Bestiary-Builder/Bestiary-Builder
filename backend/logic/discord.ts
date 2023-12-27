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
	let supporterRole = await guild.roles.fetch("1187500073836367965");
	if (!supporterRole) {
		log.error("Failed to fetch supporter role");
		return;
	}
	//Fetch all member info
	await guild.members.fetch();
	//Find supporters
	let supporterIds = supporterRole.members.map((m) => m.id);
	//Update database
	collections.users?.updateMany({_id: {$nin: supporterIds}}, {$set: {supporter: false}});
	collections.users?.updateMany({_id: {$in: supporterIds}}, {$set: {supporter: true}});
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
