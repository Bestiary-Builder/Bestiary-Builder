import {app, badwords} from "../server";
import {requireUser, possibleUser} from "./login";
import {addCreatureToBestiary, collections, getBestiary, getCreature, getUser, updateCreature, Creature, deleteCreature} from "../database";
import {ObjectId} from "mongodb";
import limits from "../staticData/limits.json";

//Get info
app.get("/api/creature/:id", possibleUser, async (req, res) => {
	let user = await getUser(req.body.id);
	let id = req.params.id;
	if (id.length != 24) {
		return res.status(400).json({error: "Creature id not valid"});
	}
	let _id = new ObjectId(id);
	let creature = await getCreature(_id);
	if (creature) {
		let bestiary = await getBestiary(creature.bestiary);
		if ((user && bestiary.owner == user._id) || bestiary.status != "private") {
			return res.json(creature);
		} else {
			return res.status(401).json({error: "You don't have permission to view this creature"});
		}
	} else {
		return res.status(404).json({error: "No creature with that id found"});
	}
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
	//Make sure all fields are present
	let oldStats = data.stats;
	data.stats = {};
	for (let key in defaultStatblock) {
		//@ts-ignore
		data.stats[key] = {...defaultStatblock[key], ...oldStats[key]};
	}
	//Check limit
	if (data.stats.description.name.length > limits.nameLength) {
		return res.status(400).json({error: `Name exceeds the character limit of ${limits.nameLength} characters`});
	}
	if (data.stats.description.description.length > limits.descriptionLength) {
		return res.status(400).json({error: `Description exceeds the character limit of ${limits.descriptionLength} characters`});
	}
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
			//Check owner
			if (bestiary.owner != user._id) {
				return res.status(401).json({error: "You don't have permission to update this creature"});
			}
			//Remove bad words
			if (bestiary.status != "private") {
				if (badwords.check(data.stats.description.name)) {
					return res.status(400).json({error: "Creature name includes blocked words or phrases. Remove the badwords or make the bestiary private"});
				}
				if (badwords.check(data.stats.description.description)) {
					return res.status(400).json({error: "Creature description includes blocked words or phrases. Remove the badwords or make the bestiary private"});
				}
				///data.stats.description.name = badwords.filter(data.stats.description.name);
				///data.stats.description.description = badwords.filter(data.stats.description.description);
			}
			//Update creature
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
		//Check owner
		if (bestiary.owner != user._id) {
			return res.status(401).json({error: "You don't have permission to add creature to this bestiary"});
		}
		//Remove bad words
		if (bestiary.status != "private") {
			if (badwords.check(data.stats.description.name)) {
				return res.status(400).json({error: "Creature name includes blocked words or phrases. Remove the badwords or make the bestiary private"});
			}
			if (badwords.check(data.stats.description.description)) {
				return res.status(400).json({error: "Creature description includes blocked words or phrases. Remove the badwords or make the bestiary private"});
			}
			///data.stats.description.name = badwords.filter(data.stats.description.name);
			///data.stats.description.description = badwords.filter(data.stats.description.description);
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
app.post("/api/delete/creature/:id", requireUser, async (req, res) => {
	//Get input
	let id = req.params.id;
	if (id.length != 24) {
		return res.status(400).json({error: "Creature id not valid"});
	}
	let _id = new ObjectId(id);
	let user = await getUser(req.body.id);
	if (!user) return res.status(404).json({error: "Couldn't find current user"});
	//Permissions
	let creature = await getCreature(_id);
	if (!creature) return res.status(404).json({error: "Couldn't find creature with that id"});
	let bestiary = await getBestiary(creature.bestiary);
	if (!bestiary) return res.status(404).json({error: "Couldn't find bestiary creature is in"});
	if (bestiary.owner != user._id) return res.status(401).json({error: "You don't have permission to delete this creature"});
	//Remove from db
	let status = await deleteCreature(_id);
	if (status) {
		res.json({});
	} else {
		res.status(500).json({error: "Failed to delete creature"});
	}
});

//For debugging
/**app.get("/test", authenticate, async (req, res) => {
	console.log(req.body.id);
	await updatecreature({name: "Test public creature", owner: req.body.id, status: "public", description: "example 2", creatures: []});
	res.send("Success!");
});
*/

//Default stat block
const defaultStatblock = {
	description: {
		name: "New Creature",
		isProperNoun: false,
		description: "",
		image: "",
		faction: "",
		environment: "",
		alignment: "Unaligned",
		cr: 0
	},
	core: {
		proficiencyBonus: 2,
		race: "Humanoid",
		size: "Medium",
		speed: {
			walk: 30,
			fly: 0,
			isHover: false,
			burrow: 0,
			swim: 0
		},
		senses: {
			passivePerceptionOverride: 0,
			darkvision: 0,
			blindsight: 0,
			isBlind: false,
			truesight: 0,
			tremorsense: 0,
			telepathy: 0
		},
		languages: [],
		numOfLegendaryActions: 0
	},
	abilities: {
		stats: {
			str: 10,
			dex: 10,
			con: 10,
			wis: 10,
			int: 10,
			cha: 10
		},
		saves: {
			str: {isProficient: false, override: null},
			dex: {isProficient: false, override: null},
			con: {isProficient: false, override: null},
			wis: {isProficient: false, override: null},
			int: {isProficient: false, override: null},
			cha: {isProficient: false, override: null}
		},
		skills: []
	},
	defenses: {
		hp: {
			numOfHitDie: 1,
			sizeOfHitDie: 6,
			override: false
		},
		ac: {
			ac: 10,
			acSource: "natural armor"
		},
		vulnerabilities: [],
		resistances: [],
		immunities: [],
		conditionImmunities: []
	},
	features: {
		features: [],
		actions: [],
		bonus: [],
		reactions: [],
		legendary: [],
		lair: [],
		regional: []
	},
	spellcasting: {
		innateSpells: {
			spellList: {
				0: [],
				1: [],
				2: [],
				3: []
			},
			spellDcOverride: null,
			spellBonusOverride: null,
			spellCastingAbility: null,
			noComponentsOfType: ["Material", "Verbal", "Somatic"],
			isPsionics: false
		},
		casterSpells: {
			casterLevel: null,
			castingClass: null,
			spellCastingAbility: null,
			spellCastingAbilityOverride: null,
			spellList: [[], [], [], [], [], [], [], [], [], []],
			spellSlotList: {},
			spellDcOverride: null,
			spellBonusOverride: null
		}
	}
};
