import {app} from "../server";
import {requireUser, possibleUser} from "./login";
import {collections, getUserFromSecret, updateBestiary} from "../database";
import {ObjectId} from "mongodb";

app.get("/api/bestiaries", async (req, res) => {
	let allBestiaries = (await collections.bestiaries?.find({status: "public"}).toArray()) ?? [];
	return res.json(allBestiaries);
});
app.get("/api/bestiary/:id", possibleUser, async (req, res) => {
	let id = req.params.id;
	if (id.length != 24) {
		return res.status(404).json({error: "Bestiary id not valid"});
	}
	let bestiary = (await collections.bestiaries?.findOne({_id: new ObjectId(id)})) ?? null;
	if (!bestiary) {
		return res.status(404).json({error: "No bestiary with that id found"});
	}
	let user = await getUserFromSecret(req.body.id);
	if ((user && user._id == bestiary.owner) || bestiary.status != "private") {
		return res.json(bestiary);
	} else {
		return res.status(403).json({error: "You don't have access to this bestiary"});
	}
});
app.get("/api/user/:userid/bestiaries", possibleUser, async (req, res) => {
	let allBestiaries = [];
	let user = await getUserFromSecret(req.body.id);
	if (user && user._id == req.params.userid) {
		//Own user
		allBestiaries = (await collections.bestiaries?.find({owner: req.params.userid}).toArray()) ?? [];
	} else {
		//Other user
		allBestiaries = (await collections.bestiaries?.find({owner: req.params.userid, status: "public"}).toArray()) ?? [];
	}
	return res.json(allBestiaries);
});

//For debugging
/**app.get("/test", authenticate, async (req, res) => {
	console.log(req.body.id);
	await updateBestiary({name: "Test public bestiary", owner: req.body.id, status: "public", description: "example 2", creatures: []});
	res.send("Success!");
});
*/
