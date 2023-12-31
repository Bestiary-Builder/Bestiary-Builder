import {isProduction} from "./server";
import winston from "winston";
import fs from "fs";

//Format
const format = winston.format.printf((info) => {
	return `[${info.timestamp}]-(${info.label}) ${info.level} > ${info.message}${info.stack ? "\n" + info.stack : ""}`;
});
//Levels
const winstonLevels = {
	levels: {
		critical: 0,
		error: 1,
		warning: 2,
		info: 3,
		database: 4,
		request: 5
	},
	colors: {
		critical: "red",
		error: "red",
		warning: "yellow",
		info: "white",
		database: "blue",
		request: "grey"
	}
};
winston.addColors(winstonLevels.colors);
//Logger
export const log = winston.createLogger({
	levels: winstonLevels.levels,
	format: winston.format.combine(
		winston.format.json(),
		winston.format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss"
		}),
		winston.format.errors({stack: true}),
		winston.format.label({label: "Bestiary Builder"})
	),
	transports: [
		new winston.transports.Console({
			level: "database",
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
setTimeout(() => {
	//Save to file in production
	if (isProduction) {
		//Save old files
		if (fs.existsSync("logs/combined.log")) {
			let date = new Date();
			let dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getUTCHours()}.${date.getUTCMinutes()}.${date.getUTCSeconds()}`;
			fs.renameSync("logs/combined.log", "logs/combined_old_" + dateString + ".log");
			fs.renameSync("logs/error.log", "logs/error_old_" + dateString + ".log");
		}
		//Add new transports
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
});
