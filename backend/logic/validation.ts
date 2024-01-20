import {log} from "../logger";
import {app} from "../server";
import fetch from "node-fetch";

app.post("/api/validate/automation", async (req, res) => {
	let automation = req.body.data;
	let result = await fetch("https://api.avrae.io/characters/attacks/validate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(automation.automation)
	}).then((response) => response.json());
	return res.json(result);
});

//Temporary test fetch
fetch("http://localhost:5000/api/validate/automation", {
	method: "POST",
	headers: {
		"Content-Type": "application/json"
	},
	body: JSON.stringify({
		data: {
			name: "Basic Attack",
			description: "",
			automation: {
				name: "Basic Attack",
				automation: [
					{type: "target", target: "each", effects: [{type: "attack", hit: [{type: "damage", damage: "1d6 + 2 [slashing]", overheal: false}], miss: [], attackBonus: "4"}]},
					{type: "text", text: "*Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 5 (1d6 + 2) slashing damage.", title: "Effect"}
				],
				_v: 2
			}
		}
	})
})
	.then((response) => response.json())
	.then((data) => {
		console.log("data", data);
	});
