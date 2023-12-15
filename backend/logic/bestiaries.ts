import {app, badwords} from "../server";
import {requireUser, possibleUser} from "./login";
import {addBestiaryToUser, getBestiary, getUser, incrementBestiaryViewCount, updateBestiary, Bestiary, deleteBestiary, getCreature, collections, addBookmark, removeBookmark} from "../database";
import {ObjectId} from "mongodb";
import limits from "../staticData/limits.json";

//Get info
app.get("/api/bestiary/:id", possibleUser, async (req, res) => {
	try {
		let id = req.params.id;
		if (id.length != 24) {
			return res.status(400).json({error: "Bestiary id not valid."});
		}
		let _id = new ObjectId(id);
		let bestiary = await getBestiary(_id);
		if (!bestiary) {
			return res.status(404).json({error: "No bestiary with that id found."});
		}
		let user = await getUser(req.body.id);
		if ((user && user._id == bestiary.owner) || bestiary.status != "private") {
			//Increment view count
			incrementBestiaryViewCount(_id);
			//Return bestiary
			console.log(`Retrieved bestiary with the id ${id}`);
			return res.json(bestiary);
		} else {
			return res.status(401).json({error: "You don't have access to this bestiary."});
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/user/:userid/bestiaries", possibleUser, async (req, res) => {
	try {
		let allBestiaries = [];
		let user = await getUser(req.body.id);
		if (user && user._id == req.params.userid) {
			//Own user
			allBestiaries = (await collections.bestiaries?.find({owner: user._id}).toArray()) ?? [];
		} else {
			//Other user
			allBestiaries = (await collections.bestiaries?.find({owner: req.params.userid, status: "public"}).toArray()) ?? [];
		}
		console.log(`Retrieved all bestiaries from the user with the id ${req.params.userid}`);
		return res.json(allBestiaries);
	} catch (err) {
		console.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
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
app.post("/api/bestiary/:id?/update", requireUser, async (req, res) => {
	try {
		//Get input
		let id = req.params.id;
		let inputData = req.body.data as BestiaryInput;
		let data = convertInput(inputData);
		if (!data) {
			if (!id || id.length != 24) {
				return res.status(400).json({error: "Bestiary id not valid."});
			}
			data = inputData as Bestiary;
			data._id = new ObjectId(id);
		}
		let user = await getUser(req.body.id);
		if (!user) {
			return res.status(404).json({error: "Couldn't find current user."});
		}
		//Check limits
		console.log(data);
		if (data.name.length > limits.nameLength) {
			return res.status(400).json({error: `Name exceeds the character limit of ${limits.nameLength} characters.`});
		}
		if (data.description.length > limits.descriptionLength) {
			return res.status(400).json({error: `Description exceeds the character limit of ${limits.descriptionLength} characters.`});
		}
		if (data.creatures.length > limits.creatureAmount) {
			return res.status(400).json({error: `Number of creatures exceeds the limit of ${limits.creatureAmount}.`});
		}
		if (!["private", "public", "unlisted"].includes(data.status)) {
			return res.status(400).json({error: "Status has an unkown value, must only be 'public', 'unlisted' or 'private'."});
		}
		//Remove bad words
		if (data.status != "private") {
			if (badwords.check(data.name)) {
				return res.status(400).json({error: "Bestiary name includes blocked words or phrases."});
			}
			if (badwords.check(data.description)) {
				return res.status(400).json({error: "Bestiary description includes blocked words or phrases."});
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
					return res.status(401).json({error: "You don't have permission to update this bestiary."});
				}
				let updatedId = await updateBestiary(data, data._id);
				if (updatedId) {
					console.log(`Updated bestiary with the id ${data._id}`);
					return res.status(200).json(data);
				}
			}
			return res.status(404).json({error: "No bestiary with that id found."});
		} else {
			//Create new bestiary
			let _id = await updateBestiary(data);
			if (!_id) {
				return res.status(500).json({error: "Failed to create bestiary."});
			}
			await addBestiaryToUser(_id, user._id!);
			data._id = _id;
			data.owner = user._id!;
			console.log(`Created new bestiary with the id ${_id}`);
			return res.status(201).json(data);
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/bestiary/:id/delete", requireUser, async (req, res) => {
	try {
		//Get input
		let id = req.params.id;
		if (id.length != 24) {
			return res.status(400).json({error: "Bestiary id not valid."});
		}
		let _id = new ObjectId(id);
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		//Permissions
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Couldn't find bestiary."});
		if (bestiary.owner != user._id) return res.status(401).json({error: "You don't have permission to delete this bestiary."});
		//Remove from db
		let status = await deleteBestiary(_id);
		if (status) {
			console.log(`Deleted bestiary with the id ${id}`);
			res.json({});
		} else {
			res.status(500).json({error: "Failed to delete creature."});
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Bookmarks
app.get("/api/bestiary/:id/bookmark/toggle", requireUser, async (req, res) => {
	try {
		//Get input
		let id = req.params.id;
		if (id.length != 24) {
			return res.status(400).json({error: "Bestiary id not valid."});
		}
		let _id = new ObjectId(id);
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Couldn't find bestiary."});
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		//Permissions
		if (bestiary.owner != user._id && bestiary.status == "private") {
			return res.status(401).json({error: "You don't have permission to view this bestiary."});
		}
		//Already bookmarked?
		let status;
		let newState;
		if (user.bookmarks.filter((a) => a.toHexString() == _id.toHexString()).length > 0) {
			status = await removeBookmark(user._id, _id);
			newState = false;
			console.log(`Removed bestiary with the id ${_id} from the bookmarks of user with the id ${user._id}`);
		} else {
			status = await addBookmark(user._id, _id);
			newState = true;
			console.log(`Added bestiary with the id ${_id} to the bookmarks of user with the id ${user._id}`);
		}
		//Bookmark
		if (status) {
			return res.json({state: newState});
		} else {
			return res.status(500).json({error: "Server failed to toggle bookmark, please try again."});
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/bestiary/:id/bookmark/get", requireUser, async (req, res) => {
	try {
		//Get input
		let id = req.params.id;
		if (id.length != 24) {
			return res.status(400).json({error: "Bestiary id not valid."});
		}
		let _id = new ObjectId(id);
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Couldn't find bestiary."});
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		//Permissions
		if (bestiary.owner != user._id && bestiary.status == "private") {
			return res.status(401).json({error: "You don't have permission to view this bestiary."});
		}
		//Already bookmarked
		if (user.bookmarks.filter((a) => a.toHexString() == _id.toHexString()).length > 0) {
			return res.json({state: true});
		} else {
			return res.json({state: false});
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
