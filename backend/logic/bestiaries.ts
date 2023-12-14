import {app, badwords} from "../server";
import {requireUser, possibleUser} from "./login";
import {addBestiaryToUser, collections, getBestiary, getUser, incrementBestiaryViewCount, updateBestiary, Bestiary} from "../database";
import {ObjectId} from "mongodb";
import limits from "../staticData/limits.json";

//Get info
app.get("/api/bestiary/:id", possibleUser, async (req, res) => {
	let id = req.params.id;
	if (id.length != 24) {
		return res.status(400).json({error: "Bestiary id not valid"});
	}
	let bestiary = (await collections.bestiaries?.findOne({_id: new ObjectId(id)})) ?? null;
	if (!bestiary) {
		return res.status(404).json({error: "No bestiary with that id found"});
	}
	let user = await getUser(req.body.id);
	if ((user && user._id == bestiary.owner) || bestiary.status != "private") {
		//Increment view count
		incrementBestiaryViewCount(bestiary._id);
		//Return bestiary
		return res.json(bestiary);
	} else {
		return res.status(401).json({error: "You don't have access to this bestiary"});
	}
});
app.get("/api/user/:userid/bestiaries", possibleUser, async (req, res) => {
	let allBestiaries = [];
	let user = await getUser(req.body.id);
	if (user && user._id == req.params.userid) {
		//Own user
		allBestiaries = (await collections.bestiaries?.find({owner: req.params.userid}).toArray()) ?? [];
	} else {
		//Other user
		allBestiaries = (await collections.bestiaries?.find({owner: req.params.userid, status: "public"}).toArray()) ?? [];
	}
	return res.json(allBestiaries);
});

//Update info
type BestiaryInput = Omit<Bestiary, "_id"> & {_id?: string};
function convertInput(input: BestiaryInput): Bestiary | null {
	if (!input._id) {
		return input as Bestiary;
	}
	if (input._id.length != 24) {
		return null;
	}
	let bestiaryId = new ObjectId(input._id);
	let data = Object.assign(input, {_id: bestiaryId} as Bestiary);
	return data;
}

app.post("/api/update/bestiary/:id?", requireUser, async (req, res) => {
	//Get input
	let id = req.params.id;
	let inputData = req.body.data as BestiaryInput;
	let data = convertInput(inputData);
	if (!data) {
		if (!id || id.length != 24) {
			return res.status(400).json({error: "Bestiary id not valid"});
		}
		data = inputData as Bestiary;
		data._id = new ObjectId(id);
	}
	let user = await getUser(req.body.id);
	if (!user) {
		return res.status(404).json({error: "Couldn't find current user"});
	}
	//Check limits
	console.log(data);
	if (data.name.length > limits.nameLength) {
		return res.status(400).json({error: `Name exceeds the character limit of ${limits.nameLength} characters`});
	}
	if (data.description.length > limits.descriptionLength) {
		return res.status(400).json({error: `Description exceeds the character limit of ${limits.descriptionLength} characters`});
	}
	if (data.creatures.length > limits.creatureAmount) {
		return res.status(400).json({error: `Number of creatures exceeds the limit of ${limits.creatureAmount}`});
	}
	if (!["private", "public", "unlisted"].includes(data.status)) {
		return res.status(400).json({error: "Status has an unkown value, must only be 'public', 'unlisted' or 'private'"});
	}
	//Remove bad words
	if (data.status != "private") {
		if (badwords.check(data.name)) {
			return res.status(400).json({error: "Bestiary name includes blocked words or phrases"});
		}
		if (badwords.check(data.description)) {
			return res.status(400).json({error: "Bestiary description includes blocked words or phrases"});
		}
		///data.name = badwords.filter(data.name);
		///data.description = badwords.filter(data.description);
	}
	//Add or update
	if (data._id) {
		//Update existing bestiary
		let bestiary = await getBestiary(data._id);
		if (bestiary) {
			if (bestiary.owner != user._id) {
				return res.status(401).json({error: "You don't have permission to update this bestiary"});
			}
			let updatedId = await updateBestiary(data, data._id);
			if (updatedId) {
				return res.json(data);
			}
		}
		return res.status(404).json({error: "No bestiary with that id found"});
	} else {
		//Create new bestiary
		let _id = await updateBestiary(data);
		if (!_id) {
			return res.status(500).json({error: "Failed to create bestiary"});
		}
		await addBestiaryToUser(_id, user._id!);
		data._id = _id;
		data.owner = user._id!;
		return res.json(data);
	}
});

//For debugging
/**app.get("/test", authenticate, async (req, res) => {
	console.log(req.body.id);
	await updateBestiary({name: "Test public bestiary", owner: req.body.id, status: "public", description: "example 2", creatures: []});
	res.send("Success!");
});
*/
