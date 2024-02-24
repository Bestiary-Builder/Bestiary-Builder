import {log} from "./logger";

//Express app
import express from "express";
export const app = express();

//Is production
export const isProduction = (process.env.NODE_ENV == "production") as boolean;

//Bad-words filter
import fs from "fs";
import path from "path";
import BadWordsNext from "bad-words-next";
export const badwords = new BadWordsNext({placeholder: ""});
const badwordsPath = path.resolve("./" + (isProduction ? "build/" : "") + "staticData/badwordsData") + "/";
let dataFiles = fs.readdirSync(badwordsPath);
for (let file of dataFiles) {
	import((isProduction ? "" : "file:") + badwordsPath + file).then((data) => {
		badwords.add(data);
	});
}

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
