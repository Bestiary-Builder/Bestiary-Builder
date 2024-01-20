import {spawn} from "child_process";
import {log} from "../logger";
import {time, timeEnd} from "console";

time("python");
runPythonScript("").then((result) => {
	log.info("Succes: " + result);
	timeEnd("python");
});

async function runPythonScript(args: string) {
	const childProcess = spawn("python3", ["scripts/python.py", args]);
	childProcess.stdout.setEncoding("utf-8");
	childProcess.stderr.setEncoding("utf-8");
	let output: string | null;
	return new Promise<string | null>((resolve, reject) => {
		childProcess.stdout.on("data", (data) => {
			output = data;
		});
		childProcess.stderr.on("data", (data) => {
			log.error("Python:" + data);
			reject(data);
			childProcess.kill();
		});
		childProcess.on("exit", () => {
			resolve(output);
		});
	});
}
