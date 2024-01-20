import {spawn} from "child_process";
import {log} from "../logger";
import {app} from "../server";
import {time, timeEnd} from "console";

//Install pip modules
spawn("python", ["scripts/installPipModules.py"]);
//Script
async function runPythonScript(args: string) {
	const childProcess = spawn("python", ["scripts/python.py", args]);
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
//Run
runTest(1);
async function runTest(amount: number) {
	time("python");
	let scriptsDone = 1;
	for (let i = 0; i < amount; i++) {
		runPythonScript("" + i)
			.then((result) => {
				log.info("Succes: " + result);
				scriptsDone++;
				if (scriptsDone == amount) timeEnd("python");
			})
			.catch((error) => {
				log.error(error);
				scriptsDone++;
				if (scriptsDone == amount) timeEnd("python");
			});
	}
}
