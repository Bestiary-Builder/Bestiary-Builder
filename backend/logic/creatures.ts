import {app, badwords} from "../server";
import {requireUser, possibleUser} from "./login";
import {addCreatureToBestiary, collections, getBestiary, getCreature, getUser, updateCreature, Creature} from "../database";
import {ObjectId} from "mongodb";
import limits from "../staticData/limits.json";

//Get info
app.get("/api/creature/:id", async (req, res) => {
	let id = req.params.id;
	if (id.length != 24) {
		return res.status(400).json({error: "Creature id not valid"});
	}
	let creature = (await collections.creatures?.findOne({_id: new ObjectId(id)})) ?? null;
	if (!creature) {
		return res.status(404).json({error: "No creature with that id found"});
	}
	return res.json(creature);
});
app.get("/api/bestiary/:id/creatures", possibleUser, async (req, res) => {
	let user = await getUser(req.body.id);
	let bestiaryId = new ObjectId(req.params.id);
	let bestiary = await getBestiary(bestiaryId);
	if (bestiary) {
		if ((user && bestiary.owner == user._id) || bestiary.status != "private") {
			let creatures = [];
			for (let creatureId of bestiary.creatures) {
				let creature = await collections.creatures?.findOne({_id: new ObjectId(creatureId)});
				if (creature) creatures.push(creature);
			}
			return res.json(creatures);
		} else {
			return res.status(401).json({error: "You don't have permission to view this bestiary"});
		}
	} else {
		return res.status(404).json({error: "No bestiary with that id found"});
	}
});

//Update info
type CreatureInput = Omit<Omit<Creature, "_id">, "bestiary"> & {bestiary: string; _id?: string};
function convertInput(input: CreatureInput): Creature | null {
	if (input._id && input._id.length != 24) {
		return null;
	}
	let _id = input._id ? new ObjectId(input._id) : null;
	if (input.bestiary.length != 24) {
		return null;
	}
	let bestiaryId = new ObjectId(input.bestiary);
	let data = Object.assign(input, {bestiary: bestiaryId, _id: _id} as Creature);
	return data;
}

app.post("/api/update/creature/:id?", requireUser, async (req, res) => {
	//Get input
	let id = req.params.id;
	let inputData = req.body.data as CreatureInput;
	let data = convertInput(inputData);
	if (!data) {
		return res.status(400).json({error: "Bestiary id not valid"});
	}
	let user = await getUser(req.body.id);
	if (!user) {
		return res.status(404).json({error: "Couldn't find current user"});
	}
	//Check limits
	console.log(data);
	if (data.stats.description.name.length > limits.nameLength) {
		return res.status(400).json({error: `Name exceeds the character limit of ${limits.nameLength} characters`});
	}
	if (data.stats.description.description.length > limits.descriptionLength) {
		return res.status(400).json({error: `Description exceeds the character limit of ${limits.descriptionLength} characters`});
	}
	//Remove bad words
	data.stats.description.name = badwords.filter(data.stats.description.name);
	data.stats.description.description = badwords.filter(data.stats.description.description);
	//Update or add
	if (id) {
		//Update existing creature
		if (id.length != 24) {
			return res.status(400).json({error: "Creature id not valid"});
		}
		let _id = new ObjectId(id);
		let creature = await getCreature(_id);
		let bestiary = await getBestiary(creature.bestiary);
		if (!bestiary) {
			return res.status(404).json({error: "Bestiary not found"});
		}
		if (creature) {
			if (bestiary.owner != user._id) {
				return res.status(401).json({error: "You don't have permission to update this creature"});
			}
			let updatedId = await updateCreature(data, _id);
			if (updatedId) {
				return res.json(data);
			}
		}
		return res.status(404).json({error: "No creature with that id found"});
	} else {
		//Create new creature
		let bestiary = await getBestiary(data.bestiary);
		if (!bestiary) {
			return res.status(404).json({error: "Bestiary not found"});
		}
		if (bestiary.owner != user._id) {
			return res.status(401).json({error: "You don't have permission to add creature to this bestiary"});
		}
		let _id = await updateCreature(data);
		if (!_id) {
			return res.status(500).json({error: "Failed to create creature"});
		}
		await addCreatureToBestiary(_id, data.bestiary);
		data._id = _id;
		return res.json(data);
	}
});

//For debugging
/**app.get("/test", authenticate, async (req, res) => {
	console.log(req.body.id);
	await updatecreature({name: "Test public creature", owner: req.body.id, status: "public", description: "example 2", creatures: []});
	res.send("Success!");
});
*/
