import {spawn} from "child_process";
import {log} from "../logger";
import {app} from "../server";
import {time, timeEnd} from "console";
import fetch from "node-fetch";

//Install pip modules
spawn("python3", ["scripts/installPipModules.py"]);
//Script
async function runPythonScript(args: string) {
	const childProcess = spawn("python3", ["scripts/python.py", args]);
	childProcess.stdout.setEncoding("utf-8");
	childProcess.stderr.setEncoding("utf-8");
	let output: string | null;
	return new Promise<string | null>((resolve, reject) => {
		childProcess.stdout.on("data", (data: string) => {
			output = data.trim();
		});
		childProcess.stderr.on("data", (data: string) => {
			log.error("Python:" + data.trim());
			childProcess.kill();
			reject(data.trim());
		});
		childProcess.on("exit", () => {
			resolve(output);
		});
	});
}

app.post("/api/validate/automation", async (req, res) => {
	let automation = req.body.data;
	let result = await runPythonScript(JSON.stringify(automation));
	console.log("Result", result);
	if (result == "") return res.status(200).json({valid: true, error: null});
	else return res.status(400).json({valid: false, error: result});
});

//Temporary test fetch
fetch("http://localhost:5000/api/validate/automation", {
	method: "POST",
	headers: {
		"Content-Type": "application/json"
	},
	body: JSON.stringify({
		data: [
			{type: "target", target: "each", effects: [{type: "attack", hit: [{type: "damage", damage: "1d6 + 2 [slashing]", overheal: false}], miss: [], attackBonus: "4"}]},
			{type: "text", text: "*Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 5 (1d6 + 2) slashing damage.", title: "Effect"}
		]
	})
})
	.then((response) => response.json())
	.then((data) => {
		console.log("data", data);
	});
