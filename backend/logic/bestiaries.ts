import {app, badwords, log} from "../server";
import {requireUser, possibleUser} from "./login";
import {type Bestiary, type User, Creature, addBestiaryToUser, getBestiary, getUser, incrementBestiaryViewCount, updateBestiary, deleteBestiary, getCreature, collections, addBookmark, removeBookmark} from "../database";
import {ObjectId} from "mongodb";
import limits from "../staticData/limits.json";
import tags from "../staticData/tags.json";

//Permission checks
export function checkBestiaryPermission(bestiary: Bestiary, user: User | null): "none" | "view" | "owner" | "editor" {
	if (user) {
		if (bestiary.owner == user._id) return "owner";
		else if ((bestiary.editors ?? []).includes(user._id)) return "editor";
	}
	if (bestiary.status != "private") return "view";
	else return "none";
}

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
		let permissionLevel = checkBestiaryPermission(bestiary, user);
		if (permissionLevel != "none") {
			//Increment view count
			incrementBestiaryViewCount(_id);
			//Return bestiary
			log.info(`Retrieved bestiary with the id ${id}`);
			if (!bestiary.tags) bestiary.tags = [];
			return res.json(bestiary);
		} else {
			return res.status(401).json({error: "You don't have access to this bestiary."});
		}
	} catch (err) {
		log.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/my-bestiaries", requireUser, async (req, res) => {
	try {
		let user = await getUser(req.body.id);
		if (!user) return res.status(404).json({error: "Couldn't find user"});
		let allBestiaries = (await collections.bestiaries?.find({$or: [{owner: user._id}, {editors: {$elemMatch: {$eq: user._id}}}]}).toArray()) ?? [];
		log.info(`Retrieved all bestiaries from the current user with the id ${req.params.userid}`);
		return res.json(allBestiaries);
	} catch (err) {
		log.error(err);
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
		log.info(`Retrieved all bestiaries from the user with the id ${req.params.userid}`);
		return res.json(allBestiaries);
	} catch (err) {
		log.error(err);
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
	let data = Object.assign(input, {_id: bestiaryId});
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
		if (!data.creatures) data.creatures = [];
		log.info(data.tags);
		if (!data.tags) data.tags = [];
		else data.tags = data.tags.filter((t) => tags.includes(t));
		log.info(data.tags);
		if (data.name.length > limits.nameLength) return res.status(400).json({error: `Name exceeds the character limit of ${limits.nameLength} characters.`});
		if (data.name.length < limits.nameMin) return res.status(400).json({error: `Name is less than the minimum character limit of ${limits.nameMin} characters.`});
		if (data.description.length > limits.descriptionLength) return res.status(400).json({error: `Description exceeds the character limit of ${limits.descriptionLength} characters.`});
		if (data.creatures.length > limits.creatureAmount) return res.status(400).json({error: `Number of creatures exceeds the limit of ${limits.creatureAmount}.`});
		if (!["private", "public", "unlisted"].includes(data.status)) return res.status(400).json({error: "Status has an unkown value, must only be 'public', 'unlisted' or 'private'."});
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
				let permissionLevel = checkBestiaryPermission(bestiary, user);
				if (permissionLevel == "none" || permissionLevel == "view") return res.status(401).json({error: "You don't have permission to update this bestiary."});
				//Limit properties that are editable:
				let update = {
					name: data.name,
					description: data.description,
					creatures: data.creatures,
					status: data.status,
					tags: data.tags
				} as {
					name: string;
					description: string;
					creatures: ObjectId[];
					status?: "public" | "private" | "unlisted";
					tags: string[];
				};
				if (permissionLevel == "editor") delete update.status;
				//Update:
				let updatedId = await updateBestiary(update as Bestiary, data._id);
				if (updatedId) {
					log.info(`Updated bestiary with the id ${data._id}`);
					return res.status(200).json(data);
				}
			} else {
				return res.status(404).json({error: "No bestiary with that id found."});
			}
		} else {
			//Create new bestiary
			let _id = await updateBestiary(data);
			if (!_id) {
				return res.status(500).json({error: "Failed to create bestiary."});
			}
			await addBestiaryToUser(_id, user._id!);
			data._id = _id;
			data.owner = user._id!;
			log.info(`Created new bestiary with the id ${_id}`);
			return res.status(201).json(data);
		}
	} catch (err) {
		log.error(err);
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
		if (checkBestiaryPermission(bestiary, user) != "owner") return res.status(401).json({error: "You don't have permission to delete this bestiary."});
		//Remove from db
		let status = await deleteBestiary(_id);
		if (status) {
			log.info(`Deleted bestiary with the id ${id}`);
			res.json({});
		} else {
			res.status(500).json({error: "Failed to delete creature."});
		}
	} catch (err) {
		log.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Change editors
app.get("/api/bestiary/:bestiaryid/editors/add/:userid", requireUser, async (req, res) => {
	try {
		//Get input
		if (!req.params.bestiaryid || req.params.bestiaryid.length != 24) {
			return res.status(400).json({error: "Bestiary id not valid."});
		}
		let _id = new ObjectId(req.params.bestiaryid);
		let currentUser = await getUser(req.body.id);
		if (!currentUser) {
			return res.status(404).json({error: "Couldn't find current user."});
		}
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Bestiary with that id not found."});
		let newEditor = await getUser(req.params.userid);
		if (!newEditor) return res.status(404).json({error: "No user with that id found."});
		//Permission check
		if (checkBestiaryPermission(bestiary, currentUser) != "owner") return res.status(401).json({error: "You don't have permission to add editors to this bestiary."});
		//Already an editor?
		let editors = bestiary.editors ?? [];
		if (editors.filter((e) => e == newEditor!._id).length > 0) {
			return res.json({error: "User is already an editor."});
		}
		//Add editor
		await collections.bestiaries?.updateOne({_id: _id}, {$push: {editors: newEditor._id}});
		log.info(`Removed user with the id ${newEditor._id} as editor of bestiary with the id ${bestiary._id}`);
		return res.json({});
	} catch (err) {
		log.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/bestiary/:bestiaryid/editors/remove/:userid", requireUser, async (req, res) => {
	try {
		//Get input
		if (!req.params.bestiaryid || req.params.bestiaryid.length != 24) {
			return res.status(400).json({error: "Bestiary id not valid."});
		}
		let _id = new ObjectId(req.params.bestiaryid);
		let currentUser = await getUser(req.body.id);
		if (!currentUser) {
			return res.status(404).json({error: "Couldn't find current user."});
		}
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Bestiary with that id not found."});
		let newEditor = await getUser(req.params.userid);
		if (!newEditor) return res.status(404).json({error: "No user with that id found."});
		//Permission check
		if (checkBestiaryPermission(bestiary, currentUser) != "owner") return res.status(401).json({error: "You don't have permission to add editors to this bestiary."});
		//Already an editor?
		let editors = bestiary.editors ?? [];
		if (editors.filter((e) => e == newEditor!._id).length == 0) {
			return res.json({error: "User is not an editor."});
		}
		//Remove editor
		await collections.bestiaries?.updateOne({_id: _id}, {$pull: {editors: newEditor._id}});
		log.info(`Removed user with the id ${newEditor._id} as editor of bestiary with the id ${bestiary._id}`);
		return res.json({});
	} catch (err) {
		log.error(err);
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
		log.info(checkBestiaryPermission(bestiary, user));
		if (checkBestiaryPermission(bestiary, user) == "none") {
			return res.status(401).json({error: "You don't have permission to view this bestiary."});
		}
		//Already bookmarked?
		let status;
		let newState;
		let bookmarks = user.bookmarks ?? [];
		if (bookmarks.filter((a) => a.toHexString() == _id.toHexString()).length > 0) {
			status = await removeBookmark(user._id, _id);
			newState = false;
			log.info(`Removed bestiary with the id ${_id} from the bookmarks of user with the id ${user._id}`);
		} else {
			status = await addBookmark(user._id, _id);
			newState = true;
			log.info(`Added bestiary with the id ${_id} to the bookmarks of user with the id ${user._id}`);
		}
		//Bookmark
		if (status) {
			return res.json({state: newState});
		} else {
			return res.status(500).json({error: "Server failed to toggle bookmark, please try again."});
		}
	} catch (err) {
		log.error(err);
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
		if (checkBestiaryPermission(bestiary, user) == "none") {
			return res.status(401).json({error: "You don't have permission to view this bestiary."});
		}
		//Already bookmarked
		let bookmarks = user.bookmarks ?? [];
		if (bookmarks.filter((a) => a.toHexString() == _id.toHexString()).length > 0) {
			return res.json({state: true});
		} else {
			return res.json({state: false});
		}
	} catch (err) {
		log.error(err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Export data
app.get("/api/public/bestiary/:id", (req, res) => res.redirect("/api/export/bestiary/" + req.params.id));
app.get("/api/export/bestiary/:id", async (req, res) => {
	try {
		let id = req.params.id;
		if (id.length != 24) return res.status(400).json({error: "Bestiary id not valid."});
		let _id = new ObjectId(id);
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "No bestiary with that id found."});
		if (bestiary.status == "private") return res.status(401).json({error: "This bestiary is private"});
		//Increment view count
		incrementBestiaryViewCount(_id);
		//Get creatures
		let creatures = [];
		for (let creatureId of bestiary.creatures) {
			let creature = await collections.creatures?.findOne({_id: new ObjectId(creatureId)});
			if (!creature) continue;

			//HP:
			let hpObject = creature.stats.defenses.hp;
			let hp = hpCalc(creature.stats);
			let hitdice = hpObject.numOfHitDie + "d" + hpObject.sizeOfHitDie + hpObject.numOfHitDie * statCalc("con", creature.stats);

			//Spellcastin:
			let spellcastInnateObj = creature.stats.spellcasting.innateSpells;
			let spellcastCasterObj = creature.stats.spellcasting.casterSpells;
			let spellcasting = {
				slots: spellcastCasterObj.spellSlotList,
				max_slots: spellcastCasterObj.spellSlotList,
				spells: spellcastCasterObj.spellList.flat().map((a: any) => ({name: a, strict: true})),
				dc: spellDc(false, creature.stats),
				sab: spellAttackBonus(false, creature.stats),
				caster_level: spellcastCasterObj.casterLevel,
				spell_mod: statCalc(spellcastCasterObj.spellCastingAbilityOverride ?? spellcastCasterObj.spellCastingAbility, creature.stats),
				at_will: [],
				daily: {}
			};

			//Saves/stats
			let saves = {} as any;
			for (let key in creature.stats.abilities.saves) {
				let newKey;
				switch (key) {
					case "str":
						newKey = "strengthSave";
						break;
					case "dex":
						newKey = "dexteritySave";
						break;
					case "con":
						newKey = "constitutionSave";
						break;
					case "wis":
						newKey = "wisdomSave";
						break;
					case "int":
						newKey = "intelligenceSave";
						break;
					case "cha":
						newKey = "charismaSave";
						break;
					default:
						continue;
				}
				let value = statCalc(key, creature.stats);
				saves[newKey] = {
					value: value
				};
			}

			//Final data
			let creatureData = {
				name: creature.stats.description.name,
				size: creature.stats.core.size,
				race: creature.stats.core.race,
				alignment: creature.stats.description.alignment,
				ac: creature.stats.defenses.ac.ac,
				armortype: creature.stats.defenses.ac.acSource,
				hp: hp,
				hitdice: hitdice,
				speed: creature.stats.core.speed,
				ability_scores: creature.stats.abilities.stats,
				saves: saves,
				skills: creature.stats.abilities.skills,
				senses: getSenses(creature.stats.core.senses),
				resistances: creature.stats.defenses.resistances,
				display_resists: creature.stats.defenses.resistances,
				condition_immune: creature.stats.defenses.conditionImmunities,
				languages: creature.stats.core.languages,
				cr: creature.stats.description.cr,
				xp: 1000,
				traits: creature.stats.features.features,
				actions: creature.stats.features.actions,
				reactions: creature.stats.features.reactions,
				legactions: creature.stats.features.legendary,
				la_per_round: 3,
				attacks: creature.stats.features.actions,
				proper: creature.stats.description.isProperNoun,
				image_url: creature.stats.description.empty,
				spellcasting: spellcasting,
				homebrew: true,
				source: bestiary.name
			};
			creatures.push(creatureData);
		}
		//Return bestiary in specific format
		///let data = {};
		log.info(`Public - Retrieved bestiary with the id ${id}`);
		return res.json(creatures);
	} catch (err) {
		log.error(err);
		return res.status(500).json({error: "Unknown server error occured."});
	}
});
//Statblock functions:
function spellDc(innate = false, data: any): number {
	let castingData;
	if (innate) castingData = data.spellcasting.innateSpells;
	else castingData = data.spellcasting.casterSpells;
	if (castingData.spellDcOverride) return castingData.spellDcOverride;
	else {
		if (innate && castingData.spellCastingAbility) return statCalc(castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
		else return 8 + statCalc(castingData.spellCastingAbilityOveride ?? castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
	}
}
function hpCalc(data: any): number {
	return Math.floor(data.defenses.hp.numOfHitDie * ((data.defenses.hp.sizeOfHitDie + 1) / 2 + statCalc("con", data)));
}
function statCalc(stat: string, data: any): number {
	return Math.floor(data.abilities.stats[stat] / 2) - 5;
}
function spellAttackBonus(innate = false, data: any): string {
	let castingData;
	if (innate) castingData = data.spellcasting.innateSpells;
	else castingData = data.spellcasting.casterSpells;

	let bonus = 0;
	if (castingData.spellBonusOverride || castingData.spellBonusOverride === 0) bonus = castingData.spellBonusOverride;
	else {
		if (innate && castingData.spellCastingAbility) bonus = statCalc(castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
		else bonus = statCalc(castingData.spellCastingAbilityOveride ?? castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
	}

	if (bonus >= 0) return "+" + bonus;
	return bonus.toString();
}
function getSenses(data: any) {
	let str = "";
	if (data.darkvision) str += `darkvision ${data.darkvision}ft., `;
	if (data.blindsight) str += `blindsight ${data.blindsight}ft., ${data.isBlind ? " (blind beyond this radius)" : ""}`;
	if (data.truesight) str += `truesight ${data.truesight}ft., `;
	if (data.tremorsense) str += `tremorsense ${data.tremorsense}ft., `;
	if (data.telepathy) str += `telepathy ${data.telepathy}ft., `;
	return str.slice(0, str.length - 2);
}
