import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import nodemailer from "nodemailer";
import { PrismaClient, SupporterStatus } from "../../../shared/src/prisma-types";
import "dotenv/config";

/**
 * Run from the repository root:
 *   npm run sendmail -- <mail.txt> <mail.html> [--audience=admins|tier1|tier2|supporters|everyone] [--user-ids=ids.txt] [--offset=N] [--skip-failed] [--send]
 * Or from backend with the same arguments: npm run sendmail -- ...
 * Both npm commands run in backend, so all file paths are relative to the backend folder.
 * --user-ids=ids.txt accepts one user ID per line (blank lines and duplicates ignored).
 * It restricts the selected audience; only subscribed users with an email are eligible.
 * DATABASE_URL must be set
 * Without --send, prints the recipient count only. With --send, requires an interactive
 * confirmation of the count before contacting the local SMTP server on port 25.
 * '{{name}}' in either template is replaced with the recipient's global name.
 * --offset=N skips the first N eligible users ordered by user ID. On interruption, use
 * the reported next offset with the same audience and ID file; a changed recipient list (new users,
 * unsubscribes, tier changes) can shift positions, so an offset cannot guarantee no duplicates.
 * By default, sending stops on the first failed recipient. With --skip-failed, errors
 * are logged and sending continues; the next offset includes failed recipients, so
 * retry them separately using the logged user IDs. Failures set a nonzero exit code.
 */
async function main() {
	// Get arguments:
	const [textPath, htmlPath, ...options] = process.argv.slice(2);
	const usage = "Usage: npm run sendmail -- <mail.txt> <mail.html> [--audience=admins|tier1|tier2|supporters|everyone] [--user-ids=ids.txt] [--offset=N] [--skip-failed] [--send]";
	const audienceOptions = options.filter(option => option.startsWith("--audience="));
	const offsetOptions = options.filter(option => option.startsWith("--offset="));
	const userIdsOptions = options.filter(option => option.startsWith("--user-ids="));
	if (!textPath || !htmlPath || options.some(option => option !== "--send" && option !== "--skip-failed" && !option.startsWith("--audience=") && !option.startsWith("--offset=") && !option.startsWith("--user-ids="))
		|| options.filter(option => option === "--send").length > 1 || options.filter(option => option === "--skip-failed").length > 1
		|| audienceOptions.length > 1 || offsetOptions.length > 1 || userIdsOptions.length > 1 || userIdsOptions[0] === "--user-ids=") {
		throw new Error(usage);
	}

	// Set the audience option
	const audience = audienceOptions[0]?.slice("--audience=".length) ?? "everyone";
	if (!["admins", "tier1", "tier2", "supporters", "everyone"].includes(audience))
		throw new Error(usage);

	// Set the offset value
	const offsetValue = offsetOptions[0]?.slice("--offset=".length) ?? "0";
	const offset = Number(offsetValue);
	if (!/^(?:0|[1-9]\d*)$/.test(offsetValue) || !Number.isSafeInteger(offset))
		throw new Error(`Invalid offset: ${offsetValue}. Expected a non-negative safe integer.\n${usage}`);

	// Is sending emails enabled?
	const send = options.includes("--send");

	// Do we just skip failed emails, or stop the program?
	const skipFailed = options.includes("--skip-failed");
	const userIdsPath = userIdsOptions[0]?.slice("--user-ids=".length);

	// Get information from ENV
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString)
		throw new Error("Missing required environment variable: DATABASE_URL");
	const adminIds = process.env.ADMIN_ACCOUNTS?.split(",").map(id => id.trim()).filter(Boolean) ?? [];
	if (audience === "admins" && !adminIds.length)
		throw new Error("ADMIN_ACCOUNTS must contain at least one user ID for the admins audience.");

	// Find eligible users
	const [text, html, userIdsFile] = await Promise.all([
		readFile(textPath, "utf8"),
		readFile(htmlPath, "utf8"),
		userIdsPath ? readFile(userIdsPath, "utf8") : Promise.resolve(undefined),
	]);
	const userIds = userIdsFile === undefined ? undefined : [...new Set(userIdsFile.split(/\r?\n/).map(id => id.trim()).filter(Boolean))];
	if (userIds && !userIds.length)
		throw new Error(`No user IDs found in ${userIdsPath}.`);
	const eligibleIds = userIds
		? (audience === "admins" ? userIds.filter(id => adminIds.includes(id)) : userIds)
		: (audience === "admins" ? adminIds : undefined);
	const recipientDescription = userIdsPath ? `${audience} listed in ${userIdsPath}` : audience;
	const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
	try {
		const where = {
			unsubscribedFromEmails: false,
			email: { not: "" },
			...(eligibleIds ? { id: { in: eligibleIds } } : {}),
			...(audience === "tier1" ? { supporter: SupporterStatus.wirmling } : {}),
			...(audience === "tier2" ? { supporter: SupporterStatus.greatwyrm } : {}),
			...(audience === "supporters" ? { supporter: { in: [SupporterStatus.wirmling, SupporterStatus.greatwyrm] } } : {}),
		};
		const count = Math.max(0, (await prisma.user.count({ where })) - offset);
		console.log(`${count} eligible recipients in ${recipientDescription} after skipping ${offset}${send ? "" : " (dry run; add --send to send)"}.`);

		// If we are not actually sending emails, end here
		if (!send || count === 0)
			return;

		// Wait for user confirmation before sending emails
		if (!process.stdin.isTTY || !process.stdout.isTTY)
			throw new Error("Sending requires an interactive terminal for confirmation.");
		const readline = createInterface({ input: process.stdin, output: process.stdout });
		let answer: string;
		try {
			answer = await readline.question(`Send ${count} emails to ${recipientDescription}? Type SEND to confirm: `);
		}
		finally {
			readline.close();
		}
		if (answer.trim() !== "SEND") {
			console.log("Cancelled; no emails sent.");
			return;
		}

		// Send out the emails
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
					skip: lastId ? 0 : offset,
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
						console.error(`Failed to send to user ID ${user.id}:`, error);
						process.exitCode = 1;
						if (!skipFailed)
							throw new Error("Stopping after send failure. Use --skip-failed to continue past errors.");
					}
				}
				lastId = users[users.length - 1].id;
			}
		}
		finally {
			transporter.close();
			console.log(`${sent} sent, ${failed} failed in this run. Next --offset=${offset + sent + (skipFailed ? failed : 0)} (same audience and recipient list).`);
			if (skipFailed && failed)
				console.warn("Failed recipients were skipped by this offset; retry them separately using the logged user IDs.");
		}
	}
	finally {
		await prisma.$disconnect();
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
