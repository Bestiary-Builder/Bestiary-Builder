import {app, badwords} from "../server";
import {log} from "../logger";
import {requireUser, possibleUser} from "./login";
import {publicLog, colors} from "./discord";
import {type Bestiary, type User, Creature, addBestiaryToUser, getBestiary, getUser, incrementBestiaryViewCount, updateBestiary, deleteBestiary, getCreature, collections, addBookmark, removeBookmark} from "../database";
import {ObjectId} from "mongodb";
import {type CreatureInput, defaultStatblock} from "./creatures";
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
			if (req.cookies.lastViewed != _id.toString()) {
				incrementBestiaryViewCount(_id);
				res.cookie("lastViewed", _id.toString(), {
					httpOnly: true,
					sameSite: "strict",
					secure: true,
					maxAge: 1000 * 60 * 15
				});
			}
			//Return bestiary
			log.info(`Retrieved bestiary with the id ${id}`);
			if (!bestiary.tags) bestiary.tags = [];
			return res.json(bestiary);
		} else {
			return res.status(401).json({error: "You don't have access to this bestiary."});
		}
	} catch (err) {
		log.log("critical", err);
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
		log.log("critical", err);
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
		log.log("critical", err);
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
		if (!data.tags) data.tags = [];
		else data.tags = data.tags.filter((t) => tags.includes(t));
		if (data.name.length > limits.nameLength) return res.status(400).json({error: `Name exceeds the character limit of ${limits.nameLength} characters.`});
		if (data.name.length < limits.nameMin) return res.status(400).json({error: `Name is less than the minimum character limit of ${limits.nameMin} characters.`});
		if (data.description.length > limits.descriptionLength) return res.status(400).json({error: `Description exceeds the character limit of ${limits.descriptionLength} characters.`});
		if (data.creatures.length > limits.creatureAmount) return res.status(400).json({error: `Number of creatures exceeds the limit of ${limits.creatureAmount}.`});
		if (!["private", "public", "unlisted"].includes(data.status)) return res.status(400).json({error: "Status has an unkown value, must only be 'public', 'unlisted' or 'private'."});
		//Remove bad words
		if (data.status != "private") {
			let usedBadwords : string[] = []
			badwords.filter(data.name, badword => {usedBadwords.push(badword)})
			if (usedBadwords.length > 0) {
				return res.status(400).json({error: `Bestiary name includes blocked words or phrases. Matched: ${usedBadwords.join(", ")}. If you think this was a mistake, please file a bug report.`});
			}

			usedBadwords = []
			badwords.filter(data.description, badword => {usedBadwords.push(badword)})
			if (usedBadwords.length > 0) {
				return res.status(400).json({error: `Bestiary description includes blocked words or phrases. Matched: ${usedBadwords.join(", ")}. If you think this was a mistake, please file a bug report.`});
			}
		}
		//Public?
		if (data.status == "public") {
			if (data.creatures.length == 0) return res.status(400).json({error: "A bestiary must include at least 1 creature to be made public."});
			if (data.name.toLowerCase().includes("new bestiary")) return res.status(400).json({error: "A bestiary must have a non default name."});
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
					status: data.status,
					tags: data.tags
				} as {
					name: string;
					description: string;
					status?: "public" | "private" | "unlisted";
					tags: string[];
				};
				if (permissionLevel == "editor") delete update.status;
				//Public log
				if (update.status == "public" && bestiary.status != "public") {
					publicLog("New public bestiary", `Bestiary "${data.name}" changed to public by ${user.username}.`, "https://" + req.hostname + "/bestiary-viewer/" + bestiary._id, user, colors.Blurple);
				}
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
		log.log("critical", err);
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
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Add many creatures
app.post("/api/bestiary/:id?/addcreatures", requireUser, async (req, res) => {
	try {
		//Get bestiary
		let id = req.params.id;
		if (!id || id.length != 24) {
			return res.status(400).json({error: "Bestiary id not valid."});
		}
		let _id = new ObjectId(id);
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Bestiary not found"});
		//Check owner
		let user = await getUser(req.body.id);
		if (!user) {
			return res.status(404).json({error: "Couldn't find current user."});
		}
		let bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
		if (["none", "view"].includes(bestiaryPermissionLevel)) return res.status(401).json({error: "You don't have permission to add creatures to this bestiary."});
		//Get creature input
		let data;
		try {
			let inputData = req.body.data as CreatureInput[];
			data = inputData.map((a) => ({stats: a} as Creature));
		} catch {
			data = null;
		}
		if (!data) {
			return res.status(400).json({error: "Failed to parse creature data."});
		}
		let now = Date.now();
		//Make sure all fields are present in all creatures
		let fixedData = [] as Creature[];
		for (let creature of data) {
			if (!creature) continue;
			let oldStats = creature.stats;
			creature.stats = {};
			for (let key in defaultStatblock) {
				//@ts-expect-error
				creature.stats[key] = {...defaultStatblock[key], ...oldStats[key]};
			}
			//Set bestiary id
			creature.bestiary = _id;
			//Remove creature id
			delete creature._id;
			//Set last updated
			creature.lastUpdated = now;
			//Check limits
			if (creature.stats.description.name.length > limits.nameLength) continue;
			if (creature.stats.description.name.length < limits.nameMin) continue;
			if (creature.stats.description.description.length > limits.descriptionLength) continue;
			//Check image link
			let image = creature.stats.description.image as string;
			// remove any url parameters from the string
			if (image) {
				try {
					image = new URL(image).origin + new URL(image).pathname;
					creature.stats.description.image = image;
				} catch (err) {
					log.error("Image url not recognized. (" + image + ")");
					continue;
				}
			}
			let failedToImportImage = false;
			if (image && image != "") {
				if (!image.startsWith("https")) {
					creature.stats.description.image = "";
					failedToImportImage = true;
				}
				let isApproved = false;
				if (!failedToImportImage)
					for (let format of limits.imageFormats) {
						if (image.endsWith("." + format)) isApproved = true;
					}
				if (!isApproved) {
					creature.stats.description.image = "";
					failedToImportImage = true;
				}
			}
			//Remove bad words
			if (bestiary.status != "private") {
				if (badwords.check(creature.stats.description.name)) continue;
				if (badwords.check(creature.stats.description.description)) continue;
			}
			//Push data
			fixedData.push(creature);
		}
		let error;
		//Check amount of creatures:
		if (bestiary.creatures.length + fixedData.length > limits.creatureAmount) {
			fixedData.length = limits.creatureAmount - bestiary.creatures.length;
			error = `Number of creatures exceeds the limit of ${limits.creatureAmount}, only creatures up to this limit was added.`;
		}
		//Add all creatures
		let result = ((await collections.creatures?.insertMany(fixedData, {ordered: false})) ?? {}) as {
			acknowledged: boolean;
			insertedIds: {[key: string]: ObjectId};
		};
		let ids = Object.values(result.insertedIds);
		log.log("database", `Created ${ids.length} creatures.`);
		await collections.bestiaries?.updateOne({_id: _id}, {$push: {creatures: {$each: ids}}, $set: {lastUpdated: now}});
		log.log("database", `Updated bestiary ${_id} with ${ids.length} creatures.`);
		log.info(`Added ${ids.length} creatures to bestiary with the id: ${_id}`);
		return res.status(201).json({error: error});
	} catch (err) {
		log.log("critical", err);
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
		log.log("critical", err);
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
		log.log("critical", err);
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
		log.log("critical", err);
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
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Export data
app.get("/api/public/bestiary/:id", (req, res) => res.redirect("/api/export/bestiary/" + req.params.id));
app.get("/api/export/bestiary/:id", async (req, res) => {
	/////////////////////////////////////////////////////////////////////////////////////
	//// STOP. EDITING THIS FUNCTION CAN BREAK AVRAE IMPORTS. TEST BEFORE CHANGING  ////
	///////////////////////////////////////////////////////////////////////////////////
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
			let hitdice = `${hpObject.numOfHitDie + "d" + hpObject.sizeOfHitDie} + ${hpObject.numOfHitDie * statCalc("con", creature.stats)}`;

			//Spellcastin:
			let spellcastInnateObj = creature.stats.spellcasting.innateSpells;
			let spellcastCasterObj = creature.stats.spellcasting.casterSpells;
			let spellcasting = {
				caster_level: spellcastCasterObj.casterLevel,
				slots: spellcastCasterObj.spellSlotList || {},
				known_spells: knownSpells(creature.stats.spellcasting),
				caster_dc: spellDc(false, creature.stats),
				caster_sab: spellAttackBonus(false, creature.stats),
				caster_mod: statCalc(spellcastCasterObj.spellCastingAbilityOverride ?? spellcastCasterObj.spellCastingAbility, creature.stats),
				innate_dc: spellDc(true, creature.stats),
				innate_sab: spellAttackBonus(true, creature.stats),
				innate_mod: statCalc(spellcastInnateObj.spellCastingAbilityOverride ?? spellcastInnateObj.spellCastingAbility, creature.stats)
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
				let override = creature.stats.abilities.saves[key].override;
				let value = statCalc(key, creature.stats);
				let prof = 0;
				if (override != null) {
					value = override;
					prof = 1;
				} else if (creature.stats.abilities.saves[key].isProficient) {
					value += creature.stats.core.proficiencyBonus;
					prof = 1;
				}
				saves[newKey] = {
					value: value,
					prof: prof,
					adv: null,
					bonus: 0
				};
			}
			//Final data
			let creatureData = {
				name: creature.stats.description.name,
				proper: creature.stats.description.isProperNoun,
				image_url: creature.stats.description.image || "",
				languages: creature.stats.core.languages,
				cr: displayCR(creature.stats.description.cr),
				xp: 1000,
				alignment: creature.stats.description.alignment,
				size: creature.stats.core.size,
				race: creature.stats.core.race,
				ac: creature.stats.defenses.ac.ac,
				armortype: creature.stats.defenses.ac.acSource,
				hp: hp,
				hitdice: hitdice,
				speed: displaySpeedOrSenses(creature.stats.core.speed),
				ability_scores: {
					prof_bonus: creature.stats.core.proficiencyBonus,
					strength: creature.stats.abilities.stats.str,
					dexterity: creature.stats.abilities.stats.dex,
					constitution: creature.stats.abilities.stats.con,
					intelligence: creature.stats.abilities.stats.int,
					wisdom: creature.stats.abilities.stats.wis,
					charisma: creature.stats.abilities.stats.cha
				},
				saves: saves,
				skills: calcSkills(creature.stats),
				senses: displaySpeedOrSenses(creature.stats.core.senses),
				resistances: creature.stats.defenses.resistances,
				immunities: creature.stats.defenses.immunities,
				vulnerabilities: creature.stats.defenses.vulnerabilities,
				condition_immune: creature.stats.defenses.conditionImmunities,
				traits: creature.stats.features.features,
				actions: creature.stats.features.actions,
				bonus_actions: creature.stats.features.bonus,
				reactions: creature.stats.features.reactions,
				legactions: creature.stats.features.legendary,
				mythic: creature.stats.features.mythic,
				lair: creature.stats.features.lair,
				regional: creature.stats.features.regional,
				la_per_round: creature.stats.misc.legActionsPerRound,
				spellcasting: spellcasting
			};
			// @ts-ignore
			creatureData.passiveperc = calcPP(creature.stats.core.senses.passivePerceptionOverride, creatureData);
			let caster = creature.stats["spellcasting"]["casterSpells"];
			let isNoun = creature.stats["description"]["isProperNoun"];
			let name = creature.stats["description"]["name"];

			// best not to think about this too much.
			if (caster.casterLevel && caster.castingClass && caster.spellList.flat().length > 0) {
				let output = `${isNoun ? "" : "The "}${name} is a ${nthSuffix(caster.casterLevel)}-level spellcaster. ${isNoun ? "Their" : "Its"} spellcasting ability is ${fullSpellAbilityName(caster.spellCastingAbilityOverride ?? caster.spellCastingAbility)} (spell save DC ${spellDc(
					false,
					creature.stats
				)}, ${spellAttackBonus(false, creature.stats) >= 0 ? "+" : ""}${spellAttackBonus(false, creature.stats)} to hit with spell attacks). ${isNoun ? name : "It"} ${
					["Sorcerer", "Bard", "Ranger", "Warlock"].includes(caster.castingClass) ? `knowns the following ${caster.castingClass.toLowerCase()} spells` : `has the following ${caster.castingClass.toLowerCase()} spells prepared`
				}:${!["Ranger", "Paladin"].includes(caster.castingClass) && caster.spellList[0].length > 0 ? `\n\nCantrips (at will): ${caster.spellList[0].sort().join(", ").toLowerCase()}` : ""}${
					caster.spellList[1].length > 0 ? `\n\n1st level ${slots(caster.spellSlotList[1])}: ${caster.spellList[1].sort().join(", ").toLowerCase()}` : ""
				}${caster.spellList[2].length > 0 ? `\n\n2nd level ${slots(caster.spellSlotList[2])}: ${caster.spellList[2].sort().join(", ").toLowerCase()}` : ""}${
					caster.spellList[3].length > 0 ? `\n\n3rd level ${slots(caster.spellSlotList[3])}: ${caster.spellList[3].sort().join(", ").toLowerCase()}` : ""
				}${caster.spellList[4].length > 0 ? `\n\n4th level ${slots(caster.spellSlotList[4])}: ${caster.spellList[4].sort().join(", ").toLowerCase()}` : ""}${
					caster.spellList[5].length > 0 ? `\n\n5th level ${slots(caster.spellSlotList[5])}: ${caster.spellList[5].sort().join(", ").toLowerCase()}` : ""
				}${caster.spellList[6].length > 0 ? `\n\n6th level ${slots(caster.spellSlotList[6])}: ${caster.spellList[6].sort().join(", ").toLowerCase()}` : ""}${
					caster.spellList[7].length > 0 ? `\n\n7th level ${slots(caster.spellSlotList[7])}: ${caster.spellList[7].sort().join(", ").toLowerCase()}` : ""
				}${caster.spellList[8].length > 0 ? `\n\n8th level ${slots(caster.spellSlotList[8])}: ${caster.spellList[8].sort().join(", ").toLowerCase()}` : ""}${
					caster.spellList[9].length > 0 ? `\n\n9th level ${slots(caster.spellSlotList[9])}: ${caster.spellList[9].sort().join(", ").toLowerCase()}` : ""
				}`.replaceAll("\t", "");

				creatureData.traits.push({
					name: "Spellcasting",
					description: output,
					automation: null
				});
			}

			caster = creature.stats["spellcasting"]["innateSpells"];
			if (caster.spellCastingAbility && (caster.spellList[0].length > 0 || caster.spellList[1].length > 0 || caster.spellList[2].length > 0 || caster.spellList[3].length > 0)) {
				let fName = `Innate Spellcasting${caster.isPsionics ? " (Psionics)" : ""}`;
				let output = "";

				if (!caster.displayAsAction) {
					output += `${isNoun ? "" : "The "}${name}'s spellcasting ability is ${fullSpellAbilityName(caster.spellCastingAbility)} (spell save DC ${spellDc(true, creature.stats)}, ${spellAttackBonus(true, creature.stats) >= 0 ? "+" : ""}${spellAttackBonus(
						true,
						creature.stats
					)} to hit with spell attacks). ${isNoun ? name : "It"} can innately cast the following spells${componentsString(caster.noComponentsOfType)}:`;
				} else {
					output += `${isNoun ? "" : "The "}${name} casts one of the following spells${componentsString(caster.noComponentsOfType)} and using ${fullSpellAbilityName(caster.spellCastingAbility)} as the spellcasting ability (spell save DC ${spellDc(true, creature.stats)}, ${
						spellAttackBonus(true, creature.stats) >= 0 ? "+" : ""
					}${spellAttackBonus(true, creature.stats)} to hit with spell attacks):`;
				}

				if (caster.spellList[0].length > 0)
					output += `\n\nAt will: ${caster.spellList[0]
						.map((x: any) => (x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell))
						.sort()
						.join(", ")
						.toLowerCase()}`;
				if (caster.spellList[3].length > 0)
					output += `\n\n3/day each: ${caster.spellList[3]
						.map((x: any) => (x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell))
						.sort()
						.join(", ")
						.toLowerCase()}`;
				if (caster.spellList[2].length > 0)
					output += `\n\n2/day each: ${caster.spellList[2]
						.map((x: any) => (x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell))
						.sort()
						.join(", ")
						.toLowerCase()}`;
				if (caster.spellList[1].length > 0)
					output += `\n\n1/day each: ${caster.spellList[1]
						.map((x: any) => (x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell))
						.sort()
						.join(", ")
						.toLowerCase()}`;

				creatureData[caster.displayAsAction ? "actions" : "traits"].push({
					name: fName,
					description: output,
					automation: null
				});
			}
			creatures.push(creatureData);

			//  <span v-if="!data.description.isProperNoun"> The </span> {{ data.description.name }} casts one of the following spells{{ componentsString(false) }}, using {{ fullSpellAbilityName(true) }} as the spellcasting ability, (spell save DC {{ spellDc(true) }}, {{ spellAttackBonus(true) }} to hit with spell attacks).
		}
		//Return bestiary in specific format
		let data = {
			metadata: {
				name: bestiary.name,
				description: bestiary.description
			},
			creatures
		};
		log.info(`Export - Retrieved bestiary with the id ${id}`);
		return res.json(data);
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured. Please contact the developers of Bestiary Builder, not Avrae."});
	}
});

//Statblock functions:
function displayCR(cr: number): string {
	if (cr == 0.125) return "1/8";
	if (cr == 0.25) return "1/4";
	if (cr == 0.5) return "1/2";
	return cr.toString();
}

function spellDc(innate = false, data: any): number {
	let castingData;
	if (innate) castingData = data.spellcasting.innateSpells;
	else castingData = data.spellcasting.casterSpells;
	if (castingData.spellDcOverride) return castingData.spellDcOverride;
	else {
		if (innate && castingData.spellCastingAbility) return 8 + statCalc(castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
		else return 8 + statCalc(castingData.spellCastingAbilityOveride ?? castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
	}
}

function knownSpells(data: any): any {
	let dailySpells = {
		"1": [],
		"2": [],
		"3": []
	};

	for (let times in data.innateSpells.spellList) {
		if (times == "0") continue;
		for (let sp of data.innateSpells.spellList[times]) {
			// @ts-ignore
			dailySpells[times].push(sp.spell);
		}
	}
	let output = {
		caster_spells: data.casterSpells.spellList.flat(),
		at_will: data.innateSpells.spellList[0].map((sp: any) => sp.spell),
		daily_spells: dailySpells
	};
	return output;
}

function hpCalc(data: any): number {
	return data.defenses.hp.override ?? Math.floor(data.defenses.hp.numOfHitDie * ((data.defenses.hp.sizeOfHitDie + 1) / 2 + statCalc("con", data)));
}

function statCalc(stat: string, data: any): number {
	return Math.floor(data.abilities.stats[stat] / 2) - 5;
}

function spellAttackBonus(innate = false, data: any) {
	let castingData;
	if (innate) castingData = data.spellcasting.innateSpells;
	else castingData = data.spellcasting.casterSpells;

	let bonus = 0;
	if (castingData.spellBonusOverride || castingData.spellBonusOverride === 0) bonus = castingData.spellBonusOverride;
	else {
		if (innate && castingData.spellCastingAbility) bonus = statCalc(castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
		else bonus = statCalc(castingData.spellCastingAbilityOveride ?? castingData.spellCastingAbility, data) + data.core.proficiencyBonus;
	}
	return bonus;
}

export function displaySpeedOrSenses(data: any[]) : string {
    let output = ""
    let filteredLength = data.filter(item => item.name !== 'New speed' && item.name !== 'New sense').length

	let index = 0;
    for (let item of data) {
        if (item.name === "New speed" || item.name === "New sense") continue;
        if (item.name != "Walk") output += item.name.toLowerCase() + " "
        output += item.value
        if (item.unit != "none") output += item.unit + "."
        if (item.comment) output += ` (${item.comment})`
        if (filteredLength != 1 && index != filteredLength-1) output += ", "
		index++
    }
    return output
}

export interface SkillsEntity {
	skillName: string;
	isHalfProficient: boolean;
	isProficient: boolean;
	isExpertise: boolean;
	override: number | null;
}

function calcSkills(data: any) {
	let skillData = data.abilities.skills as SkillsEntity[];
	let output = {} as {[key: string]: {value: number; prof?: number; bonus: number; adv: number | null}};
	for (let stat in SKILLS_BY_STAT) {
		for (let skill of SKILLS_BY_STAT[stat]) {
			let raw = skillData.find((a) => a.skillName.toLowerCase() == skill);
			if (raw == undefined) {
				output[skill] = {
					value: statCalc(stat, data),
					prof: 0,
					bonus: 0,
					adv: null
				};
			} else {
				if (raw.override != null) {
					output[skill] = {
						value: raw.override,
						// set prof to 1, as skills do not display in avrae without prof = 1|2
						prof: 1,
						bonus: 0,
						adv: null
					};
				} else {
					let base = statCalc(stat, data);
					if (raw.isHalfProficient) {
						output[skill] = {
							value: base + Math.floor(data.core.proficiencyBonus / 2),
							prof: 0.5,
							bonus: 0,
							adv: null
						};
					} else if (raw.isProficient) {
						output[skill] = {
							value: base + data.core.proficiencyBonus,
							prof: 1,
							bonus: 0,
							adv: null
						};
					} else if (raw.isExpertise) {
						output[skill] = {
							value: base + data.core.proficiencyBonus * 2,
							prof: 2,
							bonus: 0,
							adv: null
						};
					} else {
						output[skill] = {
							value: base,
							prof: 0,
							bonus: 0,
							adv: null
						};
					}
				}
			}
		}
	}
	return output;
}

function calcPP(override: null | number, finishedData: any): number {
	if (override != null) return override;
	return 10 + finishedData["skills"]["perception"]["value"];
}

const SKILLS_BY_STAT = {
	str: ["athletics", "strength"],
	dex: ["acrobatics", "sleightOfHand", "stealth", "initiative", "dexterity"],
	con: ["constitution"],
	int: ["arcana", "history", "investigation", "nature", "religion", "intelligence"],
	wis: ["animalHandling", "insight", "medicine", "perception", "survival", "wisdom"],
	cha: ["deception", "intimidation", "performance", "persuasion", "charisma"]
} as {[key: string]: string[]};

function nthSuffix(number: number): string {
	switch (number) {
		case 1:
			return "1st";
		case 2:
			return "2nd";
		case 3:
			return "3rd";
		default:
			return number.toString() + "th";
	}
}

function fullSpellAbilityName(abi: string): string {
	// if (innate) abi = this.data.spellcasting.innateSpells.spellCastingAbility
	// else abi = this.data.spellcasting.casterSpells.spellCastingAbilityOverride ?? this.data.spellcasting.casterSpells.spellCastingAbility

	if (abi == "str") return "Strength";
	if (abi == "dex") return "Dexterity";
	if (abi == "con") return "Constitution";
	if (abi == "wis") return "Wisdom";
	if (abi == "int") return "Intelligence";
	if (abi == "cha") return "Charisma";
	return "Spellcasting Ability not found.";
}

function slots(num: number) {
	if (num > 1) return `(${num} slots)`;
	return `(${num} slot)`;
}

function componentsString(comp: string[]): string {
	comp.sort();
	if (comp.length == 0) return "";
	if (comp.length == 3) return ", requiring no components";
	if (comp.length == 2) {
		let only = "material";
		if (!comp.includes("Verbal")) only = "verbal";
		if (!comp.includes("Somatic")) only = "somatic";

		return `, requiring only ${only} components`;
	}
	return `, requiring no ${comp[0].toLowerCase()} components`;
}
