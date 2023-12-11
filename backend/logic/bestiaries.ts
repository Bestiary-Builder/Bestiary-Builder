import {app} from "../server";
import {verifyToken} from "./login";
import {collections, updateBestiary} from "../database";
import {ObjectId} from "mongodb";

app.get("/api/bestiaries", async (req, res) => {
	let allBestiaries = (await collections.bestiaries?.find({status: "public"}).toArray()) ?? [];
	console.log("Found all public bestiaries", allBestiaries);
	return res.json(allBestiaries);
});
app.get("/api/bestiary/:id", verifyToken, async (req, res) => {
	console.log(req.body.id);
	let id = req.params.id;
	if (id.length != 24) {
		return res.status(404).json({error: "Bestiary id not valid"});
	}
	let bestiary = (await collections.bestiaries?.findOne({_id: new ObjectId(id)})) ?? null;
	if (!bestiary) {
		return res.status(404).json({error: "No bestiary with that id found"});
	}
	console.log(bestiary.owner);
	if (bestiary.owner == req.body.id || bestiary.status != "private") {
		return res.json(bestiary);
	} else {
		return res.status(403).json({error: "You don't have access to this bestiary"});
	}
});
app.get("/api/user/:userid/bestiaries", verifyToken, async (req, res) => {
	let allBestiaries = [];
	if (req.body.id == req.params.userid) {
		//Own user
		allBestiaries = (await collections.bestiaries?.find({owner: req.params.userid}).toArray()) ?? [];
	} else {
		//Other user
		allBestiaries = (await collections.bestiaries?.find({owner: req.params.userid, status: {$ne: "private"}}).toArray()) ?? [];
	}
	res.json(allBestiaries);
});

//For debugging
/**app.get("/test", verifyToken, async (req, res) => {
	console.log(req.body.id);
	await updateBestiary({name: "Test public bestiary", owner: req.body.id, status: "public", description: "example 2", creatures: []});
	res.send("Success!");
});
*/
