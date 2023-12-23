import {app} from "../server";
import fetch from "node-fetch";

app.get("/api/critterdb/:params", async (req, res) => {
	fetch("https://critterdb.com/api/" + req.params.params)
		.then((response) => response.json())
		.then((result) => {
			console.log(result);
			return res.json(result);
		})
		.catch((e) => {
			console.error(e);
			return res.status(500).json({error: "Failed to fetch info from critterdb.com"});
		});
});
