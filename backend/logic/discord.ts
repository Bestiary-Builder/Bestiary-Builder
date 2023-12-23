import {log} from "../server";
import discord, {PresenceUpdateStatus, Status} from "discord.js";
import {collections, type User} from "../database";
const client = new discord.Client({
	intents: [discord.IntentsBitField.Flags.Guilds, discord.IntentsBitField.Flags.GuildMessages, discord.IntentsBitField.Flags.GuildMembers]
});
const token = process.env.discordBotToken ?? "";

client.on("ready", async () => {
	log.info("Discord bot is ready");
	client.user?.setPresence({
		status: "invisible"
	});
	const guild = await client.guilds.fetch("1187499852221911111");
	checkUserStatuses(guild);
	//Interval check:
	setInterval(function () {
		checkUserStatuses(guild);
	}, 60 * 60 * 1000); //Once an hour
});

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
