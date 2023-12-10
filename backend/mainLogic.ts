import {app} from "./server";
import path from "path";
import fs from "fs";
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
