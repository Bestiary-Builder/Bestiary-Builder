import dns from "node:dns";
import net from "node:net";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { Agent, fetch } from "undici";
import { app, isProduction } from "@/utilities/constants";

const ALLOWED_ORIGINS = (process.env.PROXY_ALLOWED_ORIGINS ?? "https://bestiarybuilder.com,https://stage.bestiarybuilder.com,http://localhost:5173").split(",");
// eslint-disable-next-line regexp/no-unused-capturing-group
const ALLOWED_TYPES = /^(image\/|font\/|text\/css|application\/(font|x-font|octet-stream))/;
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10_000;

// --- SSRF protection ---------------------------------------------------
const blocked4 = new net.BlockList();
[
	["0.0.0.0", 8],
	["10.0.0.0", 8],
	["100.64.0.0", 10],
	["127.0.0.0", 8],
	["169.254.0.0", 16],
	["172.16.0.0", 12],
	["192.0.0.0", 24],
	["192.168.0.0", 16],
	["198.18.0.0", 15],
	["224.0.0.0", 4],
	["240.0.0.0", 4],
].forEach(([addr, prefix]) => blocked4.addSubnet(addr as string, prefix as number, "ipv4"));

const blocked6 = new net.BlockList();
[
	["::", 128],
	["::1", 128],
	["fc00::", 7],
	["fe80::", 10],
	["ff00::", 8],
].forEach(([addr, prefix]) => blocked6.addSubnet(addr as string, prefix as number, "ipv6"));

const isBlockedIp = (address: string): boolean => {
	const family = net.isIP(address);
	if (family === 0)
		return true; // fail closed

	if (family === 4)
		return blocked4.check(address, "ipv4");

	const lower = address.toLowerCase();

	// IPv4-mapped IPv6, dotted form: ::ffff:127.0.0.1
	const dotted = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
	if (dotted)
		return isBlockedIp(dotted[1]);

	// IPv4-mapped IPv6, hex form: ::ffff:7f00:1
	const hex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
	if (hex) {
		const hi = Number.parseInt(hex[1], 16);
		const lo = Number.parseInt(hex[2], 16);
		return isBlockedIp(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
	}

	return blocked6.check(address, "ipv6");
};

// Checks the IP actually being connected to, which defeats DNS rebinding
const agent = new Agent({
	connect: {
		lookup: (hostname: string, options: any, callback: any) => {
			dns.lookup(hostname, options, (err, address, family) => {
				if (err)
					return callback(err, address, family);
				const list = Array.isArray(address) ? address : [{ address, family }];
				if (list.some((a: any) => isBlockedIp(a.address)))
					return callback(new Error("Blocked address"), address, family);
				callback(null, address, family);
			});
		},
	},
});

// IP-literal hosts skip DNS lookup entirely, so check them up front
const isSafeUrl = (url: URL) => {
	if (!["http:", "https:"].includes(url.protocol))
		return false;
	const host = url.hostname.replace(/^\[|\]$/g, "");
	return net.isIP(host) === 0 || !isBlockedIp(host);
};

// --- helpers -----------------------------------------------------------
const parseTarget = (query: unknown): URL | null => {
	if (typeof query !== "string")
		return null;
	try {
		const url = new URL(query);
		return isSafeUrl(url) ? url : null;
	}
	catch {
		return null;
	}
};

const fetchFollowing = async (start: URL) => {
	let url = start;
	for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
		const res = await fetch(url, {
			dispatcher: agent,
			redirect: "manual", // re-validate every hop ourselves
			signal: AbortSignal.timeout(TIMEOUT_MS),
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; BestiaryBuilder/1.0)",
				"Accept": "image/*,*/*;q=0.8",
			},
		});
		const location = res.headers.get("location");
		if (res.status >= 300 && res.status < 400 && location) {
			url = new URL(location, url);
			if (!isSafeUrl(url))
				throw new Error("Blocked redirect");
			continue;
		}
		return res;
	}
	throw new Error("Too many redirects");
};

const limitBytes = (max: number) => {
	let seen = 0;
	return new Transform({
		transform(chunk, _enc, cb) {
			seen += chunk.length;
			if (seen > max)
				return cb(new Error("Response too large"));
			cb(null, chunk);
		},
	});
};

// --- router ------------------------------------------------------------
export const proxyRouter = Router();

proxyRouter.use(rateLimit({ windowMs: 1000, max: isProduction ? 100 : 1000 }));

proxyRouter.use((req, res, next) => {
	const origin = req.headers.origin;
	const site = req.headers["sec-fetch-site"];
	const allowed = origin
		? ALLOWED_ORIGINS.includes(origin)
		: site === "same-origin";
	if (!allowed)
		return res.status(403).send("Forbidden");
	next();
});

proxyRouter.get("/", async (req, res) => {
	const target = parseTarget(req.query.url);
	if (!target)
		return res.status(400).send("Bad URL");

	try {
		const upstream = await fetchFollowing(target);
		const type = upstream.headers.get("content-type") ?? "";
		const length = Number(upstream.headers.get("content-length") ?? 0);

		if (!upstream.ok || !upstream.body || !ALLOWED_TYPES.test(type) || length > MAX_BYTES) {
			await upstream.body?.cancel();
			return res.status(502).send("Upstream rejected");
		}
		res.set({
			"Content-Type": type,
			"Cache-Control": "public, max-age=86400",
			"X-Content-Type-Options": "nosniff",
			"Content-Security-Policy": "sandbox; default-src 'none'",
		});
		await pipeline(Readable.fromWeb(upstream.body as any), limitBytes(MAX_BYTES), res);
	}
	catch (e) {
		if (!res.headersSent)
			res.status(502).send("Proxy error");
		else
			res.destroy();
	}
});

app.use("/api/proxy", proxyRouter);
