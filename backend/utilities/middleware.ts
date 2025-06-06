// Setup express settings
import type { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { log } from "./logger";
import { app, isProduction } from "./constants";

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
				"script-src": ["'self'", "'sha256-reBsRZd5I88opZSwT59Ir+QlBhrEhdRJ1aQUr4GXhyw='", "https://www.googletagmanager.com", "https://cdn.jsdelivr.net"],
				"style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
				"font-src": ["'self'", "data: https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
				"connect-src": ["'self'", "https://discord.com", "*.google-analytics.com", "https://cdn.jsdelivr.net"],
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
		max: isProduction ? 100 : 1000 // limit each IP to 50/1000 requests per windowMs
	})
);
app.set("trust proxy", "loopback");
// CORS
app.use(cors());
// Compression
app.use(compression());

// Error handling
function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
	log.log("critical", err);
	res.status(500).json({ error: "An unknown error occured." });
}
app.use(errorHandler);
process.on("uncaughtException", (err) => {
	log.log("critical", `Uncaught exception: ${err}`);
});
process.on("unhandledRejection", (err) => {
	log.log("critical", `Unhandled rejection: ${err}`);
});
