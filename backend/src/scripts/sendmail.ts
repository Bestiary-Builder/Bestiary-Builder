import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import nodemailer from "nodemailer";
import { PrismaClient, SupporterStatus } from "../../../shared/src/prisma-types";
import "dotenv/config";

/**
 * Run from the repository root:
 *   npm run sendmail -- <mail.txt> <mail.html> [--audience=admins|tier1|tier2|supporters|everyone] [--send]
 * Or from backend with the same arguments: npm run sendmail -- ...
 * Both npm commands run in backend, so template paths are relative to the backend folder.
 * DATABASE_URL must be set
 * Without --send, prints the recipient count only. With --send, requires an interactive
 * confirmation of the count before contacting the local SMTP server on port 25.
 * '{{name}}' in either template is replaced with the recipient's global name.
 */
async function main() {
	const [textPath, htmlPath, ...options] = process.argv.slice(2);
	const usage = "Usage: npm run sendmail -- <mail.txt> <mail.html> [--audience=admins|tier1|tier2|supporters|everyone] [--send]";
	const audienceOptions = options.filter(option => option.startsWith("--audience="));
	if (!textPath || !htmlPath || options.some(option => option !== "--send" && !option.startsWith("--audience="))
		|| options.filter(option => option === "--send").length > 1 || audienceOptions.length > 1) {
		throw new Error(usage);
	}

	const audience = audienceOptions[0]?.slice("--audience=".length) ?? "everyone";
	if (!["admins", "tier1", "tier2", "supporters", "everyone"].includes(audience))
		throw new Error(usage);
	const send = options.includes("--send");

	const connectionString = process.env.DATABASE_URL;
	if (!connectionString)
		throw new Error("Missing required environment variable: DATABASE_URL");

	const adminIds = process.env.ADMIN_ACCOUNTS?.split(",").map(id => id.trim()).filter(Boolean) ?? [];
	if (audience === "admins" && !adminIds.length)
		throw new Error("ADMIN_ACCOUNTS must contain at least one user ID for the admins audience.");

	const [text, html] = await Promise.all([readFile(textPath, "utf8"), readFile(htmlPath, "utf8")]);
	const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
	try {
		const where = {
			unsubscribedFromEmails: false,
			email: { not: "" },
			...(audience === "admins" ? { id: { in: adminIds } } : {}),
			...(audience === "tier1" ? { supporter: SupporterStatus.wirmling } : {}),
			...(audience === "tier2" ? { supporter: SupporterStatus.greatwyrm } : {}),
			...(audience === "supporters" ? { supporter: { in: [SupporterStatus.wirmling, SupporterStatus.greatwyrm] } } : {}),
		};
		const count = await prisma.user.count({ where });
		console.log(`${count} eligible recipients in ${audience}${send ? "" : " (dry run; add --send to send)"}.`);
		if (!send || count === 0)
			return;

		if (!process.stdin.isTTY || !process.stdout.isTTY)
			throw new Error("Sending requires an interactive terminal for confirmation.");
		const readline = createInterface({ input: process.stdin, output: process.stdout });
		let answer: string;
		try {
			answer = await readline.question(`Send ${count} emails to ${audience}? Type SEND to confirm: `);
		}
		finally {
			readline.close();
		}
		if (answer.trim() !== "SEND") {
			console.log("Cancelled; no emails sent.");
			return;
		}

		const transporter = nodemailer.createTransport({
			host: "localhost",
			port: 25,
			secure: false,
			tls: { rejectUnauthorized: false }, // Match the existing local SMTP relay configuration.
		});
		let sent = 0;
		let failed = 0;
		let lastId: string | undefined;
		try {
			while (true) {
				const users = await prisma.user.findMany({
					where: { ...where, ...(lastId ? { AND: [{ id: { gt: lastId } }] } : {}) },
					orderBy: { id: "asc" },
					take: 100,
					select: { id: true, globalName: true, email: true },
				});
				if (!users.length)
					break;

				for (const user of users) {
					try {
						await transporter.sendMail({
							from: "\"Bestiary Builder\" <no-reply@bestiarybuilder.com>",
							to: { name: user.globalName, address: user.email },
							subject: "Bestiary Builder Announcement!",
							text: text.replaceAll("{{name}}", user.globalName),
							html: html.replaceAll("{{name}}", user.globalName),
						});
						sent++;
						console.log(`Message sent to ${user.email}`);
					}
					catch (error) {
						failed++;
						console.error(`Failed to send to ${user.email}:`, error);
					}
				}
				lastId = users[users.length - 1].id;
			}
		}
		finally {
			transporter.close();
		}
		console.log(`Finished: ${sent} sent, ${failed} failed.`);
		if (failed)
			process.exitCode = 1;
	}
	finally {
		await prisma.$disconnect();
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
