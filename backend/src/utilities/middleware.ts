// Setup express settings
import type { NextFunction, Request, Response } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { app, isProduction } from "./constants";
import { log } from "./logger";

// Function to run on all requests
app.use(async (req, res, next) => {
	log.log("request", `Request for URL "${req.url}" recieved.`);
	// Set Permissions Policy
	res.setHeader("Permissions-Policy", "fullscreen=('self'), accelerometer=(), autoplay=(), camera=(), geolocation=('self'), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), payment=(), sync-xhr=()");
	// Set default body
	if (!req.body)
		req.body = {};

	next();
});
// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Cookies
app.use(cookieParser());
// Security stuff
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				"default-src": ["'self'"],
				"img-src": ["https://cdn.discordapp.com", "*", "'self'", "data: 'self'"],
				"script-src": ["'self'", "'sha256-reBsRZd5I88opZSwT59Ir+QlBhrEhdRJ1aQUr4GXhyw='", "https://analytics.bestiarybuilder.com/", "https://cdn.jsdelivr.net"],
				"style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
				"font-src": ["'self'", "data: https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
				"connect-src": ["'self'", "https://discord.com", "https://analytics.bestiarybuilder.com/", "https://cdn.jsdelivr.net", "https://api.iconify.design"],
				"worker-src": ["'self'", "blob:"]
			},
			useDefaults: true
		},
		crossOriginResourcePolicy: {
			policy: "cross-origin"
		}
	})
);
app.disable("x-powered-by");
// Rate limiting
app.use(
	rateLimit({
		windowMs: 1000, // 1 second
		max: isProduction ? 100 : 1000 // limit each IP to 100/1000 requests per windowMs
	})
);
app.set("trust proxy", "loopback");
// CORS
app.use(cors());
// Compression
app.use(compression());

// Error handling
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
	log.log("critical", err);
	if (req.path.startsWith("/api"))
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	return res.status(500).send("Internal Server Error");
}
process.on("unhandledRejection", (err, origin) => {
	log.log("critical", `Unhandled rejection: ${err}; From: ${origin} `);
});
process.on("uncaughtException", (err, origin) => {
	console.log(err, origin); // eslint-disable-line no-console
	log.log("critical", `Uncaught exception: ${err}. From: ${origin}`);
});
