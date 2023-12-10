console.log("Server!");
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
//Debug vs production settings
dotenv.config();
const enableHttps = (process.env.enableHttps == "true") as boolean;
const frontendPath = path.join(__dirname, process.env.frontendPath as string);

import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";

//Setup express server with settings
export const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(helmet());
app.use(
	rateLimit({
		windowMs: 1000, // 1 second
		max: 100 // limit each IP to 100 requests per windowMs
	})
);
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(compression());

//Function to run on all requests
app.use(function (req, res, next) {
	//Set Content Security Policy (CSP)
	res.setHeader("Content-Security-Policy", "default-src 'self';" + "img-src 'self' data: 'self';" + "script-src 'self' 'sha256-reBsRZd5I88opZSwT59Ir+QlBhrEhdRJ1aQUr4GXhyw=';" + "style-src 'self' 'unsafe-inline' fonts.googleapis.com;" + "font-src 'self' data: fonts.gstatic.com;" + "connect-src 'self' discord.com;");
	//Redirect http to https
	if (enableHttps) {
		if (!req.secure) {
			return res.redirect("https://" + req.headers.host + req.url);
		}
	}
	next();
});

//Setup http server
import http from "http";
const httpServer = http.createServer(app);
httpServer.listen(5000, () => {
	console.log("Server listening to port 80 (HTTP)");
});

//Setup https server
import https from "https";
if (enableHttps) {
	//Certificate
	const privateKey = fs.readFileSync("/etc/letsencrypt/live/games.thecyclefrontier.wiki/privkey.pem", "utf8");
	const certificate = fs.readFileSync("/etc/letsencrypt/live/games.thecyclefrontier.wiki/cert.pem", "utf8");
	const ca = fs.readFileSync("/etc/letsencrypt/live/games.thecyclefrontier.wiki/chain.pem", "utf8");
	const credentials = {
		key: privateKey,
		cert: certificate,
		ca: ca
	};

	//Start server
	const httpsServer = https.createServer(credentials, app);
	httpsServer.listen(443, () => {
		console.log("Server listening to port 443 (HTTPS)");
	});
}

//Load logic
require("./mainLogic");

//Static files
app.use(express.static(frontendPath));
//Redirect everything else to dist
app.use("/*", express.static(frontendPath));
