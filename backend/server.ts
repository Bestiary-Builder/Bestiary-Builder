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
//Setup express settings
import express, {NextFunction, Request, Response} from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
//Create express app
export const app = express();

//Function to run on all requests
app.use(async (req, res, next) => {
	log.log("request", `Request for URL "${req.url}" recieved.`);
	//Set Permissions Policy
	res.setHeader("Permissions-Policy", "fullscreen=('self'), accelerometer=(), autoplay=(), camera=(), geolocation=('self'), gyroscope=(), interest-cohort=(), magnetometer=(), microphone=(), payment=(), sync-xhr=()");
	next();
});
//Body parsing
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));
//Cookies
app.use(cookieParser());
//Security stuff
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				"default-src": ["'self'"],
				"img-src": ["https://cdn.discordapp.com", "*", "'self'", "data: 'self'"],
				"script-src": ["'self'", "'sha256-reBsRZd5I88opZSwT59Ir+QlBhrEhdRJ1aQUr4GXhyw='", "https://www.googletagmanager.com"],
				"style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
				"font-src": ["'self'", "data: https://fonts.gstatic.com"],
				"connect-src": ["'self'", "https://discord.com", "*.google-analytics.com"]
			},
			useDefaults: true
		},
		crossOriginResourcePolicy: {
			policy: "cross-origin"
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

//Setup database connection
import {getBestiary, getCreature, getUser, startConnection} from "./database";
startConnection();

//Setup http server
import http from "http";
const httpServer = http.createServer(app);
httpServer.listen(5000, () => {
	log.info("Server listening to port 5000");
});

//Load frontend
import {routes, defaultMetaTags, Route} from "./routes";
import {ObjectId} from "mongodb";
async function getFrontendHtml(route: Route, req: Request) {
	//Get information
	let title = "Bestiary Builder";
	if (route.name) title = route.name + " | Bestiary Builder";
	let description = route.meta.description;
	if (route.meta.dynamic) {
		switch (route.path) {
			case "/bestiary-viewer/:id":
				let bId = req.params.id;
				if (bId.length == 24) {
					let bestiary = await getBestiary(new ObjectId(bId));
					if (bestiary) {
						if (bestiary.status == "private") {
							title = "Private bestiary | Bestiary Builder";
							description = "A bestiary that is unavailable to anyone but its editors.";
						} else {
							title = bestiary.name + " | Bestiary Builder";
							let desc = bestiary.description ?? "No description set.";
							let owner = await getUser(bestiary.owner);
							desc += `\n${bestiary.creatures.length} creature${bestiary.creatures.length > 1 ? "s" : ""}${owner ? ` created by ${owner.username}` : ""}.`;
							description = desc;
						}
					}
				}
				break;
			// case "/statblock-editor/:id":
			// 	let sId = req.params.id;
			// 	if (sId.length == 24) {
			// 		let creature = await getCreature(new ObjectId(sId));
			// 		if (creature) {
			// 			title = `${creature.stats.description.name.substring(0, 16)} | Bestiary Builder`;
			// 			if (creature.stats.description.description) description = creature.stats.description.description;
			// 		}
			// 	}
			// 	break;
			default:
				break;
		}
	}
	//Get index.html
	let html = null;
	const filePath = path.join(frontendPath, "index.html");
	html = fs.readFileSync(filePath, {encoding: "utf-8"});
	//Create metatags
	let metatags = [
		`<title>${title}</title>`,
		...defaultMetaTags.map((tagInfo) => {
			let tagDef = {...tagInfo};
			//Change content of tag:
			if (tagDef.name.includes("title") || tagDef.name.includes("name")) tagDef.content = title;
			if (tagDef.name.includes("description") && description) tagDef.content = description;
			if (tagDef.name.includes("image") && route.meta.image) tagDef.content = route.meta.image;
			if (tagDef.name.includes("keywords") && route.meta.keywords) tagDef.content = route.meta.keywords;
			//Return new tag
			return `<meta ${tagDef.type}="${tagDef.name}" content="${tagDef.content}">`;
		})
	];
	//Return index.html with tags
	return html.replace("<!-- meta tags -->", metatags.join("\n		"));
}
for (let route of routes) {
	app.get(route.path, async (req, res) => {
		try {
			let html = await getFrontendHtml(route, req);
			if (html) return res.send(html);
		} catch (err) {
			log.error(err);
			res.status(500).send("Internal Server Error");
		}
	});
}
//Static frontend files
app.use(express.static(frontendPath));

//Logic files
const logicPath = path.join(__dirname, "logic");
const logicFiles = fs.readdirSync(logicPath);
async function importLogic() {
	for (const file of logicFiles) {
		await import((isProduction ? "" : "file://") + path.join(logicPath, file));
	}
}
importLogic().then(() => {
	//Everything else is 404
	app.get("/api/*", (req, res) => res.status(404).json({error: "Path not found."}));
	app.get("/*", async (req, res) => {
		try {
			let html = await getFrontendHtml(routes.find((r) => r.path == "/notfound")!, req);
			return res.send(html);
		} catch (err) {
			log.error(err);
			return res.status(500).send("Internal Server Error");
		}
	});
});

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
