import {app, badwords} from "../server";
import {log} from "../logger";
import {requireUser, possibleUser} from "./login";
import {addCreatureToBestiary, collections, getBestiary, getCreature, getUser, updateCreature, Creature, deleteCreature} from "../database";
import {checkBestiaryPermission} from "./bestiaries";
import {ObjectId} from "mongodb";
import limits from "../staticData/limits.json";

//Get info
app.get("/api/creature/:id", possibleUser, async (req, res) => {
	try {
		let user = await getUser(req.body.id);
		let id = req.params.id;
		if (id.length != 24) {
			return res.status(400).json({error: "Creature id not valid-"});
		}
		let _id = new ObjectId(id);
		let creature = await getCreature(_id);
		if (creature) {
			let bestiary = await getBestiary(creature.bestiary);
			if (!bestiary) return res.status(404).json({error: "Bestiary creature is in, was not found-"});
			let bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
			if (bestiaryPermissionLevel != "none") {
				log.info(`Retrieved creature with the id ${id}`);
				return res.json(creature);
			} else {
				return res.status(401).json({error: "You don't have permission to view this creature-"});
			}
		} else {
			return res.status(404).json({error: "No creature with that id found-"});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/bestiary/:id/creatures", possibleUser, async (req, res) => {
	try {
		let user = await getUser(req.body.id);
		let bestiaryId = new ObjectId(req.params.id);
		let bestiary = await getBestiary(bestiaryId);
		if (bestiary) {
			if (checkBestiaryPermission(bestiary, user) != "none") {
				let creatures = (await collections.creatures?.find({_id: {$in: bestiary.creatures}}).toArray()) ?? [];
				log.info(`Retrieved creatures from bestiary with the id ${bestiaryId}`);
				return res.json(creatures);
			} else {
				return res.status(401).json({error: "You don't have permission to view this bestiary."});
			}
		} else {
			return res.status(404).json({error: "No bestiary with that id found."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Update info
export type CreatureInput = Omit<Omit<Creature, "_id">, "bestiary"> & {bestiary: string; _id?: string};
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
app.post("/api/creature/:id?/update", requireUser, async (req, res) => {
	try {
		//Get input
		let id = req.params.id;
		let inputData = req.body.data as CreatureInput;
		let data = convertInput(inputData);
		if (!data) {
			return res.status(400).json({error: "Creature id not valid."});
		}
		let user = await getUser(req.body.id);
		if (!user) {
			return res.status(404).json({error: "Couldn't find current user."});
		}
		//Make sure all fields are present
		let oldStats = data.stats;
		data.stats = {};
		for (let key in defaultStatblock) {
			//@ts-ignore
			data.stats[key] = {...defaultStatblock[key], ...oldStats[key]};
		}
		//Check limits
		if (data.stats.description.name.length > limits.nameLength) return res.status(400).json({error: `Name exceeds the character limit of ${limits.nameLength} characters.`});
		if (data.stats.description.name.length < limits.nameMin) return res.status(400).json({error: `Name is less than the minimum character limit of ${limits.nameMin} characters.`});
		if (data.stats.description.description.length > limits.descriptionLength) return res.status(400).json({error: `Description exceeds the character limit of ${limits.descriptionLength} characters.`});
		//Check image link
		let image = data.stats.description.image as string;
		// remove any url parameters from the string
		if (image) {
			image = new URL(image).origin + new URL(image).pathname;
			data.stats.description.image = image;
		}

		let failedToImportImage = false;
		if (image && image != "") {
			if (!image.startsWith("https")) {
				data.stats.description.image = "";
				failedToImportImage = true;
			}
			let isApproved = false;
			if (!failedToImportImage)
				for (let format of limits.imageFormats) {
					if (image.endsWith("." + format)) isApproved = true;
				}
			if (!isApproved) {
				data.stats.description.image = "";
				failedToImportImage = true;
			}
		}
		//Update or add
		if (id) {
			//Update existing creature
			if (id.length != 24) {
				return res.status(400).json({error: "Creature id not valid."});
			}
			let _id = new ObjectId(id);
			let creature = await getCreature(_id);
			if (!creature) return res.status(404).json({error: "No creature with that id found."});
			let bestiary = await getBestiary(creature.bestiary);
			if (!bestiary) return res.status(404).json({error: "Bestiary not found."});
			//Check owner
			let bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
			if (["none", "view"].includes(bestiaryPermissionLevel)) return res.status(401).json({error: "You don't have permission to update this creature."});
			//Remove bad words
			if (bestiary.status != "private") {
				if (badwords.check(data.stats.description.name)) return res.status(400).json({error: "Creature name includes blocked words or phrases. Remove the badwords or make the bestiary private."});
				if (badwords.check(data.stats.description.description)) return res.status(400).json({error: "Creature description includes blocked words or phrases. Remove the badwords or make the bestiary private."});
			}
			//Update creature
			let updatedId = await updateCreature(data, _id);
			if (updatedId) {
				log.info(`Updated creature with the id ${_id}`);

				if (failedToImportImage) return res.status(400).json({error: "Image link not recognized as an allowed image format. Make sure it is from a secure https location and ends in an image file format extension (e.g. .png)"});
				return res.status(201).json(data);
			} else {
				throw new Error(`Failed to update creature with the id: ${_id}`);
			}
		} else {
			//Create new creature
			let bestiary = await getBestiary(data.bestiary);
			if (!bestiary) return res.status(404).json({error: "Bestiary not found"});
			//Check owner
			let bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
			if (["none", "view"].includes(bestiaryPermissionLevel)) return res.status(401).json({error: "You don't have permission to add creature to this bestiary."});
			//Check amount of creatures:
			if (bestiary.creatures.length >= limits.creatureAmount) return res.status(400).json({error: `Number of creatures exceeds the limit of ${limits.creatureAmount}.`});
			//Remove bad words
			if (bestiary.status != "private") {
				if (badwords.check(data.stats.description.name)) {
					return res.status(400).json({error: "Creature name includes blocked words or phrases. Remove the badwords or make the bestiary private."});
				}
				if (badwords.check(data.stats.description.description)) {
					return res.status(400).json({error: "Creature description includes blocked words or phrases. Remove the badwords or make the bestiary private."});
				}
			}
			let _id = await updateCreature(data);
			if (!_id) return res.status(500).json({error: "Failed to create creature."});
			await addCreatureToBestiary(_id, data.bestiary);
			data._id = _id;
			log.info(`New creature created with the id: ${_id}`);

			if (failedToImportImage) return res.status(400).json({error: "Image link not recognized as an allowed image format. Make sure it is from a secure https location and ends in an image file format extension (e.g. .png)"});
			return res.status(201).json(data);
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/creature/:id/delete", requireUser, async (req, res) => {
	try {
		//Get input
		let id = req.params.id;
		if (id.length != 24) {
			return res.status(400).json({error: "Creature id not valid."});
		}
		let _id = new ObjectId(id);
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		//Permissions
		let creature = await getCreature(_id);
		if (!creature) return res.status(404).json({error: "Couldn't find creature with that id."});
		let bestiary = await getBestiary(creature.bestiary);
		if (!bestiary) return res.status(404).json({error: "Couldn't find bestiary creature is in."});
		let bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
		if (["none", "view"].includes(bestiaryPermissionLevel)) return res.status(401).json({error: "You don't have permission to delete this creature."});
		//Remove from db
		let status = await deleteCreature(_id);
		if (status) {
			log.info(`Deleted creature with the id ${id}`);
			res.json({});
		} else {
			res.status(500).json({error: "Failed to delete creature."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Default stat block. Make sure to align with frontend/public/types -> defaultStatblock
export const defaultStatblock = {
	description: {
		name: "New Creature",
		isProperNoun: false,
		description: "",
		image: "",
		faction: "",
		environment: "",
		alignment: "Unaligned",
		cr: 0,
		xp: 0
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
			swim: 0,
			climb: 0
		},
		senses: {
			passivePerceptionOverride: null,
			darkvision: 0,
			blindsight: 0,
			isBlind: false,
			truesight: 0,
			tremorsense: 0,
			telepathy: 0
		},
		languages: []
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
			override: null
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
	},
	misc: {
		legActionsPerRound: 3,
		featureHeaderTexts: {
			features: "",
			actions: "",
			bonus: "",
			reactions: "",
			legendary: "The creature can take $NUM$ legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The creature regains spent legendary actions at the start of its turn.",
			lair: "On initiative count 20 (losing initiative ties), the creature can take one of the following lair actions; it can't take the same lair action two rounds in a row",
			mythic: "If the creatures' Mythic trait is active, it can use the options below as legendary actions.",
			regional: "The region containing the creatures lair can be transformed by its presence, creating one or more of the following effects:"
		}
	}
};
