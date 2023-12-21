import { type CasterSpells, type Statblock, type InnateSpellsList, defaultStatblock, spellListFlattened, type SpellSlotEntity, type SkillsEntity, type FeatureEntity } from "../components/types";

let tempData = {
	"name": "Brass Greatwyrm",
	"group": [
		"Metallic Dragon"
	],
	"source": "FTD",
	"page": 208,
	"size": [
		"G"
	],
	"type": {
		"type": "dragon",
		"tags": [
			"metallic"
		]
	},
	"alignment": [
		"L",
		"G"
	],
	"alignmentPrefix": "typically ",
	"ac": [
		{
			"ac": 22,
			"from": [
				"natural armor"
			]
		}
	],
	"hp": {
		"average": 565,
		"formula": "29d20 + 261"
	},
	"speed": {
		"walk": 60,
		"burrow": 60,
		"fly": 120,
		"swim": 60
	},
	"str": 30,
	"dex": 16,
	"con": 29,
	"int": 21,
	"wis": 22,
	"cha": 30,
	"save": {
		"dex": "+11",
		"con": "+17",
		"int": "+13",
		"wis": "+14",
		"cha": "+18"
	},
	"skill": {
		"insight": "+14",
		"perception": "+22",
		"persuasion": "+18"
	},
	"senses": [
		"truesight 120 ft."
	],
	"passive": 32,
	"immune": [
		"fire"
	],
	"conditionImmune": [
		"charmed",
		"frightened",
		"poisoned"
	],
	"languages": [
		"Common",
		"Draconic"
	],
	"cr": "28",
	"trait": [
		{
			"name": "Legendary Resistance (4/Day)",
			"entries": [
				"If the greatwyrm fails a saving throw, it can choose to succeed instead."
			]
		},
		{
			"name": "Metallic Awakening (Recharges after a Short or Long Rest)",
			"entries": [
				"If the greatwyrm would be reduced to 0 hit points, its current hit point total instead resets to 450 hit points, it recharges its Breath Weapon, and it regains any expended uses of Legendary Resistance. Additionally, the greatwyrm can now use the options in the \"Mythic Actions\" section for 1 hour. Award a party an additional 120,000 XP (240,000 XP total) for defeating the greatwyrm after its Metallic Awakening activates."
			]
		},
		{
			"name": "Unusual Nature",
			"entries": [
				"The greatwyrm doesn't require food or drink."
			]
		}
	],
	"action": [
		{
			"name": "Multiattack",
			"entries": [
				"The greatwyrm makes one Bite attack and two Claw attacks."
			]
		},
		{
			"name": "Bite",
			"entries": [
				"{@atk mw} {@hit 18} to hit, reach 15 ft., one target. {@h}21 ({@damage 2d10 + 10}) piercing damage plus 13 ({@damage 2d12}) force damage."
			]
		},
		{
			"name": "Claw",
			"entries": [
				"{@atk mw} {@hit 18} to hit, reach 10 ft., one target. {@h}19 ({@damage 2d8 + 10}) slashing damage. If the target is a Huge or smaller creature, it is {@condition grappled} (escape {@dc 20}) and is {@condition restrained} until this grapple ends. The greatwyrm can have only one creature {@condition grappled} in this way at a time."
			]
		},
		{
			"name": "Tail",
			"entries": [
				"{@atk mw} {@hit 18} to hit, reach 20 ft., one target. {@h}21 ({@damage 2d10 + 10}) bludgeoning damage. If the target is a creature, it must succeed on a {@dc 26} Strength saving throw or be knocked {@condition prone}."
			]
		},
		{
			"name": "Breath Weapon {@recharge 5}",
			"entries": [
				"The greatwyrm uses one of the following breath weapons:",
				{
					"type": "list",
					"style": "list-hang-notitle",
					"items": [
						{
							"type": "item",
							"name": "Elemental Breath",
							"entries": [
								"The greatwyrm exhales elemental energy in a 300-foot cone. Each creature in that area must make a {@dc 25} Dexterity saving throw, taking 84 ({@damage 13d12}) fire damage on a failed save, or half as much damage on a successful one."
							]
						},
						{
							"type": "item",
							"name": "Sapping Breath",
							"entries": [
								"The greatwyrm exhales gas in a 300-foot cone. Each creature in that area must make a {@dc 25} Constitution saving throw. On a failed save, the creature falls {@condition unconscious} for 1 minute. On a successful save, the creature has disadvantage on attack rolls and saving throws until the end of the greatwyrm's next turn. An {@condition unconscious} creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."
							]
						}
					]
				}
			]
		},
		{
			"name": "Change Shape",
			"entries": [
				"The greatwyrm magically transforms into any creature that is Medium or Small, while retaining its game statistics (other than its size). This transformation ends if the dragon is reduced to 0 hit points or uses its action to end it."
			]
		}
	],
	"legendary": [
		{
			"name": "Attack",
			"entries": [
				"The greatwyrm makes one Claw or Tail attack."
			]
		},
		{
			"name": "Wing Attack (Costs 2 Actions)",
			"entries": [
				"The greatwyrm beats its wings. Each creature within 30 feet of it must succeed on a {@dc 26} Dexterity saving throw or take 17 ({@damage 2d6 + 10}) bludgeoning damage and be knocked {@condition prone}. The greatwyrm can then fly up to half its flying speed."
			]
		}
	],
	"mythicHeader": [
		"If the greatwyrm's Metallic Awakening trait has activated in the last hour, it can use the options below as legendary actions."
	],
	"mythic": [
		{
			"name": "Bite",
			"entries": [
				"The greatwyrm makes one Bite attack."
			]
		},
		{
			"name": "Shattering Roar (Costs 2 Actions)",
			"entries": [
				"The greatwyrm unleashes a magical roar. Each creature in a 120-foot-radius sphere centered on the greatwyrm must succeed on a {@dc 26} Constitution saving throw or take 19 ({@damage 3d12}) thunder damage and be {@condition incapacitated} until the end of its next turn."
			]
		}
	],
	"variant": [
		{
			"type": "inset",
			"name": "Customizing Dragons",
			"source": "FTD",
			"page": 33,
			"entries": [
				"You can customize any dragon's stat block to reflect the dragon's unique character. Minor changes such as those below are easy to make and have no impact on a dragon's challenge rating.",
				{
					"type": "entries",
					"name": "Languages",
					"entries": [
						"Most dragons prefer to speak Draconic but learn Common for dealing with allies and minions. But given their high Intelligence and long life span, dragons can easily learn additional languages. You can add languages to a dragon's stat block."
					]
				},
				{
					"type": "entries",
					"name": "Skills",
					"entries": [
						"Most dragons are proficient in the {@skill Perception} and {@skill Stealth} skills, and many dragons have additional skill proficiencies. As with languages, you can customize a dragon's skill list (even doubling their proficiency bonus with certain skills) to reflect particular interests and activities. You can also give a dragon tool proficiencies, particularly if the dragon spends time in Humanoid form."
					]
				},
				{
					"type": "entries",
					"name": "Spells",
					"entries": [
						"{@note See the \"Variant: Dragons as Innate Spellcasters\" inset(s), below.}"
					]
				},
				{
					"type": "entries",
					"name": "Other Traits and Actions",
					"entries": [
						"You can borrow traits and actions from other monsters to add unique flavor to a dragon. Consider these examples:",
						{
							"type": "list",
							"style": "list-hang-notitle",
							"items": [
								{
									"type": "item",
									"name": "Change Shape",
									"entries": [
										"You can decide that a dragon acquires this action at a younger age than usual, particularly if you want to feature a dragon in Humanoid form in your campaign:",
										"The dragon magically polymorphs into a humanoid or beast that has a challenge rating no higher than its own, or back into its true form. It reverts to its true form if it dies. Any equipment it is wearing or carrying is absorbed or borne by the new form (the dragon's choice).",
										"In a new form, the dragon retains its alignment, hit points, Hit Dice, ability to speak, proficiencies, Legendary Resistance, lair actions, and Intelligence, Wisdom, and Charisma scores, as well as this action. Its statistics and capabilities are otherwise replaced by those of the new form, except any class features or legendary actions of that form."
									]
								},
								{
									"type": "item",
									"name": "Flyby",
									"entries": [
										"The dragon is an agile flier, quick to fly out of enemies' reach.",
										"The dragon doesn't provoke an opportunity attack when it flies out of an enemy's reach."
									]
								},
								{
									"type": "item",
									"name": "Mimicry",
									"entries": [
										"Impersonating characters or their allies could be a fun trick for a crafty dragon.",
										"The dragon can mimic any sounds it has heard, including voices. A creature that hears the sounds can tell they are imitations with a successful {@dc 18} Wisdom ({@skill Insight}) check."
									]
								},
								{
									"type": "item",
									"name": "Rejuvenation",
									"entries": [
										"You might decide that dragons in your campaign, being an essential part of the Material Plane, are nearly impossible to destroy. A dragon's life essence might be preserved in the egg from which it first emerged, in its hoard, or in a cavernous hall at the center of the world, just as a lich's essence is hidden in a phylactery.",
										"If it has an essence-preserving object, a destroyed dragon gains a new body in {@dice 1d10} days, regaining all its hit points and becoming active again. The new body appears within 5 feet of the object."
									]
								},
								{
									"type": "item",
									"name": "Special Senses",
									"entries": [
										"Most dragons have {@sense blindsight} and {@sense darkvision}. You might upgrade {@sense blindsight} to {@sense truesight}, or you could give a dragon with a burrowing speed {@sense tremorsense|MM}."
									]
								},
								{
									"type": "item",
									"name": "Tunneler",
									"entries": [
										"The dragon can burrow through solid rock at half its burrowing speed and leaves a tunnel in its wake."
									]
								}
							]
						}
					]
				}
			]
		}
	],
	"dragonCastingColor": "brass",
	"dragonAge": "greatwyrm",
	"traitTags": [
		"Legendary Resistances",
		"Unusual Nature"
	],
	"senseTags": [
		"U"
	],
	"actionTags": [
		"Breath Weapon",
		"Multiattack",
		"Shapechanger"
	],
	"languageTags": [
		"C",
		"DR"
	],
	"damageTags": [
		"B",
		"F",
		"O",
		"P",
		"S",
		"T"
	],
	"miscTags": [
		"AOE",
		"MW",
		"RCH"
	],
	"conditionInflict": [
		"grappled",
		"incapacitated",
		"prone",
		"restrained",
		"unconscious"
	],
	"savingThrowForced": [
		"constitution",
		"dexterity",
		"strength"
	],
	"hasToken": true,
	"hasFluff": true
}
export function parseFromCritterDB(data: any) : Statblock {
    let outputData = {} as Statblock
    outputData.description = {
        name: data.name,
        image: "",
        description: "",
        cr: parseInt(data.cr?.cr ?? data.cr),
        isProperNoun: data.isNamedCreature ?? false,
        environment: (data?.environment ?? []).join(", "),
        faction: "",
        alignment: (() => {
            let nameMap = {
                "L": "Lawful",
				"N": "Neutral",
				"NX": "Neutral",
				"NY": "Neutral",
				"C": "Chaotic",
				"G": "Good",
				"E": "Evil",
				"U": "Unaligned",
				"A": "Any"
            }
            // @ts-ignore
            return (data?.alignmentPrefix ?? "") + (data.alignment.map((a) => nameMap[a])).join(" ")
        })()
    }

    outputData.core = {
        proficiencyBonus: Math.max(2, Math.min(9, Math.floor((outputData.description.cr + 3) / 4))+1),
        race: (() => {
            let typeData = data.type
            if (typeof typeData == "string") return capitalizeFirstLetter(typeData)

            let baseType = typeData.type

            if (!typeData?.tags || typeData?.tags.length == 0) return capitalizeFirstLetter(baseType)

            if (typeof typeData?.tags[0] == "string") {
                return capitalizeFirstLetter(baseType) + ` (${typeData?.tags.map((a: string) => capitalizeFirstLetter(a)).join(" ")})`
            }

            if (typeof typeData?.tags[0] == "object") {
                return capitalizeFirstLetter(baseType) + " " +  typeData?.tags.map((t: any) => `${capitalizeFirstLetter(t.prefix)}} ${capitalizeFirstLetter(t.tag)}`).join(", ")
            }
            console.log('Something is fucked in race', typeData)

            return ""
        })(),
        size: (() => {
            let sizeMap = {
                "F": "Fine",
                "D": "Diminutive",
                "T": "Tiny",
                "S": "Small",
                "M": "Medium",
                "L": "Large",
                "H": "Huge",
                "G": "Gargantuan",
                "C": "Collosal",
                "V": "Varies"
            }
            // @ts-ignore
            return (data?.size ?? []).map((s: string) => sizeMap[s]).join(" or ")
        })(),
		languages: (() => {
			if (!data.languages) return []
			return data?.languages.filter((l: string) => !l.includes("telepathy"))
		})(),
		senses: {
			darkvision: (() => {
				for (let s of data?.senses ?? []) {
					if (s.includes('darkvision')) return parseInt(s.replace(/[a-zA-Z]/g, ''))
				}
				return 0
			})(),
			blindsight: (() => {
				for (let s of data?.senses ?? []) {
					if (s.includes('blindsight')) return parseInt(s.replace(/[a-zA-Z]/g, ''))
				}
				return 0
			})(),
			isBlind:  (data?.senses ?? []).find((str : string) => str.includes("blind beyond this radius")) ?? false,
			truesight: (() => {
				for (let s of data?.senses ?? []) {
					if (s.includes('truesight')) return parseInt(s.replace(/[a-zA-Z]/g, ''))
				}
				return 0
			})(),
			tremorsense: (() => {
				for (let s of data?.senses ?? []) {
					if (s.includes('tremorsense')) return parseInt(s.replace(/[a-zA-Z]/g, ''))
				}
				return 0
			})(),
			telepathy: (() => {
				if (!data.languages) return 0
				for (let s of data?.languages ?? []) {
					if (s.includes('telepathy')) return parseInt(s.replace(/[a-zA-Z]/g, ''))
				}
				return 0
			})(),
			passivePerceptionOverride: (() => {
				let num = data.passive
				
				if (data?.skill?.perception) {
					if (10+parseInt(data?.skill?.perception) == num) return null
				} 
				
				if (10+(Math.floor(data.wis/2)-5) == num) return null
				
				return num
			})()

		},
		speed: {
			walk: parseInt(data?.speed?.walk) || data?.speed?.walk?.number || 0,
			fly: parseInt(data?.speed?.fly) || data?.speed?.fly?.number || 0,
			isHover: data?.speed?.canHover || false,
			burrow: parseInt(data?.speed?.burrow) || data?.speed?.burrow?.number || 0,
			swim: parseInt(data?.speed?.swim) || data?.speed?.swim?.number || 0,
			climb: parseInt(data?.speed?.climb) || data?.speed?.climb?.number || 0
		}
    }

	outputData.abilities = {
		stats: {
			str: data.str,
			dex: data.dex,
			con: data.con,
			int: data.int,
			wis: data.wis,
			cha: data.cha
		},
		saves: {
			str: (() => {
				let mod = data?.save?.str ?? null

				if (!mod) return {isProficient: false, override: null}

				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.str/2)-5)
				if (mod == saveBonus) return {isProficient: true, override: null}
				if (mod != saveBonus) return {isProficient: false, override: mod}

				return {isProficient: false, override: null}
			})(),
			dex: (() => {
				let mod = parseInt(data?.save?.dex) ?? null
				if (!mod) return {isProficient: false, override: null}

				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.dex/2)-5)
				if (mod == saveBonus) return {isProficient: true, override: null}
				if (mod != saveBonus) return {isProficient: false, override: mod}

				return {isProficient: false, override: null}
			})(),			
			con: (() => {
				let mod = parseInt(data?.save?.con) ?? null
				if (!mod) return {isProficient: false, override: null}
				
				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.con/2)-5)
				if (mod == saveBonus) return {isProficient: true, override: null}
				if (mod != saveBonus) return {isProficient: false, override: mod}

				return {isProficient: false, override: null}
			})(),	
			int: (() => {
				let mod = parseInt(data?.save?.int) ?? null
				if (!mod) return {isProficient: false, override: null}
				
				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.int/2)-5)
				if (mod == saveBonus) return {isProficient: true, override: null}
				if (mod != saveBonus) return {isProficient: false, override: mod}

				return {isProficient: false, override: null}
			})(),	
			wis: (() => {
				let mod = parseInt(data?.save?.wis) ?? null
				if (!mod) return {isProficient: false, override: null}
				
				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.wis/2)-5)
				if (mod == saveBonus) return {isProficient: true, override: null}
				if (mod != saveBonus) return {isProficient: false, override: mod}

				return {isProficient: false, override: null}
			})(),	
			cha: (() => {
				let mod = parseInt(data?.save?.cha) ?? null
				if (!mod) return {isProficient: false, override: null}
				
				let saveBonus = outputData.core.proficiencyBonus + (Math.floor(data.cha/2)-5)
				if (mod == saveBonus) return {isProficient: true, override: null}
				if (mod != saveBonus) return {isProficient: false, override: mod}

				return {isProficient: false, override: null}
			})(),	
		},
		skills: (() => {
			if (!data.skill) return []

			let output = [] as SkillsEntity[]

			const SKILLS_BY_STAT = {
                "str": ["athletics"],
                "dex": ["acrobatics", "sleightofhand", "stealth"],
                "con": [],
                "int": ["arcana", "history", "investigation", "nature", "religion"],
                "wis": ["animalhandling", "insight", "medicine", "perception", "survival"],
                "cha": ["deception", "intimidation", "performance", "persuasion"]
            } as any

			for (let sk in data.skill) {

				let name = capitalizeFirstLetter(sk.replace('animal handling', "Animal Handling").replace("sleight of hand", "Sleight of Hand"))
				let shortname = name.replace(" ", "").toLowerCase()
				
				let ability;
				for (let sk in SKILLS_BY_STAT) {
					if (SKILLS_BY_STAT[sk].includes(shortname)) {
						ability = sk;
						break;
					}
				}
				if (!ability) continue;

			
				let isProf = parseInt(data.skill[sk]) == outputData.core.proficiencyBonus + (Math.floor(data[ability]/2)-5)
				let isExpertise = parseInt(data.skill[sk]) == Math.floor(outputData.core.proficiencyBonus*2) + (Math.floor(data[ability]/2)-5)
				let isHalfProficient = parseInt(data.skill[sk]) == Math.floor(outputData.core.proficiencyBonus/2) + (Math.floor(data[ability]/2)-5)

				let override = null;
				if (!isProf && !isExpertise && !isHalfProficient) override = parseInt(data.skill[sk])

				output.push({
					skillName: name,
					isProficient: isProf,
					isExpertise: isExpertise,
					isHalfProficient: isHalfProficient,
					override: override
				})
			}
			return output
		})()
	}

	outputData.defenses = {
		hp: {
			numOfHitDie: data.hp.formula.split('d')[0],
			sizeOfHitDie: parseInt((data.hp.formula.match(/\dd(\d+)/) || [])[1]) || 6,
			// critterDB doesn't handle this properly (see Demilich)
			override: null,
		},
		ac: {
			ac: parseInt(data.ac[0]) || parseInt(data.ac[0].ac),
			acSource: (() => {
				if (typeof data.ac[0] != "object") return ""
				return (data.ac[0].from[0] ?? "")
			})()
		},
		immunities: (() => {
			let output : string[] = []
			
			if (!data.immune) return []
			for (let v of data?.immune) {
				if (typeof v == "string") output.push(capitalizeFirstLetter(v))
				else {
					let types = v.immune
					let modifier = "";
					if (v.note) {
						if (v.note.includes('from magic weapons')) modifier += "Magical "
						if (v.note.includes('from silvered weapons')) modifier += "Silvered "
						if (v.note.includes('from adamantine weapons')) modifier += "Adamantine "

						if (v.note.includes('from nonmagical attacks')) modifier += "Nonmagical "
						if (v.note.includes('from nonsilvered attacks')) modifier += "Nonsilvered "
						if (v.note.includes('from nonadamantine attacks')) modifier += "Nonadamantine "

						if (v.note.includes('that aren\'t magical')) modifier += "Nonmagical "
						if (v.note.includes('that aren\'t silvered')) modifier += "Nonsilvered "
						if (v.note.includes('that aren\'t adamantine')) modifier += "Nonadamantine "

						if (v.note.includes('not made with magical')) modifier += "Nonmagical "
						if (v.note.includes('not made with silvered')) modifier += "Nonsilvered "
						if (v.note.includes('not made with adamantine')) modifier += "Nonadamantine "
					}
					for (let t of types) {
						output.push(`${modifier}${capitalizeFirstLetter(t)}`)
					}
				}
			}
			return output
		})(),
		resistances: (() => {
			let output : string[] = []
			
			if (!data.resist) return []
			for (let v of data?.resist) {
				if (typeof v == "string") output.push(capitalizeFirstLetter(v))
				else {
					let types = v.resist
					let modifier = "";
					if (v.note) {
						if (v.note.includes('from magic weapons')) modifier += "Magical "
						if (v.note.includes('from silvered weapons')) modifier += "Silvered "
						if (v.note.includes('from adamantine weapons')) modifier += "Adamantine "

						if (v.note.includes('from nonmagical attacks')) modifier += "Nonmagical "
						if (v.note.includes('from nonsilvered attacks')) modifier += "Nonsilvered "
						if (v.note.includes('from nonadamantine attacks')) modifier += "Nonadamantine "

						if (v.note.includes('that aren\'t magical')) modifier += "Nonmagical "
						if (v.note.includes('that aren\'t silvered')) modifier += "Nonsilvered "
						if (v.note.includes('that aren\'t adamantine')) modifier += "Nonadamantine "
						
						if (v.note.includes('not made with magical')) modifier += "Nonmagical "
						if (v.note.includes('not made with silvered')) modifier += "Nonsilvered "
						if (v.note.includes('not made with adamantine')) modifier += "Nonadamantine "
					}
					for (let t of types) {
						output.push(`${modifier}${capitalizeFirstLetter(t)}`)
					}
				}
			}
			return output
		})(),
		vulnerabilities: (() => {
			let output : string[] = []
			
			if (!data.vulnerable) return []
			for (let v of data?.vulnerable) {
				if (typeof v == "string") output.push(capitalizeFirstLetter(v))
				else {
					let types = v.vulnerable
					let modifier = "";
					if (v.note) {
						if (v.note.includes('from magic weapons')) modifier += "Magical "
						if (v.note.includes('from silvered weapons')) modifier += "Silvered "
						if (v.note.includes('from adamantine weapons')) modifier += "Adamantine "

						if (v.note.includes('from nonmagical attacks')) modifier += "Nonmagical "
						if (v.note.includes('from nonsilvered attacks')) modifier += "Nonsilvered "
						if (v.note.includes('from nonadamantine attacks')) modifier += "Nonadamantine "

						if (v.note.includes('that aren\'t magical')) modifier += "Nonmagical "
						if (v.note.includes('that aren\'t silvered')) modifier += "Nonsilvered "
						if (v.note.includes('that aren\'t adamantine')) modifier += "Nonadamantine "
						
						if (v.note.includes('not made with magical')) modifier += "Nonmagical "
						if (v.note.includes('not made with silvered')) modifier += "Nonsilvered "
						if (v.note.includes('not made with adamantine')) modifier += "Nonadamantine "
					}
					for (let t of types) {
						output.push(`${modifier}${capitalizeFirstLetter(t)}`)
					}
				}
			}
			return output
		})(),
		conditionImmunities: (data?.conditionImmune || []).map((c: string) => capitalizeFirstLetter(c))
	}

	outputData.spellcasting = {
		innateSpells: {
			spellList: (() => {
				let sData = [];
				let output = {
					0: [],
					1: [],
					2: [],
					3: []
				} as InnateSpellsList
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) sData = t;
				}

				if (!sData) return output

				if (sData.will) {
					if (!sData.daily) sData.daily = {"0e": sData.will}
					else sData.daily["0e"] = sData.will
				}

				if (sData.daily) {
					for (let l in sData.daily) {
						let level = parseInt(l.replace("e", ""));
						if (level >= 0 && level < 4) {
							for (let sp of sData.daily[l]) {
								let t = sp.replace('{@spell ', '')
								t = t.split('}')
								if(t) output[level].push(
									{
										spell: spellListFlattened.find((item: string) => item.toLowerCase() === t[0].toLowerCase()) || t[0],
										comment: t[1].replace(' (', '').replace(')', '') ?? ""
									}
								)
							}
						}
					}
				}
				return output
			})(),
			spellDcOverride: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) sData = t;
				}


				if (!sData || !sData.headerEntries) return null

				const match = sData.headerEntries[0].match(/\{@dc\s+(\d+)\}/)
				const dc = match ? parseInt(match[1]) : null
				if (!dc) return null
				if (dc != 8 + outputData.core.proficiencyBonus + (Math.floor(data[sData.ability]/2)-5)) return dc
				return null
			})(),
			spellBonusOverride: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) sData = t;
				}

				if (!sData || !sData.headerEntries) return null

				const match = sData.headerEntries[0].match(/\{@hit\s+(\d+)\}/)
				const hit = match ? parseInt(match[1]) : null
				if (!hit) return null

				if (hit != outputData.core.proficiencyBonus + (Math.floor(data[sData.ability]/2)-5)) return hit
				return null
			})(),
			displayAsAction: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) sData = t;
				}
				if (!sData || !sData.displayAs) return false
				return sData?.displayAs == "action"
			})(),
			noComponentsOfType: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) sData = t;
				}

				// this is the default
				if (!sData || !sData.headerEntries) return ["Material", "Verbal", "Somatic"]
			
				const text = sData.headerEntries[0]
				if (text.includes('requiring no components') || text.includes('requiring no spell components')) return ['Material', 'Somatic', 'Verbal']
				if (text.includes('requiring only verbal')) return ['Material', 'Somatic']
				if (text.includes('requiring only somatic')) return ['Material', 'Verbal']
				if (text.includes('requiring only material')) return ['Somatic', 'Verbal']
				if (text.includes('requiring no material')) return ['Material']
				if (text.includes('requiring no somatic')) return ['Somatic']
				if (text.includes('requiring no verbal')) return ['Verbal']
				return ['Material', 'Somatic', 'Verbal']
			})(),
			spellCastingAbility: (() => {
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting")) return t.ability;
				}
				return null;
			})(),
			isPsionics: (() => {
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Innate Spellcasting (Psionics)")) return true;
				}
				return false;
			})()
		},
		casterSpells: {
			casterLevel: (() => {
				let sData = []
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}
				if (!sData || !sData.headerEntries) return null


				const regex = /\b(\w+-level)\b/;
				const match = sData.headerEntries[0].match(regex);
				
				return match ? Math.max(0, Math.min(20, parseInt(match[1].replace('-level', '').replace('st', '').replace('nd', '').replace('rd', '').replace('th', '')))) : null
			})(),
			castingClass: (() => {
				let sData = []
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}
				if (!sData || !sData.headerEntries) return null

				const text = sData.headerEntries[0]

				if (text.toLowerCase().includes("wizard"))    return "Wizard"
				if (text.toLowerCase().includes("ranger"))    return "Ranger"
				if (text.toLowerCase().includes("sorcerer"))  return "Sorcerer"
				if (text.toLowerCase().includes("bard"))      return "Bard"
				if (text.toLowerCase().includes("druid"))     return "Druid"
				if (text.toLowerCase().includes("artificer")) return "Artificer"
				if (text.toLowerCase().includes("cleric"))    return "Cleric"
				if (text.toLowerCase().includes("warlock"))   return "Warlock"
				if (text.toLowerCase().includes("paladin"))   return "Paladin"

				return null
			})(),
			spellList: (() => {
				let output = [[], [], [], [], [], [], [], [], [], []] as CasterSpells["spellList"];

				let sData = []
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}
				if (!sData.spells) return output

				for (let l in sData.spells) {
					for (let sp of sData.spells[l].spells) {
						let t = sp.replace('{@spell ', '')
						t = t.split('}')
						if(t) output[parseInt(l)].push(spellListFlattened.find((item: string) => item.toLowerCase() === t[0].toLowerCase()) || t[0])
					}
				}

				return output
			})(),
			spellSlotList: (() => {
				let sData = []
				let output = {} as SpellSlotEntity
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}
				if (!sData.spells) return output

				for (let l in sData.spells) {
					if (parseInt(l) == 0) continue
					output[parseInt(l)] = sData.spells[l].slots ?? 0
				}
				return output
			})(),
			spellBonusOverride: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}

				if (!sData || !sData.headerEntries) return null

				const match = sData.headerEntries[0].match(/\{@hit\s+(\d+)\}/)
				const hit = match ? parseInt(match[1]) : null
				if (!hit) return null

				if (hit != outputData.core.proficiencyBonus + (Math.floor(data[sData.ability]/2)-5)) return hit
				return null
			})(),
			spellDcOverride: (() => {
				let sData = [];
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}

				if (!sData || !sData.headerEntries) return null

				const match = sData.headerEntries[0].match(/\{@dc\s+(\d+)\}/)
				const dc = match ? parseInt(match[1]) : null
				if (!dc) return null
				if (dc != 8 + outputData.core.proficiencyBonus + (Math.floor(data[sData.ability]/2)-5)) return dc
				return null
			})(),
			spellCastingAbilityOverride: null,
			spellCastingAbility: (() => {
				let sData = []
				for (let t of data?.spellcasting ?? []) {
					if (t.name.includes("Spellcasting") && !t.name.includes("Innate")) sData = t;
				}
				if (!sData.ability) return null
				return sData.ability
			})(),
			displayAsAction: false
		} 
	}

	outputData.misc = {
		legActionsPerRound: (() => {
			if (data?.legendaryActions) return data?.legendaryActions
			if ((data?.legendary ?? []).length > 0) return 3
			return 0
		})(),

		featureHeaderTexts: {
			features: "",
			actions: (data?.actionHeader ?? []).join('\n') ?? "",
			bonus: (data?.bonusHeader ?? []).join('\n') ?? "",
			reactions: (data?.reactionHeader ?? []).join('\n') ?? "",
			legendary: (data?.legendaryHeader ?? []).join('\n') ?? defaultStatblock.misc.featureHeaderTexts.legendary,
			lair: defaultStatblock.misc.featureHeaderTexts.lair,
			mythic: (data?.mythicHeader ?? []).join('\n') ?? defaultStatblock.misc.featureHeaderTexts.mythic,
			regional: defaultStatblock.misc.featureHeaderTexts.regional
		}
	}

	outputData.features = {
		features: abilityParser(data.trait),
		actions: abilityParser(data.action),
		bonus: [],
		reactions: [],
		legendary: abilityParser(data.legendary),
		lair:[],
		mythic: abilityParser(data.mythic),
		regional: [],
	}
    return outputData
}

