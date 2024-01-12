import fs from "fs";
import path from "path";
//Setup environment variables
import dotenv from "dotenv";
dotenv.config();
//Logging
import {log} from "./logger";
//Get info
export const isProduction = (process.env.NODE_ENV == "production") as boolean;
const frontendPath = path.join(__dirname, process.env.frontendPath as string);
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
				"img-src": ["https://cdn.discordapp.com", "*", "'self'", "data: 'self'"],
				"script-src": ["'self'", "'sha256-reBsRZd5I88opZSwT59Ir+QlBhrEhdRJ1aQUr4GXhyw='"],
				"style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
				"font-src": ["'self'", "data: https://fonts.gstatic.com"],
				"connect-src": ["'self'", "https://discord.com"]
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
		max: isProduction ? 100 : 1000 // limit each IP to 50/1000 requests per windowMs
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
	import("./staticData/badwordsData/" + file).then((data) => {
		badwords.add(data);
	});
}

//Function to run on all requests
app.use(async (req, res, next) => {
	log.log("request", `Request for URL "${req.url}" recieved.`);
	//Set Permissions Policy
	res.setHeader("Permissions-Policy", "fullscreen: 'self'; accelerometer: ; autoplay: ; camera: ; geolocation: 'self'; gyroscope: ; interest-cohort: ; magnetometer: ; microphone: ; payment: ; sync-xhr: ;");
	next();
});

//Setup database connection
import {startConnection} from "./database";
startConnection();

//Setup http server
import http from "http";
const httpServer = http.createServer(app);
httpServer.listen(5000, () => {
	log.info("Server listening to port 5000");
});

//Load logic
const logicPath = path.join(__dirname, "logic");
const logicFiles = fs.readdirSync(logicPath);
async function importLogic() {
	for (const file of logicFiles) {
		await import("file://" + path.join(logicPath, file));
	}
}
importLogic().then(() => {
	//Redirect everything else to frontend
	app.use("/*", express.static(frontendPath));
});

//Static files
app.use(express.static(frontendPath));

//Error handling
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
	log.log("critical", err);
	res.status(500).json({error: "An unknown error occured."});
}
app.use(errorHandler);
process.on("uncaughtException", (err) => {
	log.log("critical", "Uncaught exception" + err);
});
process.on("unhandledRejection", (err) => {
	log.log("critical", "Unhandled rejection" + err);
});
