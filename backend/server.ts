import fs from "fs";
import path from "path";
//Setup environment variables
import dotenv from "dotenv";
dotenv.config();
//Get info
const isProduction = (process.env.NODE_ENV == "production") as boolean;
const frontendPath = path.join(__dirname, process.env.frontendPath as string);

//Setup logging
import winston from "winston";
const format = winston.format.printf(({level, message, timestamp, label}) => {
	return `[${timestamp}]-(${label}) ${level} > ${message}`;
});
const winstonLevels = {
	levels: {
		error: 0,
		warning: 1,
		info: 2,
		request: 3
	},
	colors: {
		error: "red",
		warning: "yellow",
		info: "white",
		request: "grey"
	}
};
winston.addColors(winstonLevels.colors);
export const log = winston.createLogger({
	levels: winstonLevels.levels,
	format: winston.format.combine(
		winston.format.json(),
		winston.format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss"
		}),
		winston.format.label({label: "Bestiary Builder"})
	),
	transports: [
		new winston.transports.Console({
			level: "info",
			format: winston.format.combine(
				winston.format((info) => {
					info.level = info.level.toUpperCase();
					return info;
				})(),
				winston.format.timestamp({
					format: "DD-MM-YYYY HH:mm:ss"
				}),
				winston.format.label({label: "Bestiary Builder"}),
				winston.format.colorize({all: true}),
				format
			)
		})
	]
});
if (isProduction) {
	log.add(
		new winston.transports.File({
			level: "request",
			filename: "logs/combined.log",
			format: log.format
		})
	);
	log.add(
		new winston.transports.File({
			level: "error",
			filename: "logs/error.log",
			format: log.format
		})
	);
}
log.error("Test");

//Setup express server with settings
import express, {NextFunction, Request, Response} from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
export const app = express();
//Body parsing
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({limit: "2mb"}));
//Cookies
app.use(cookieParser());
//Security stuff
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				"default-src": ["'self'"],
				"img-src": ["cdn.discordapp.com", "*", "'self'", "data: 'self'"],
				"script-src": ["'self'", "'sha256-reBsRZd5I88opZSwT59Ir+QlBhrEhdRJ1aQUr4GXhyw='"],
				"style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
				"font-src": ["'self'", "data: fonts.gstatic.com"],
				"connect-src": ["'self'", "discord.com"]
			},
			useDefaults: true
		}
	})
);
app.disable("x-powered-by");
//Rate limiting
app.use(
	rateLimit({
		windowMs: 1000, // 1 second
		max: !isProduction ? 50 : 1000 // limit each IP to 50/1000 requests per windowMs
	})
);
//CORS
app.use(cors());
//Compression
app.use(compression());

//Secrets:
import crypto from "crypto";
export function generateUserSecret(): string {
	return crypto.randomBytes(64).toString("hex");
}
export const JWTKey = getJWTKey();
function getJWTKey() {
	if (!fs.existsSync(".jwtkey")) {
		log.info("Generating new JWT key");
		let newKey = crypto.randomBytes(128).toString("hex");
		fs.writeFileSync(".jwtkey", newKey);
	}
	return fs.readFileSync(".jwtkey").toString("hex");
}

//Bad-words filter
import BadWordsNext from "bad-words-next";
export const badwords = new BadWordsNext({placeholder: ""});
let dataFiles = fs.readdirSync("./staticData/badwordsData/");
for (let file of dataFiles) {
	///log.info("Loading bad words data file: ", file);
	let data = require("./staticData/badwordsData/" + file);
	badwords.add(data);
}

//Function to run on all requests
app.use(async (req, res, next) => {
	log.log("request", `Request for URL "${req.url}" recieved.`);
	//Set Permissions Policy
	res.setHeader("Permissions-Polict", "fullscreen: 'self'; accelerometer: ; autoplay: ; camera: ; geolocation: 'self'; gyroscope: ; interest-cohort: ; magnetometer: ; microphone: ; payment: ; sync-xhr: ;");
	//Redirect http to https
	if (isProduction) {
		if (!req.secure) {
			return res.redirect("https://" + req.headers.host + req.url);
		}
	}
	next();
});

//Setup database connection
import {startConnection} from "./database";
startConnection();

//Setup http server
import http from "http";
const httpServer = http.createServer(app);
httpServer.listen(isProduction ? 80 : 5000, () => {
	log.info("Server listening to port 80 (HTTP)");
});

//Setup https server
import https from "https";
if (isProduction) {
	//Certificate
	const privateKey = fs.readFileSync("/etc/letsencrypt/live/bestiary.stevnbak.dk/privkey.pem", "utf8");
	const certificate = fs.readFileSync("/etc/letsencrypt/live/bestiary.stevnbak.dk/cert.pem", "utf8");
	const ca = fs.readFileSync("/etc/letsencrypt/live/bestiary.stevnbak.dk/chain.pem", "utf8");
	const credentials = {
		key: privateKey,
		cert: certificate,
		ca: ca
	};

	//Start server
	const httpsServer = https.createServer(credentials, app);
	httpsServer.listen(443, () => {
		log.info("Server listening to port 443 (HTTPS)");
	});
}

//Load logic
const logicPath = path.join(__dirname, "logic");
const logicFiles = fs.readdirSync(logicPath);
for (const file of logicFiles) {
	if (fs.lstatSync(path.join(logicPath, file)).isDirectory()) {
		if (fs.existsSync(path.join(logicPath, file, "main.ts"))) {
			require(path.join(logicPath, file, "main.ts"));
		}
	} else {
		require(path.join(logicPath, file));
	}
}

//Static files
app.use(express.static(frontendPath));
//Redirect everything else to dist
app.use("/*", express.static(frontendPath));

//Error handling
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
	log.error(err);
	res.status(500).json({error: "An unknown error occured."});
}
app.use(errorHandler);
process.on("uncaughtException", (err) => {
	log.error("Uncaught exception", err);
});

process.on("unhandledRejection", (err) => {
	log.error("unhandled rejection", err);
});