function abilityParser(fData: any) : FeatureEntity[] {
	let output = [] as FeatureEntity[]
	for (let f of fData ?? []) {
		output.push({
			name: markdownReplacer(f.name),
			description: descParser(f.entries),
			automation: null
		})
	}
	return output
}

function descParser(dData: any) {
	let output = [];
	for (let d of dData) {
		if (typeof d == "string") output.push(markdownReplacer(d))
		if (typeof d == "object") {
			if (d.type == "list") {
				for (let i of d.items) {
					output.push(`**${markdownReplacer(i.name)}** ${markdownReplacer(i.entries.join('\n'))}`)
				}
			}
		}
	}
	return output.join('\n')
}

function markdownReplacer(text: string) : string {
	text = text
		.replace('{@atk mw}', '*Melee Weapon Attack:*')
		.replace('{@atk rw}', '*Ranged Weapon Attack:*')
		.replace('{@h}', '*Hit:* ')
		.replace(/\{@damage\s+([^}]+)\}/g, '$1')
		.replace(/\{@dc\s+([^}]+)\}/g, '$1')
		.replace(/\{@dice\s+([^}]+)\}/g, '$1')

		.replace(/\{@condition\s+([^}]+)\}/g, '$1')
		.replace(/\{@recharge\s+(\d+)\}/g, '(Recharge $1-6)')
		.replace('Recharge 6-6', 'Recharge 6')
		// @ts-ignore
		.replace(/\{@hit\s+(-?\d+)\}/g, (_, number) => (number >= 0 ? `+${number}` : number))

	return text
}

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const testCritterDB = parseFromCritterDB(tempData)