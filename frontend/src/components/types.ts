export const defaultStatblock = {
	description: {
		name: "New Creature" as string,
		description: "" as string,
		image: "" as string,
		faction: "" as string,
		environment: "" as string,
		alignment: "Unaligned" as string,
		cr: 0 as number
	} as Description,
	core: {
		proficiencyBonus: 2 as number,
		race: "Humanoid" as string,
		size: "Medium" as "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan",
		speed: {
			walk: 30 as number,
			fly: 0 as number,
			isHover: false as boolean,
			burrow: 0 as number,
			swim: 0 as number
		} as Speed,
		senses: {
			passivePerceptionOverride: 0 as number,
			darkvision: 0 as number,
			blindsight: 0 as number,
			isBlind: false as boolean,
			truesight: 0 as number,
			tremorsense: 0 as number,
			telepathy: 0 as number
		} as Senses,
		languages: [] as string[]
	} as Core,
	abilities: {
		stats: {
			str: 10 as number,
			dex: 10 as number,
			con: 10 as number,
			wis: 10 as number,
			int: 10 as number,
			cha: 10 as number
		} as Stats,
		saves: {
			str: {isProficient: false as boolean, override: null as number | null},
			dex: {isProficient: false as boolean, override: null as number | null},
			con: {isProficient: false as boolean, override: null as number | null},
			wis: {isProficient: false as boolean, override: null as number | null},
			int: {isProficient: false as boolean, override: null as number | null},
			cha: {isProficient: false as boolean, override: null as number | null}
		} as Saves,
		skills: [] as SkillsEntity[]
	} as Abilities,
	defenses: {
		hp: {
			numOfHitDie: 1 as number,
			sizeOfHitDie: 6 as number,
			override: false as boolean | number
		} as Hp,
		ac: {
			ac: 10 as number,
			acSource: "natural armor" as string
		} as Ac,
		vulnerabilities: [] as string[],
		resistances: [] as string[],
		immunities: [] as string[],
		conditionImmunities: [] as string[]
	} as Defenses,
	features: {
		features: [] as FeatureEntity[],
		actions: [] as FeatureEntity[],
		bonus: [] as FeatureEntity[],
		reactions: [] as FeatureEntity[],
		legendary: [] as FeatureEntity[],
		lair: [] as FeatureEntity[], 
		regional: [] as FeatureEntity[]
	} as Features
} as Statblock;

export interface Statblock {
	description: Description;
	core: Core;
	abilities: Abilities;
	defenses: Defenses;
	features: Features;
}
export interface Description {
	name: string;
	description: string;
	image: string;
	faction: string;
	environment: string;
	alignment: string;
	cr: number;
}
export interface Core {
	proficiencyBonus: number;
	race: string;
	size: string;
	speed: Speed;
	senses: Senses;
	languages?: string[] | null;
}
export interface Speed {
	walk: number;
	fly: number;
	isHover: boolean;
	burrow: number;
	swim: number;
}
export interface Senses {
	passivePerceptionOverride: number;
	darkvision: number;
	blindsight: number;
	isBlind: boolean;
	truesight: number;
	tremorsense: number;
	telepathy: number;
}
export interface Abilities {
	stats: Stats;
	saves: Saves;
	skills: SkillsEntity[] | null;
}
export interface Stats {
	str: number;
	dex: number;
	con: number;
	wis: number;
	int: number;
	cha: number;
}

export interface Saves {
	str: SaveEntity;
	dex: SaveEntity;
	con: SaveEntity;
	wis: SaveEntity;
	int: SaveEntity;
	cha: SaveEntity;
}
export interface SaveEntity {
	isProficient: boolean;
	override: number | null;
}

export interface SkillsEntity {
	skillName: string;
	isHalfProficient: boolean;
	isProficient: boolean;
	isExpertise: boolean;
	override: number | null;
}
export interface Defenses {
	hp: Hp;
	ac: Ac;
	vulnerabilities?: string[] | null;
	resistances?: string[] | null;
	immunities?: string[] | null;
	conditionImmunities?: string[] | null;
}
export interface Hp {
	numOfHitDie: number;
	sizeOfHitDie: number;
	override: boolean;
}
export interface Ac {
	ac: number;
	acSource: string;
}
export interface Features {
	features: FeatureEntity[];
	actions: FeatureEntity[];
	bonus: FeatureEntity[];
	reactions: FeatureEntity[];
	legendary: FeatureEntity[];
	lair: FeatureEntity[];
	regional: FeatureEntity[];
}

export interface FeatureEntity {
	name: string;
	description: string;
	automation: null | object | object[];
	// type: "feature" | "action" | "bonus" | "reaction" | "legendary" | "lair" | "regional"
}

export interface User {
	username: string;
	avatar: string;
	email: string;
	verified: boolean;
	banner_color: string;
	global_name: string;
	bestiaries: string[];
	_id: string;
}

export interface Bestiary {
	name: string;
	owner: string;
	status: "public" | "private" | "unlisted";
	description: string;
	creatures: string[];
	_id: string;
}

export interface Creature {
	lastUpdated: Date;
	stats: Statblock;
	bestiary: string;
	_id: string;
}

export const basicExamples = [
	{
		"name": "Basic Attack", 
		"description":"", 
		"automation": 
			{"name": "Basic Attack", "automation": [{"type": "target", "target": "each", "effects": [{"type": "attack", "hit": [{"type": "damage", "damage": "1d6 + 2 [slashing]", "overheal": false}], "miss": [], 	"attackBonus": "4"}]}, {"type": "text", "text": "*Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 5 (1d6 + 2) slashing damage.", "title": "Effect"}], "_v": 2}
	},
	{
		"name": "Versatile Weapon",
		"description": "*Melee Weapon Attack:* +3 to hit, reach 5 ft., one target. *Hit:* 6 (1d8 + 2) slashing damage, or 7 (1d10 + 2) slashing damage if used with two hands'",
    	"automation": 
			[{"name": "Longsword (1H)", "automation": [{"type": "target", "target": "each", "effects": [{"type": "attack", "hit": [{"type": "damage", "damage": "1d8 + 2 [slashing]", "overheal": false}], "miss": [], "attackBonus": "3"}]}, {"type": "text", "text": "*Melee Weapon Attack:* +3 to hit, reach 5 ft., one target. *Hit:* 6 (1d8 + 2) slashing damage, or 7 (1d10 + 2) slashing damage if used with two hands.", "title": "Effect"}], "_v": 2}, {"name": "Longsword (2H)", "automation": [{"type": "target", "target": "each", "effects": [{"type": "attack", "hit": [{"type": "damage", "damage": "1d10 + 2 [slashing]", "overheal": false}], "miss": [], "attackBonus": "3"}]}, {"type": "text", "text": "*Melee Weapon Attack:* +3 to hit, reach 5 ft., one target. *Hit:* 6 (1d8 + 2) slashing damage, or 7 (1d10 + 2) slashing damage if used with two hands.", "title": "Effect"}], "_v": 2}]
	},
	{
		"name": "Save for Half Damage",
		"description": "Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.",
		"automation": 
			{"name":"Save for Half Damage","automation":[{"type":"roll","dice":"8d6 [fire]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"19","fail":[{"type":"damage","damage":"{damage}"}],"success":[{"type":"damage","damage":"({damage}) / 2"}]}],"meta":[]},{"type":"text","text":"Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one."}],"_v":2}
	},
	{
		"name": "Breath Weapon with Recharge",
		"desc": "",
		"automation": {"name":"Breath Weapon with Recharge","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Breath Weapon Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 5","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Breath Weapon!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Breath Weapon!"}],"errorBehaviour":"false"}],"label":"Recharge Breath Weapon","verb":"attempts to recharge their Breath Weapon","style":"3"}]}],"sortBy":null},{"type":"roll","dice":"12d8 [fire]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"18","fail":[{"type":"damage","damage":"{damage}"}],"success":[{"type":"damage","damage":"{damage}/2"}]}],"meta":[]},{"type":"text","text":"The monster exhales fire in a 60-foot line that is 5 feet wide. Each creature in that line must make a DC 18 Dexterity saving throw, taking 54 (12d8) fire damage on a failed save, or half as much damage on a successful one."}],"_v":2,"verb":"unleashes their","proper":true}
	}
	,
	{
		"name": "Basic Attack with Save against Poison Damage",
		"desc": "*Melee Weapon Attack:* +6 to hit, reach 10 ft., one target. *Hit:* 6 (1d4 + 4) piercing damage, and the target must make a DC 10 Constitution saving throw, taking 10 (3d6) poison damage on a failed save, or half as much damage on a successful one.",
		"automation": {"name":"Basic Attack with Save against Poison","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"1d4 + 4 [piercing]"},{"type":"save","stat":"con","dc":"10","fail":[{"type":"damage","damage":"3d6 [poison]"}],"success":[{"type":"damage","damage":"(3d6 [poison]) / 2"}],"meta":[]}],"miss":[],"attackBonus":"6"}]},{"type":"text","text":"*Melee Weapon Attack:* +6 to hit, reach 10 ft., one target. *Hit:* 6 (1d4 + 4) piercing damage, and the target must make a DC 10 Constitution saving throw, taking 10 (3d6) poison damage on a failed save, or half as much damage on a successful one."}],"_v":2}
	},
	{
		"name": "Basic Attack with Grapple (Restrain)",
		"desc": "",
		"automation": {"name":"Basic Attack with Grapple (Restrain)","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d6 + 4 [bludgeoning]"},{"type":"ieffect2","name":"Grappled","duration":null,"desc":"Grappled by {{caster.name}}\n - Escape DC 14","effects":null,"attacks":null,"buttons":[{"label":"Escape Grapple","verb":"tries to escape","automation":[{"type":"target","target":"self","effects":[{"type":"check","ability":["acrobatics","athletics"],"dc":"14","success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}]},{"type":"text","text":"A creature grappled by the monster can use its action to try to escape. To do so, it must succeed on a Strength (Athletics) or Dexterity (Acrobatics) check against the escape DC in the monster's stat block."}]}],"end":false,"conc":false,"stacking":false,"save_as":"grapple"}],"miss":[],"attackBonus":"6"}]},{"type":"text","text":"*Melee Weapon Attack:* +6 to hit, reach 10 ft., one target. *Hit:* 11 (2d6 + 4) bludgeoning damage. The target is grappled (escape DC 14) if it is a Large or smaller creature and the monster doesn't have two other creatures grappled."}],"_v":2}
	},
	{
		"name": "Basic Attack with Grapple (Restrain) with DMG at start of turn",
		"desc": "",
		"automation": {"name":"Basic Attack with Grapple (Restrain) with DMG at start of turn)","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d6 + 4 [slashing]"},{"type":"ieffect2","name":"Grappled (Restrained)","duration":null,"desc":"Grappled by {{caster.name}}\n - Escape DC 14\n - Target takes 2d6 piercing at the start of its turns","effects":{"attack_advantage":-1,"save_dis":["dex"]},"attacks":null,"buttons":[{"label":"Escape Grapple","verb":"tries to escape","automation":[{"type":"target","target":"self","effects":[{"type":"check","ability":["acrobatics","athletics"],"dc":"14","success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}]},{"type":"text","text":"A creature grappled by the monster can use its action to try to escape. To do so, it must succeed on a Strength (Athletics) or Dexterity (Acrobatics) check against the escape DC in the monster's stat block."}]},{"label":"Grapple (Restrain) Damage","verb":"takes damage from the Grapple (Restrain)","style":"4","automation":[{"type":"target","target":"self","effects":[{"type":"damage","damage":"2d6 [piercing]","overheal":false,"cantripScale":false}]},{"type":"text","text":"Until this grapple ends, the target is restrained and takes 7 (2d6) piercing damage at the start of each of its turns."}]}],"end":false,"conc":false,"stacking":false,"save_as":"grapple"}],"miss":[],"attackBonus":"8"}]},{"type":"text","text":"*Melee Weapon Attack:* +8 to hit, reach 10 ft., one target. *Hit:* 11 (2d6 + 4) slashing damage. The target is grappled (escape DC 14) if the monster isn't already grappling a creature. Until this grapple ends, the target is restrained and takes 7 (2d6) piercing damage at the start of each of its turns."}],"_v":2}
	}
] as FeatureEntity[]

export const srdFeatures = [
	{
		"name": "Aboleth - Tentacle",
		"description": "",
		"automation": {"name":"Aboleth - Tentacle","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d6 + 5 [bludgeoning]"},{"type":"save","stat":"con","dc":"14","fail":[{"type":"ieffect2","name":"Diseased (Tentacle)"}],"success":[]}],"miss":[],"attackBonus":"9"}]},{"type":"text","text":"*Melee Weapon Attack:* +9 to hit, reach 10 ft., one target. *Hit:* 12 (2d6 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or become diseased. The disease has no effect for 1 minute and can be removed by any magic that cures disease. After 1 minute, the diseased creature's skin becomes translucent and slimy, the creature can't regain hit points unless it is underwater, and the disease can be removed only by heal or another disease-curing spell of 6th level or higher. When the creature is outside a body of water, it takes 6 (1d12) acid damage every 10 minutes unless moisture is applied to the skin before 10 minutes have passed."}],"_v":2}
	},
	{
		"name": "Aboleth - Enslave",
		"description": "",
		"automation": {"name":"Aboleth - Enslave","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Enslave Used","stacking":true,"buttons":[]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"save","stat":"wis","dc":"14","fail":[{"type":"ieffect2","name":"Charmed","desc":"Charmed by {{caster.name}}\n - They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw whenever it takes damage, ending the effect on a success","buttons":[{"label":"Resist Charm","verb":"attempts to resist Charm","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"wis","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"The aboleth targets one creature it can see within 30 feet of it. The target must succeed on a DC 14 Wisdom saving throw or be magically charmed by the aboleth until the aboleth dies or until it is on a different plane of existence from the target. The charmed target is under the aboleth's control and can't take reactions, and the aboleth and the target can communicate telepathically with each other over any distance.\n\nWhenever the charmed target takes damage, the target can repeat the saving throw. On a success, the effect ends. No more than once every 24 hours, the target can also repeat the saving throw when it is at least 1 mile away from the aboleth."}],"_v":2,"verb":"attempts to","proper":true}
	},
	{
		"name": "Aboleth - Mucous Cloud",
		"description": "",
		"automation": {"name":"Aboleth - Mucous Cloud","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"14","fail":[{"type":"roll","dice":"1d4","name":"hours"},{"type":"ieffect2","name":"Diseased (Mucous Cloud)","duration":"{{600 * int(hours)}}","desc":"Can only breathe underwater"}],"success":[],"meta":[]}]},{"type":"text","text":"While underwater, the aboleth is surrounded by transformative mucus. A creature that touches the aboleth or that hits it with a melee attack while within 5 feet of it must make a DC 14 Constitution saving throw. On a failure, the creature is diseased for 1d4 hours. The diseased creature can breathe only underwater."}],"_v":2,"verb":"releases","activation_type":2}
	},
	{
		"name": "Aboleth - Psychic Drain",
		"description": "",
		"automation": {"name":"Aboleth - Psychic Drain","automation":[{"type":"variable","name":"lastDamage","value":"0"},{"type":"roll","dice":"3d6","name":"damage"},{"type":"target","target":"each","effects":[{"type":"damage","damage":"{damage} [psychic]"}],"meta":[]},{"type":"target","target":"self","effects":[{"type":"damage","damage":"-({lastDamage}) [heal]"}]},{"type":"text","text":"One creature charmed by the aboleth takes 10 (3d6) psychic damage, and the aboleth regains hit points equal to the damage the creature takes."}],"_v":2,"verb":"uses","proper":true,"activation_type":9}
	},
	{
		"name": "Aboleth - Phantasmal Lair",
		"description": "",
		"automation": {"name":"Aboleth - Phantasmal Lair","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Phantasmal Lair","duration":10,"desc":"Can't use other lair actions","effects":null,"attacks":null,"buttons":null,"end":false,"conc":true,"stacking":false,"save_as":"conc"}]},{"type":"spell","id":2332,"dc":"14","parent":"conc"},{"type":"text","text":"The aboleth casts phantasmal force (no components required) on any number of creatures it can see within 60 feet of it. While maintaining concentration on this effect, the aboleth can't take other lair actions. If a target succeeds on the saving throw or if the effect ends for it, the target is immune to the aboleth's phantasmal force lair action for the next 24 hours, although such a creature can choose to be affected."}],"_v":2,"verb":null,"proper":"has a","activation_type":11}
	},
	{
		"name": "Aboleth - Grasping Tide",
		"description": "",
		"automation": {"name":"Aboleth - Grasping Tide","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"str","dc":"14","fail":[{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}],"success":[]}]},{"type":"text","text":"Pools of water within 90 feet of the aboleth surge outward in a grasping tide. Any creature on the ground within 20 feet of such a pool must succeed on a DC 14 Strength saving throw or be pulled up to 20 feet into the water and knocked prone. The aboleth can't use this lair action again until it has used a different one."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Aboleth - Psychic Rage",
		"description": "",
		"automation": {"name":"Aboleth - Psychic Rage","automation":[{"type":"roll","dice":"2d6 [psychic]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"wis","dc":"14","fail":[{"type":"damage","damage":"{damage}"}],"success":[]}],"meta":[]},{"type":"text","text":"Water in the aboleth's lair magically becomes a conduit for the creature's rage. The aboleth can target any number of creatures it can see in such water within 90 feet of it. A target must succeed on a DC 14 Wisdom saving throw or take 7 (2d6) psychic damage. The aboleth can't use this lair action again until it has used a different one."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Black Dragon - Acid Breath",
		"description": "",
		"automation": {"name":"Adult Black Dragon - Acid Breath","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Acid Breath Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 5","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Acid Breath!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Acid Breath!"}],"errorBehaviour":"false"}],"label":"Recharge Acid Breath","verb":"attempts to recharge their Acid Breath","style":"3"}]}],"sortBy":null},{"type":"roll","dice":"12d8 [acid]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"18","fail":[{"type":"damage","damage":"{damage}"}],"success":[{"type":"damage","damage":"{damage}/2"}]}],"meta":[]},{"type":"text","text":"The dragon exhales acid in a 60-foot line that is 5 feet wide. Each creature in that line must make a DC 18 Dexterity saving throw, taking 54 (12d8) acid damage on a failed save, or half as much damage on a successful one."}],"_v":2,"verb":"unleashes their","proper":true}
	},
	{
		"name": "Adult Black Dragon - Frightful Presence",
		"description": "",
		"automation": {"name":"Adult Black Dragon - Frightful Presence","activation_type":1,"automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"wis","dc":"16","fail":[{"type":"ieffect2","name":"Frightened","duration":10,"desc":"Frightened of {{caster.name}}\n - They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of each of its turns, ending the effect on a success","buttons":[{"label":"Resist Fear","verb":"attempts to resist Fear","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"wis","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 16 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours."}],"_v":2,"verb":"uses their","proper":true}
	},
	{
		"name": "Adult Black Dragon - Wing Attack",
		"description": "",
		"automation": {"name":"Adult Black Dragon - Wing Attack","automation":[{"type":"roll","dice":"2d6 + 6 [bludgeoning]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"19","fail":[{"type":"damage","damage":"{damage}"},{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}],"success":[]}],"meta":[]},{"type":"text","text":"The dragon beats its wings. Each creature within 10 feet of the dragon must succeed on a DC 19 Dexterity saving throw or take 13 (2d6 + 6) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed."}],"_v":2,"verb":"uses","proper":true,"activation_type":9}
	},
	{
		"name": "Adult Black Dragon - Grasping Tide",
		"description": "",
		"automation": {"name":"Adult Black Dragon - Grasping Tide","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"str","dc":"15","fail":[{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}],"success":[]}]},{"type":"text","text":"Pools of water that the dragon can see within 120 feet of it surge outward in a grasping tide. Any creature on the ground within 20 feet of such a pool must succeed on a DC 15 Strength saving throw or be pulled up to 20 feet into the water and knocked prone."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Black Dragon - Insect Swarm",
		"description": "",
		"automation": {"name":"Adult Black Dragon - Insect Swarm","automation":[{"type":"roll","dice":"3d6 [piercing]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"15","fail":[{"type":"damage","damage":"{damage}"}],"success":[{"type":"damage","damage":"({damage}) / 2"}]},{"type":"ieffect2","name":"In the Insect Swarm","duration":1,"desc":"Target takes 3d6 piercing if they end their turn inside the swarm","effects":null,"attacks":null,"buttons":[{"label":"Leave the Swarm","verb":"leaves the range of the Insect Swarm","style":"3","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"remove_ieffect","removeParent":null}]},{"label":"Insect Swarm Damage","verb":"takes damage from the Insect Swarm","style":"4","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"target","target":"self","effects":[{"type":"damage","damage":"3d6 [piercing]","overheal":false,"cantripScale":false}]},{"type":"text","text":"A creature that ends its turn in the cloud takes 10 (3d10) piercing damage."}]}],"end":true,"conc":false,"stacking":false,"parent":null}],"meta":[]},{"type":"text","text":"A cloud of swarming insects fills a 20-foot-radius sphere centered on a point the dragon chooses within 120 feet of it. The cloud spreads around corners and remains until the dragon dismisses it as an action, uses this lair action again, or dies. The cloud is lightly obscured. Any creature in the cloud when it appears must make on a DC 15 Constitution saving throw, taking 10 (3d6) piercing damage on a failed save, or half as much damage on a successful one. A creature that ends its turn in the cloud takes 10 (3d6) piercing damage."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Blue Dragon - Celing Collapse",
		"description": "",
		"automation": {"name":"Adult Blue Dragon - Ceiling Collapse","automation":[{"type":"roll","dice":"3d6 [bludgeoning]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"15","fail":[{"type":"damage","damage":"{damage}"},{"type":"ieffect2","name":"Prone (Restrained)","duration":-1,"effects":{"attack_advantage":-1,"save_dis":["dex"]},"desc":"Target is buried and can't breathe or standup\n - A creature can take an action to make a DC 10 Strength check to uncover them","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null},{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}]}],"label":"Dig Out","verb":"is uncovered"}]}],"success":[]}],"meta":[]},{"type":"text","text":"Part of the ceiling collapses above one creature that the dragon can see within 120 feet of it. The creature must succeed on a DC 15 Dexterity saving throw or take 10 (3d6) bludgeoning damage and be knocked prone and buried. The buried target is restrained and unable to breathe or stand up. A creature can take an action to make a DC 10 Strength check, ending the buried state on a success."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Blue Dragon - Swirling Sands",
		"description": "",
		"automation": {"name":"Adult Blue Dragon - Swirling Sands","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"15","fail":[{"type":"ieffect2","name":"Blinded","duration":10,"effects":{"attack_advantage":-1},"desc":"They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of each of its turns, ending the effect on a success","buttons":[{"label":"Resist Blindness","verb":"attempts to resist Blindness","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"con","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"A cloud of sand swirls about in a 20-foot-radius sphere centered on a point the dragon can see within 120 feet of it. The cloud spreads around corners. Each creature in the cloud must succeed on a DC 15 Constitution saving throw or be blinded for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Blue Dragon - Lightning Arcs",
		"description": "",
		"automation": {"name":"Adult Blue Dragon - Lightning Arcs","automation":[{"type":"roll","dice":"3d6 [lightning]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"15","fail":[{"type":"damage","damage":"{damage}"}],"success":[]}],"meta":[]},{"type":"text","text":"Lightning arcs, forming a 5-foot-wide line between two of the lair's solid surfaces that the dragon can see. They must be within 120 feet of the dragon and 120 feet of each other. Each creature in that line must succeed on a DC 15 Dexterity saving throw or take 10 (3d6) lightning damage."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Brass Dragon - Sleep Breath",
		"description": "",
		"automation": {"name":"Adult Brass Dragon - Sleep Breath","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Breath Weapon Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 5","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Breath Weapon!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Breath Weapon!"}],"errorBehaviour":"false"}],"label":"Recharge Breath Weapon","verb":"attempts to recharge their Breath Weapon","style":"3"}]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"18","fail":[{"type":"ieffect2","name":"Unconscious","duration":100,"buttons":[{"label":"Wake Up","verb":"is woken up","style":"4","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"remove_ieffect","removeParent":null}]}]}],"success":[]}]},{"type":"text","text":"The dragon exhales sleep gas in a 60-foot cone. Each creature in that area must succeed on a DC 18 Constitution saving throw or fall unconscious for 10 minutes. This effect ends for a creature if the creature takes damage or someone uses an action to wake it."}],"_v":2,"verb":"unleashes their","proper":true}
	},
	{
		"name": "Adult Brass Dragon - Strong Winds",
		"description": "",
		"automation": {"name":"Adult Brass Dragon - Strong Winds","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"str","dc":"15","fail":[{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}],"success":[]}]},{"type":"text","text":"A strong wind blows around the dragon. Each creature within 60 feet of the dragon must succeed on a DC 15 Strength saving throw or be pushed 15 feet away from the dragon and knocked prone. Gases and vapors are dispersed by the wind, and unprotected flames are extinguished. Protected flames; such as lanterns, have a 50 percent chance of being extinguished."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Bronze Dragon - Repulsion Breath",
		"description": "",
		"automation": {"name":"Adult Bronze Dragon - Repulsion Breath","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Breath Weapon Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 5","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Breath Weapon!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Breath Weapon!"}],"errorBehaviour":"false"}],"label":"Recharge Breath Weapon","verb":"attempts to recharge their Breath Weapon","style":"3"}]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"save","stat":"str","dc":"19","fail":[],"success":[]}]},{"type":"text","text":"The dragon exhales repulsion energy in a 30-foot cone. Each creature in that area must succeed on a DC 19 Strength saving throw. On a failed save, the creature is pushed 60 feet away from the dragon."}],"_v":2,"verb":"unleashes their","proper":true}
	},
	{
		"name": "Adult Bronze Dragon",
		"description": "",
		"automation": {"name":"Adult Bronze Dragon - Thunderclap","automation":[{"type":"roll","dice":"1d10 [thunder]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"15","fail":[{"type":"damage","damage":"{damage}"},{"type":"ieffect2","name":"Deafened","duration":1,"end":true}],"success":[]}],"meta":[]},{"type":"text","text":"A thunderclap originates at a point the dragon can see within 120 feet of it. Each creature within a 20-foot radius centered on that point must make a DC 15 Constitution saving throw or take 5 (1d10) thunder damage and be deafened until the end of its next turn."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Copper Dragon - Slowing Breath",
		"description": "",
		"automation": {"name":"Adult Copper Dragon - Slowing Breath","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Breath Weapon Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 5","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Breath Weapon!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Breath Weapon!"}],"errorBehaviour":"false"}],"label":"Recharge Breath Weapon","verb":"attempts to recharge their Breath Weapon","style":"3"}]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"18","fail":[{"type":"ieffect2","name":"Slowed","duration":10,"desc":"Target's speed is halved\n - Can use either an action or a bonus action on its turn, not both, nor make more than one attack during its turn, and can't use reactions\n - They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of each of its turns, ending the effect on a success","buttons":[{"label":"Resist Slowness","verb":"attempts to resist Slowness","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"con","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"The dragon exhales gas in a 60-foot cone. Each creature in that area must succeed on a DC 18 Constitution saving throw. On a failed save, the creature can't use reactions, its speed is halved, and it can't make more than one attack on its turn. In addition, the creature can use either an action or a bonus action on its turn, but not both. These effects last for 1 minute. The creature can repeat the saving throw at the end of each of its turns, ending the effect on itself with a successful save."}],"_v":2,"verb":"unleashes their","proper":true}
	},
	{
		"name": "Adult Copper Dragon - Mud",
		"description": "",
		"automation": {"name":"Adult Copper Dragon - Mud","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"15","fail":[{"type":"ieffect2","name":"Restrained","duration":-1,"effects":{"attack_advantage":-1,"save_dis":["dex"]},"buttons":[]}],"success":[]}]},{"type":"text","text":"The dragon chooses a 10-foot-square area on the ground that it can see within 120 feet of it. The ground in that area turns into 3-foot-deep mud. Each creature on the ground in that area when the mud appears must succeed on a DC 15 Dexterity saving throw or sink into the mud and become restrained. A creature can take an action to attempt a DC 15 Strength check, freeing itself or another creature within its reach and ending the restrained condition on a success. Moving 1 foot in the mud costs 2 feet of movement. On initiative count 20 on the next round, the mud hardens, and the Strength DC to work free increases to 20."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Gold Dragon - Weakening Breath",
		"description": "",
		"automation": {"name":"Adult Gold Dragon - Weakening Breath","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Breath Weapon Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 5","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Breath Weapon!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Breath Weapon!"}],"errorBehaviour":"false"}],"label":"Recharge Breath Weapon","verb":"attempts to recharge their Breath Weapon","style":"3"}]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"save","stat":"str","dc":"21","fail":[{"type":"ieffect2","name":"Weakened","duration":10,"effects":{"save_dis":["str"],"check_dis":["strength"]},"desc":"They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of each of its turns, ending the effect on a success","buttons":[{"label":"Resist Weakness","verb":"attempts to resist Weakness","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"str","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"The dragon exhales gas in a 60-foot cone. Each creature in that area must succeed on a DC 21 Strength saving throw or have disadvantage on Strength-based attack rolls, Strength checks, and Strength saving throws for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."}],"_v":2,"verb":"unleashes their","proper":true}
	},
	{
		"name": "Adult Gold Dragon - Banish",
		"description": "",
		"automation": {"name":"Adult Gold Dragon - Banish","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Banishing","duration":2,"end":true,"save_as":"banish","stacking":false}]},{"type":"target","target":"each","effects":[{"type":"save","stat":"cha","dc":"15","fail":[{"type":"ieffect2","name":"Banished","duration":2,"desc":"To escape, target must use an action to make a contested Charisma check against {{caster.name}}","parent":"banish","buttons":[{"label":"Attempt Escape","verb":"attempts to escape the dream plane","style":"1","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"target","target":"parent","effects":[{"type":"check","ability":["charisma"],"contestAbility":["charisma"],"success":[{"type":"remove_ieffect","removeParent":"always"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"One creature the dragon can see within 120 feet of it must succeed on a DC 15 Charisma saving throw or be banished to a dream plane, a different plane of existence the dragon has imagined into being. To escape, the creature must use its action to make a Charisma check contested by the dragon's. If the creature wins, it escapes the dream plane. Otherwise, the effect ends on initiative count 20 on the next round. When the effect ends, the creature reappears in the space it left or in the nearest unoccupied space if that one is occupied."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Green Dragon - Thorn Wall",
		"description": "",
		"automation": {"name":"Adult Green Dragon - Thorn Wall","automation":[{"type":"roll","dice":"4d8 [piercing]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"15","fail":[{"type":"damage","damage":"{damage}"}],"success":[]}],"meta":[]},{"type":"text","text":"A wall of tangled brush bristling with thorns springs into existence on a solid surface within 120 feet of the dragon. The wall is up to 60 feet long, 10 feet high, and 5 feet thick, and it blocks line of sight. When the wall appears, each creature in its area must make a DC 15 Dexterity saving throw. A creature that fails the save takes 18 (4d8) piercing damage and is pushed 5 feet out of the wall's space, appearing on whichever side of the wall it wants."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Green Dragon - Grasping Vines",
		"description": "",
		"automation": {"name":"Adult Green Dragon - Grasping Vines","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"str","dc":"15","fail":[{"type":"ieffect2","name":"Restrained","effects":{"attack_advantage":-1,"save_dis":["dex"]},"buttons":[{"label":"Escape Vines","verb":"attempts to escape the vines","style":"1","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"target","target":"self","effects":[{"type":"check","ability":["strength"],"dc":"15","success":[{"type":"remove_ieffect","removeParent":null}],"fail":[],"contestTie":"neither"}]}]}]}],"success":[]}]},{"type":"text","text":"Grasping roots and vines erupt in a 20-foot radius centered on a point on the ground that the dragon can see within 120 feet of it. That area becomes difficult terrain, and each creature there must succeed on a DC 15 Strength saving throw or be restrained by the roots and vines. A creature can be freed if it or another creature takes an action to make a DC 15 Strength check and succeeds. The roots and vines wilt away when the dragon uses this lair action again or when the dragon dies."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Green Dragon - Fog",
		"description": "",
		"automation": {"name":"Adult Green Dragon - Fog","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"wis","dc":"15","fail":[{"type":"ieffect2","name":"Charmed","duration":2,"desc":"Charmed by {{caster.name}}"}],"success":[]}]},{"type":"text","text":"Magical fog billows around one creature the dragon can see within 120 feet of it. The creature must succeed on a DC 15 Wisdom saving throw or be charmed by the dragon until initiative count 20 on the next round."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Red Dragon - Magma Geyser",
		"description": "",
		"automation": {"name":"Adult Red Dragon - Magma Geyser","automation":[{"type":"roll","dice":"6d6 [fire]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"15","fail":[{"type":"damage","damage":"{damage}"}],"success":[{"type":"damage","damage":"({damage}) / 2"}]}],"meta":[]},{"type":"text","text":"Magma erupts from a point on the ground the dragon can see within 120 feet of it, creating a 20-foot-high, 5-foot-radius geyser. Each creature in the geyser's area must make a DC 15 Dexterity saving throw, taking 21 (6d6) fire damage on a failed save, or half as much damage on a successful one."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Red Dragon - Tremor",
		"description": "",
		"automation": {"name":"Adult Red Dragon - Tremor","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"15","fail":[{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}],"success":[]}]},{"type":"text","text":"A tremor shakes the lair in a 60-foot radius around the dragon. Each creature other than the dragon on the ground in that area must succeed on a DC 15 Dexterity saving throw or be knocked prone."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Red Dragon - Volcanic Gases",
		"description": "",
		"automation": {"name":"Adult Red Dragon - Volcanic Gases","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"13","fail":[{"type":"ieffect2","name":"Poisoned (Incapacitated)","duration":1,"effects":{"attack_advantage":-1,"check_dis":["all"]},"end":true,"desc":""}],"success":[]}]},{"type":"text","text":"Volcanic gases form a cloud in a 20-foot-radius sphere centered on a point the dragon can see within 120 feet of it. The sphere spreads a round corners, and its area is lightly obscured. It lasts until initiative count 20 on the next round. Each creature that starts its turn in the cloud must succeed on a DC 13 Constitution saving throw or be poisoned until the end of its turn. While poisoned in this way, a creature is incapacitated."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult Silver Dragon - Paralyzing Breath",
		"description": "",
		"automation": {"name":"Adult Silver Dragon - Paralyzing Breath","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Breath Weapon Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 5","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Breath Weapon!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Breath Weapon!"}],"errorBehaviour":"false"}],"label":"Recharge Breath Weapon","verb":"attempts to recharge their Breath Weapon","style":"3"}]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"20","fail":[{"type":"ieffect2","name":"Paralyzed","duration":10,"desc":"They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of each of its turns, ending the effect on a success","buttons":[{"label":"Resist Paralysis","verb":"attempts to resist Paralysis","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"con","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"The dragon exhales paralyzing gas in a 60-foot cone. Each creature in that area must succeed on a DC 20 Constitution saving throw or be paralyzed for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."}],"_v":2,"verb":"unleashes their","proper":true}
	},
	{
		"name": "Adult Silver Dragon - Chilling Winds",
		"description": "",
		"automation": {"name":"Adult Silver Dragon - Chilling Winds","automation":[{"type":"roll","dice":"1d10 [cold]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"15","fail":[{"type":"damage","damage":"{damage}"}],"success":[]}],"meta":[]},{"type":"text","text":"A blisteringly cold wind blows through the lair near the dragon. Each creature within 120 feet of the dragon must succeed on a DC 15 Constitution saving throw or take 5 (1d10) cold damage. Gases and vapors are dispersed by the wind, and unprotected flames are extinguished. Protected flames, such as lanterns, have a 50 percent chance of being extinguished."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult White Dragon - Freezing Fog",
		"description": "",
		"automation": {"name":"Adult White Dragon - Freezing Fog","automation":[{"type":"roll","dice":"3d6 [cold]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"10","fail":[{"type":"damage","damage":"{damage}"}],"success":[{"type":"damage","damage":"({damage}) / 2"}]},{"type":"ieffect2","name":"In the Freezing Fog","duration":1,"desc":"Target takes 3d6 cold if it ends its turn in the fog","effects":null,"attacks":null,"buttons":[{"label":"Leave Freezing Fog","verb":"leaves the range of Freezing Fog","style":"3","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"remove_ieffect","removeParent":null}]},{"label":"Freezing Fog Damage","verb":"takes damage from the Freezing Fog","style":"4","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"target","target":"self","effects":[{"type":"damage","damage":"3d6 [cold]","overheal":false,"cantripScale":false}]},{"type":"text","text":"A creature that ends its turn in the fog takes 10 (3d6) cold damage."}]}],"end":true,"conc":false,"stacking":false,"parent":null}],"meta":[]},{"type":"text","text":"Freezing fog fills a 20-foot-radius sphere centered on a point the dragon can see within 120 feet of it. The fog spreads around corners, and its area is heavily obscured. Each creature in the fog when it appears must make a DC 10 Constitution saving throw, taking 10 (3d6) cold damage on a failed save, or half as much damage on a successful one. A creature that ends its turn in the fog takes 10 (3d6) cold damage. A wind of at least 20 miles per hour disperses the fog. The fog otherwise lasts until the dragon uses this lair action again or until the dragon dies."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Adult White Dragon - Ice Shards",
		"description": "",
		"automation": {"name":"Adult White Dragon - Ice Shards","automation":[{"type":"target","target":"each","effects":[{"type":"attack","attackBonus":"7","hit":[{"type":"damage","damage":"3d6 [piercing]"}],"miss":[]}]},{"type":"text","text":"Jagged ice shards fall from the ceiling, striking up to three creatures underneath that the dragon can see within 120 feet of it. The dragon makes one ranged attack roll (+7 to hit) against each target. On a hit, the target takes 10 (3d6) piercing damage."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Air Elemental - Whirlwind (Creature)",
		"description": "",
		"automation": {"name":"Air Elemental - Whirlwind (Creature)","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Whirlwind Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 4","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Whirlwind!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Whirlwind!"}],"errorBehaviour":"false"}],"label":"Recharge Whirlwind","verb":"attempts to recharge their Whirlwind","style":"3"}]}],"sortBy":null},{"type":"roll","dice":"3d8 + 2 [bludgeoning]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"str","dc":"13","fail":[{"type":"damage","damage":"{damage}"},{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}],"success":[{"type":"damage","damage":"({damage}) / 2"}]}],"meta":[]},{"type":"text","text":"Each creature in the elemental's space must make a DC 13 Strength saving throw. On a failure, a target takes 15 (3d8 + 2) bludgeoning damage and is flung up 20 feet away from the elemental in a random direction and knocked prone. If a thrown target strikes an object, such as a wall or floor, the target takes 3 (1d6) bludgeoning damage for every 10 feet it was thrown. If the target is thrown at another creature, that creature must succeed on a DC 13 Dexterity saving throw or take the same damage and be knocked prone.\nIf the saving throw is successful, the target takes half the bludgeoning damage and isn't flung away or knocked prone."}],"_v":2}
	},
	{
		"name": "Air Elemental - Whirlwind (Object)",
		"description": "",
		"automation": {"name":"Air Elemental - Whirlwind (Object)","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Whirlwind Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 4","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Whirlwind!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Whirlwind!"}],"errorBehaviour":"false"}],"label":"Recharge Whirlwind","verb":"attempts to recharge their Whirlwind","style":"3"}]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"damage","damage":"1d6 [bludgeoning]"}]},{"type":"text","text":"Each creature in the elemental's space must make a DC 13 Strength saving throw. On a failure, a target takes 15 (3d8 + 2) bludgeoning damage and is flung up 20 feet away from the elemental in a random direction and knocked prone. If a thrown target strikes an object, such as a wall or floor, the target takes 3 (1d6) bludgeoning damage for every 10 feet it was thrown. If the target is thrown at another creature, that creature must succeed on a DC 13 Dexterity saving throw or take the same damage and be knocked prone.\nIf the saving throw is successful, the target takes half the bludgeoning damage and isn't flung away or knocked prone."}],"_v":2}
	},
	{
		"name": "Androsphinx - First Roar",
		"description": "",
		"automation": {"name":"Androsphinx - First Roar","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Roar Used","stacking":true,"buttons":[]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"save","stat":"wis","dc":"18","fail":[{"type":"ieffect2","name":"Frightened","duration":10,"desc":"Frightened of {{caster.name}}\n - Target can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of each of its turns, ending the effect on itself on a success","buttons":[{"label":"Resist Fear","verb":"attempts to resist Fear","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"wis","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"The sphinx emits a magical roar. Each time it roars before finishing a long rest, the roar is louder and the effect is different, as detailed below. Each creature within 500 feet of the sphinx and able to hear the roar must make a saving throw.\n**First Roar.** Each creature that fails a DC 18 Wisdom saving throw is frightened for 1 minute. A frightened creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."}],"_v":2,"verb":"lets out their","proper":true}
	},
	{
		"name": "Androsphinx - Second Roar",
		"description": "",
		"automation": {"name":"Androsphinx - Second Roar","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Roar Used","stacking":true,"buttons":[]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"save","stat":"wis","dc":"18","fail":[{"type":"ieffect2","name":"Deafened, Frightened, Paralyzed","duration":10,"desc":"Frightened of {{caster.name}}\n - They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of each of its turns, ending the effect on a success","buttons":[{"label":"Resist Fear","verb":"attempts to resist Fear","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"wis","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"The sphinx emits a magical roar. Each time it roars before finishing a long rest, the roar is louder and the effect is different, as detailed below. Each creature within 500 feet of the sphinx and able to hear the roar must make a saving throw.\n**Second Roar.** Each creature that fails a DC 18 Wisdom saving throw is deafened and frightened for 1 minute. A frightened creature is paralyzed and can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."}],"_v":2,"verb":"lets out their","proper":true}
	},
	{
		"name": "Androsphinx - Third Roar",
		"description": "",
		"automation": {"name":"Androsphinx - Third Roar","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Roar Used","stacking":true,"buttons":[]}],"sortBy":null},{"type":"roll","dice":"8d10 [thunder]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"18","fail":[{"type":"damage","damage":"{damage}"},{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}],"success":[{"type":"damage","damage":"({damage}) / 2"}]}],"meta":[]},{"type":"text","text":"The sphinx emits a magical roar. Each time it roars before finishing a long rest, the roar is louder and the effect is different, as detailed below. Each creature within 500 feet of the sphinx and able to hear the roar must make a saving throw.\n**Third Roar.** Each creature makes a DC 18 Constitution saving throw. On a failed save, a creature takes 44 (8d10) thunder damage and is knocked prone. On a successful save, the creature takes half as much damage and isn't knocked prone."}],"_v":2,"verb":"lets out their","proper":true}
	},
	{
		"name": "Androsphinx - Alter Time",
		"description": "",
		"automation": {"name":"Androsphinx - Alter Time","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"15","fail":[],"success":[]}]},{"type":"text","text":"The effects of time are altered such that every creature in the lair must succeed on a DC 15 Constitution saving throw or become 1d20 years older or younger (the sphinx's choice), but never any younger than 1 year old. A greater restoration spell can restore a creature's age to normal."}],"_v":2,"verb":"uses","proper":true,"activation_type":11}
	},
	{
		"name": "Ankheg - Acid Spray",
		"description": "",
		"automation": {"name":"Ankheg - Acid Spray","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Acid Spray Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 6","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Acid Spray!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Acid Spray!"}],"errorBehaviour":"false"}],"label":"Recharge Acid Spray","verb":"attempts to recharge their Acid Spray","style":"3"}]}],"sortBy":null},{"type":"roll","dice":"3d6 [acid]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"13","fail":[{"type":"damage","damage":"{damage}"}],"success":[{"type":"damage","damage":"({damage}) / 2"}]}],"meta":[]},{"type":"text","text":"The ankheg spits acid in a line that is 30 ft. long and 5 ft. wide, provided that it has no creature grappled. Each creature in that line must make a DC 13 Dexterity saving throw, taking 10 (3d6) acid damage on a failed save, or half as much damage on a successful one."}],"_v":2,"verb":"releases"}
	},
	{
		"name": "Ankheg - Bite",
		"description": "",
		"automation": {"name":"Ankheg - Bite","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d6 + 3 [slashing] + 1d6 [acid]"},{"type":"ieffect2","name":"Grappled","duration":null,"desc":"Grappled by {{caster.name}}\n - Escape DC 13","effects":null,"attacks":null,"buttons":[{"label":"Escape Grapple","verb":"tries to escape","automation":[{"type":"target","target":"self","effects":[{"type":"check","ability":["acrobatics","athletics"],"dc":"13","success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}]},{"type":"text","text":"A creature grappled by the monster can use its action to try to escape. To do so, it must succeed on a Strength (Athletics) or Dexterity (Acrobatics) check against the escape DC in the monster's stat block."}]}],"end":false,"conc":false,"stacking":false,"save_as":"grapple"}],"miss":[],"attackBonus":"5"}]},{"type":"condition","condition":"lastAttackDidHit and any(targets)","onTrue":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Latched On","duration":null,"desc":"Can only bite {{targets[0].name if str(targets[0])!=targets[0] else targets[0]}}","effects":{"attack_advantage":1},"attacks":[{"attack":{"name":"Unrelenting Bite","automation":[{"type":"target","target":"parent","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d6 + 3 [slashing] + 1d6 [acid]"}],"miss":[],"attackBonus":"5","adv":1}]},{"type":"text","text":"*Melee Weapon Attack:* +5 to hit, reach 5 ft., one target. *Hit:* 10 (2d6 + 3) slashing damage plus 3 (1d6) acid damage. If the target is a Large or smaller creature, it is grappled (escape DC 13). Until this grapple ends, the ankheg can bite only the grappled creature and has advantage on attack rolls to do so."}],"_v":2},"defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null}],"buttons":null,"end":false,"conc":false,"stacking":false,"parent":"grapple"}]}],"onFalse":[],"errorBehaviour":"false"},{"type":"text","text":"*Melee Weapon Attack:* +5 to hit, reach 5 ft., one target. *Hit:* 10 (2d6 + 3) slashing damage plus 3 (1d6) acid damage. If the target is a Large or smaller creature, it is grappled (escape DC 13). Until this grapple ends, the ankheg can bite only the grappled creature and has advantage on attack rolls to do so."}],"_v":2}
	},
	{
		"name": "Assassin - Sneak Attack",
		"description": "",
		"automation": {"name":"Assassin - Sneak Attack","automation":[{"type":"target","target":"each","effects":[{"type":"damage","damage":"4d6 [piercing]","overheal":false,"cantripScale":false}],"sortBy":null},{"type":"text","text":"Once per turn, the assassin deals an extra 14 (4d6) damage when it hits a target with a weapon attack and has advantage on the attack roll, or when the target is within 5 feet of an ally of the assassin that isn't incapacitated and the assassin doesn't have disadvantage on the attack roll."}],"_v":2,"verb":null,"proper":false,"activation_type":8}
	},
	{
		"name": "Azer - Heated Body",
		"description": "",
		"automation": {"name":"Azer - Heated Body","automation":[{"type":"target","target":"each","effects":[{"type":"damage","damage":"1d10 [fire]"}]},{"type":"text","text":"A creature that touches the azer or hits it with a melee attack while within 5 feet of it takes 5 (1d10) fire damage."}],"_v":2,"verb":"has","activation_type":8}
	},
	{
		"name": "Balor - Death Throes",
		"description": "",
		"automation": {"name":"Balor - Death Throes","automation":[{"type":"roll","dice":"20d6 [fire]","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"20","fail":[{"type":"damage","damage":"{damage}"}],"success":[{"type":"damage","damage":"({damage}) / 2"}]}],"meta":[]},{"type":"text","text":"When the balor dies, it explodes, and each creature within 30 feet of it must make a DC 20 Dexterity saving throw, taking 70 (20d6) fire damage on a failed save, or half as much damage on a successful one. The explosion ignites flammable objects in that area that aren't being worn or carried, and it destroys the balor's weapons."}],"_v":2,"verb":"explodes in their","proper":true,"activation_type":8}
	},
	{
		"name": "Balor - Fire Aura",
		"description": "",
		"automation": {"name":"Balor - Fire Aura","automation":[{"type":"target","target":"each","effects":[{"type":"damage","damage":"3d6 [fire]"}]},{"type":"text","text":"At the start of each of the balor's turns, each creature within 5 feet of it takes 10 (3d6) fire damage, and flammable objects in the aura that aren't being worn or carried ignite. A creature that touches the balor or hits it with a melee attack while within 5 feet of it takes 10 (3d6) fire damage."}],"_v":2,"verb":"exudes","activation_type":8}
	},
	{
		"name": "Balor - Longsword",
		"description": "",
		"automation": {"name":"Balor - Longsword","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"3d8 + 8 [magical slashing] + 3d8 [lightning]"}],"miss":[],"attackBonus":"14"}]},{"type":"text","text":"*Melee Weapon Attack:* +14 to hit, reach 10 ft., one target. *Hit:* 21 (3d8 + 8) slashing damage plus 13 (3d8) lightning damage. If the balor scores a critical hit, it rolls damage dice three times, instead of twice."}],"_v":2,"extra_crit_damage":"3d8 [magical slashing] + 3d8 [lightning]"}
	},
	{
		"name": "Barbed Devil - Barbed Hide",
		"description": "",
		"automation": {"name":"Barbed Devil - Barbed Hide","automation":[{"type":"target","target":"each","effects":[{"type":"damage","damage":"1d10 [piercing]"}]},{"type":"text","text":"At the start of each of its turns, the barbed devil deals 5 (1d10) piercing damage to any creature grappling it."}],"_v":2,"verb":"has","activation_type":8}
	},
	{
		"name": "Basilisk - Petrifying Gaze",
		"description": "",
		"automation": {"name":"Basilisk - Petrifying Gaze","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"12","fail":[{"type":"ieffect2","name":"Restrained (Petrifying)","effects":{"attack_advantage":-1,"save_dis":["dex"]},"desc":"They must repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of its next turn, ending the effect on a success\n - On a failure, the target is petrified","buttons":[{"label":"Resist Petrification","verb":"attempts to resist Petrification","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"remove_ieffect","removeParent":"if_no_children"},{"type":"save","stat":"con","dc":null,"success":[],"fail":[{"type":"ieffect2","name":"Petrified","duration":null,"desc":"","effects":null,"attacks":null,"buttons":null,"end":false,"conc":false,"stacking":false,"parent":null}]}],"sortBy":null},{"type":"text","text":"It must repeat the saving throw at the end of its next turn. On a success, the effect ends. On a failure, the creature is petrified until freed by the greater restoration spell or other magic."}]}]}],"success":[]}]},{"type":"text","text":"If a creature starts its turn within 30 feet of the basilisk and the two of them can see each other, the basilisk can force the creature to make a DC 12 Constitution saving throw if the basilisk isn't incapacitated. On a failed save, the creature magically begins to turn to stone and is restrained. It must repeat the saving throw at the end of its next turn. On a success, the effect ends. On a failure, the creature is petrified until freed by the greater restoration spell or other magic.\nA creature that isn't surprised can avert its eyes to avoid the saving throw at the start of its turn. If it does so, it can't see the basilisk until the start of its next turn, when it can avert its eyes again. If it looks at the basilisk in the meantime, it must immediately make the save.\nIf the basilisk sees its reflection within 30 feet of it in bright light, it mistakes itself for a rival and targets itself with its gaze."}],"_v":2,"verb":"gives you","activation_type":8}
	},
	{
		"name": "Behir - Swallow",
		"description": "",
		"automation": {"name":"Behir - Swallow","automation":[{"type":"target","target":"each","effects":[{"type":"attack","attackBonus":"10","hit":[{"type":"damage","damage":"3d10 + 6 [piercing]","overheal":false,"cantripScale":false},{"type":"ieffect2","name":"Swallowed (Blinded, Restrained)","duration":null,"desc":"Swallowed by {{caster.name}}\n - Target takes 6d6 acid at the start of each of the behir's turns","effects":null,"attacks":null,"buttons":null,"end":false,"conc":false,"stacking":false,"save_as":"swallowed"}],"miss":[],"adv":"0"}],"sortBy":null},{"type":"condition","condition":"lastAttackDidHit and any(targets)","onTrue":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Full Stomach","duration":null,"desc":"Has {{targets[0].name if str(targets[0])!=targets[0] else targets[0]}} in its gullet\n - Deals 6d6 acid to the swallowed creature at the start of its turn\n - If they take 30+ damage on a single turn from the target, they must make a DC 14 Constitution saving throw or regurgitate the target","effects":null,"attacks":null,"buttons":[{"label":"Acidic Stomach","verb":"has a acidic stomach","style":"4","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"target","target":"parent","effects":[{"type":"damage","damage":"6d6 [acid]","overheal":false,"cantripScale":false}],"sortBy":null},{"type":"text","text":"While swallowed, the target is blinded and restrained, it has total cover against attacks and other effects outside the behir, and it takes 21 (6d6) acid damage at the start of each of the behir's turns. A behir can have only one creature swallowed at a time."}]},{"label":"Regurgitate","verb":"begins to regurgitate","style":"3","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"con","dc":"14","fail":[{"type":"remove_ieffect","removeParent":"always"}],"success":[]}]},{"type":"text","text":"If the behir takes 30 damage or more on a single turn from the swallowed creature, the behir must succeed on a DC 14 Constitution saving throw at the end of that turn or regurgitate the creature, which falls prone in a space within 10 feet of the behir. If the behir dies, a swallowed creature is no longer restrained by it and can escape from the corpse by using 15 feet of movement, exiting prone."}]}],"end":false,"conc":false,"stacking":true,"parent":"swallowed"}]}],"onFalse":[],"errorBehaviour":"false"},{"type":"text","text":"The behir makes one bite attack against a Medium or smaller target it is grappling. If the attack hits, the target is also swallowed, and the grapple ends. While swallowed, the target is blinded and restrained, it has total cover against attacks and other effects outside the behir, and it takes 21 (6d6) acid damage at the start of each of the behir's turns. A behir can have only one creature swallowed at a time.\n\nIf the behir takes 30 damage or more on a single turn from the swallowed creature, the behir must succeed on a DC 14 Constitution saving throw at the end of that turn or regurgitate the creature, which falls prone in a space within 10 feet of the behir. If the behir dies, a swallowed creature is no longer restrained by it and can escape from the corpse by using 15 feet of movement, exiting prone."}],"_v":2,"verb":"attempts to","proper":true,"activation_type":null}
	},
	{
		"name": "Behir - Constrict",
		"description": "",
		"automation": {"name":"Behir - Constrict","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"(2d10 + 6 [bludgeoning]) + (2d10 + 6 [slashing])"},{"type":"ieffect2","name":"Grappled (Restrained)","duration":null,"desc":"Grappled by {{caster.name}}\n - Escape DC 16","effects":{"attack_advantage":-1,"save_dis":["dex"]},"attacks":null,"buttons":[{"label":"Escape Grapple","verb":"tries to escape","automation":[{"type":"target","target":"self","effects":[{"type":"check","ability":["acrobatics","athletics"],"dc":"16","success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}]},{"type":"text","text":"A creature grappled by the monster can use its action to try to escape. To do so, it must succeed on a Strength (Athletics) or Dexterity (Acrobatics) check against the escape DC in the monster's stat block."}]}],"end":false,"conc":false,"stacking":false,"save_as":"grapple"}],"miss":[],"attackBonus":"10"}]},{"type":"text","text":"*Melee Weapon Attack:* +10 to hit, reach 5 ft., one Large or smaller creature. *Hit:* 17 (2d10 + 6) bludgeoning damage plus 17 (2d10 + 6) slashing damage. The target is grappled (escape DC 16) if the behir isn't already constricting a creature, and the target is restrained until this grapple ends."}],"_v":2,"verb":"attempts to","proper":true}
	},
	{
		"name": "Berserker - Reckless",
		"description": "",
		"automation": {"name":"Berserker - Reckless","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Attacked Recklessly","duration":1,"desc":"All attacks made against them until the start of their next turn have advantage","effects":{"attack_advantage":1},"attacks":null,"buttons":null,"end":false,"conc":false,"stacking":false,"parent":null}]},{"type":"text","text":"At the start of its turn, the berserker can gain advantage on all melee weapon attack rolls during that turn, but attack rolls against it have advantage until the start of its next turn."}],"_v":2,"verb":"is","proper":true,"activation_type":8}
	},
	{
		"name": "Black Pudding - Corrosive Form",
		"description": "",
		"automation": {"name":"Black Pudding - Corrosive Form","automation":[{"type":"target","target":"each","effects":[{"type":"damage","damage":"1d8 [acid]"}]},{"type":"text","text":"A creature that touches the pudding or hits it with a melee attack while within 5 feet of it takes 4 (1d8) acid damage. Any nonmagical weapon made of metal or wood that hits the pudding corrodes. After dealing damage, the weapon takes a permanent and cumulative -1 penalty to damage rolls. If its penalty drops to -5, the weapon is destroyed. Nonmagical ammunition made of metal or wood that hits the pudding is destroyed after dealing damage. The pudding can eat through 2-inch-thick, nonmagical wood or metal in 1 round."}],"_v":2,"verb":"has","activation_type":8}
	},
	{
		"name": "Black Pudding - Pseudopod",
		"description": "",
		"automation": {"name":"Black Pudding - Pseudopod","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"1d6 + 3 [bludgeoning] + 4d8 [acid]"}],"miss":[],"attackBonus":"5"}]},{"type":"text","text":"*Melee Weapon Attack:* +5 to hit, reach 5 ft., one target. *Hit:* 6 (1d6 + 3) bludgeoning damage plus 18 (4d8) acid damage. In addition, nonmagical armor worn by the target is partly dissolved and takes a permanent and cumulative -1 penalty to the AC it offers. The armor is destroyed if the penalty reduces its AC to 10."}],"_v":2}
	},
	{
		"name": "Blink Dog - Teleport",
		"description": "",
		"automation": {"name":"Blink Dog - Teleport","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Teleport Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 4","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Teleport!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Teleport!"}],"errorBehaviour":"false"}],"label":"Recharge Teleport","verb":"attempts to recharge their Teleport","style":"3"}]}],"sortBy":null},{"type":"text","text":"The dog magically teleports, along with any equipment it is wearing or carrying, up to 40 feet to an unoccupied space it can see. Before or after teleporting, the dog can make one bite attack."}],"_v":2,"verb":"uses","proper":true,"activation_type":null}
	},
	{
		"name": "Boar - Charge",
		"description": "",
		"automation": {"name":"Boar - Charge","automation":[{"type":"target","target":"each","effects":[{"type":"damage","damage":"1d6 [slashing]"},{"type":"save","stat":"str","dc":"11","fail":[{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}],"success":[]}]},{"type":"text","text":"If the boar moves at least 20 ft. straight toward a target and then hits it with a tusk attack on the same turn, the target takes an extra 3 (1d6) slashing damage. If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone."}],"_v":2,"verb":"rushes forward with","activation_type":8}
	},
	{
		"name": "Boar - Relentless",
		"description": "",
		"automation": {"name":"Boar - Relentless","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Relentless Used","stacking":true,"buttons":[]},{"type":"damage","damage":"{caster.hp-1} [fortitude]","overheal":false,"cantripScale":false}],"sortBy":null},{"type":"text","text":"If the boar takes 7 damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead."}],"_v":2,"verb":"is","proper":true,"activation_type":8}
	},
	{
		"name": "Bone Devil - Sting",
		"description": "",
		"automation": {"name":"Bone Devil - Sting","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d8 + 4 [piercing] + 5d6 [poison]"},{"type":"save","stat":"con","dc":"14","fail":[{"type":"ieffect2","name":"Poisoned","duration":10,"effects":{"attack_advantage":-1,"check_dis":["all"]},"desc":"Disadvantage on attack rolls and ability checks\n - They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of each of its turns, ending the effect on a success","buttons":[{"label":"Resist Poison","verb":"attempts to resist Poison","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"con","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}],"miss":[],"attackBonus":"8"}]},{"type":"text","text":"*Melee Weapon Attack:* +8 to hit, reach 10 ft., one target. *Hit:* 13 (2d8 + 4) piercing damage plus 17 (5d6) poison damage, and the target must succeed on a DC 14 Constitution saving throw or become poisoned for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."}],"_v":2}
	},
	{
		"name": "Bulette - Deadly Leap (Dexterity)",
		"description": "",
		"automation": {"name":"Bulette - Deadly Leap (Dexterity)","automation":[{"type":"roll","dice":"(3d6 + 4 [bludgeoning]) + (3d6 + 4 [slashing])","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"16","fail":[{"type":"damage","damage":"{damage}"},{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}],"success":[{"type":"damage","damage":"({damage}) / 2"}]}],"meta":[]},{"type":"text","text":"If the bulette jumps at least 15 ft. as part of its movement, it can then use this action to land on its feet in a space that contains one or more other creatures. Each of those creatures must succeed on a DC 16 Strength or Dexterity saving throw (target's choice) or be knocked prone and take 14 (3d6 + 4) bludgeoning damage plus 14 (3d6 + 4) slashing damage. On a successful save, the creature takes only half the damage, isn't knocked prone, and is pushed 5 ft. out of the bulette's space into an unoccupied space of the creature's choice. If no unoccupied space is within range, the creature instead falls prone in the bulette's space."}],"_v":2,"verb":"launches forward with"}
	},
	{
		"name": "Bulette - Deadly Leap (Strength)",
		"description": "",
		"automation": {"name":"Bulette - Deadly Leap (Strength)","automation":[{"type":"roll","dice":"(3d6 + 4 [bludgeoning]) + (3d6 + 4 [slashing])","name":"damage"},{"type":"target","target":"each","effects":[{"type":"save","stat":"str","dc":"16","fail":[{"type":"damage","damage":"{damage}"},{"type":"ieffect2","name":"Prone","duration":-1,"effects":{"attack_advantage":-1},"desc":"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition","buttons":[{"automation":[{"type":"remove_ieffect","removeParent":null}],"label":"Stand Up","verb":"stands up"}]}],"success":[{"type":"damage","damage":"({damage}) / 2"}]}],"meta":[]},{"type":"text","text":"If the bulette jumps at least 15 ft. as part of its movement, it can then use this action to land on its feet in a space that contains one or more other creatures. Each of those creatures must succeed on a DC 16 Strength or Dexterity saving throw (target's choice) or be knocked prone and take 14 (3d6 + 4) bludgeoning damage plus 14 (3d6 + 4) slashing damage. On a successful save, the creature takes only half the damage, isn't knocked prone, and is pushed 5 ft. out of the bulette's space into an unoccupied space of the creature's choice. If no unoccupied space is within range, the creature instead falls prone in the bulette's space."}],"_v":2,"verb":"launches forward with"}
	},
	{
		"name": "Chain Devil - Chain",
		"description": "",
		"automation": {"name":"Chain Devil - Chain","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d6 + 4 [slashing]"},{"type":"ieffect2","name":"Grappled (Restrained)","duration":null,"desc":"Grappled by {{caster.name}}\n - Escape DC 14\n - Target takes 2d6 piercing at the start of its turns","effects":{"attack_advantage":-1,"save_dis":["dex"]},"attacks":null,"buttons":[{"label":"Escape Grapple","verb":"tries to escape","automation":[{"type":"target","target":"self","effects":[{"type":"check","ability":["acrobatics","athletics"],"dc":"14","success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}]},{"type":"text","text":"A creature grappled by the monster can use its action to try to escape. To do so, it must succeed on a Strength (Athletics) or Dexterity (Acrobatics) check against the escape DC in the monster's stat block."}]},{"label":"Chain Damage","verb":"takes damage from the chains","style":"4","automation":[{"type":"target","target":"self","effects":[{"type":"damage","damage":"2d6 [piercing]","overheal":false,"cantripScale":false}]},{"type":"text","text":"Until this grapple ends, the target is restrained and takes 7 (2d6) piercing damage at the start of each of its turns."}]}],"end":false,"conc":false,"stacking":false,"save_as":"grapple"}],"miss":[],"attackBonus":"8"}]},{"type":"text","text":"*Melee Weapon Attack:* +8 to hit, reach 10 ft., one target. *Hit:* 11 (2d6 + 4) slashing damage. The target is grappled (escape DC 14) if the devil isn't already grappling a creature. Until this grapple ends, the target is restrained and takes 7 (2d6) piercing damage at the start of each of its turns."}],"_v":2}
	},
	{
		"name": "Chain Devil - Unnerving Mask",
		"description": "",
		"automation": {"name":"Chain Devil - Unnerving Mask","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"wis","dc":"14","fail":[{"type":"ieffect2","name":"Frightened","duration":1,"end":true,"desc":"Frightened of {{caster.name}}"}],"success":[]}]},{"type":"text","text":"When a creature the devil can see starts its turn within 30 feet of the devil, the devil can create the illusion that it looks like one of the creature's departed loved ones or bitter enemies. If the creature can see the devil, it must succeed on a DC 14 Wisdom saving throw or be frightened until the end of its turn."}],"_v":2,"verb":"has","activation_type":4}
	},
	{
		"name": "Chuul - Pincer",
		"description": "",
		"automation": {"name":"Chuul - Pincer","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d6 + 4 [bludgeoning]"},{"type":"ieffect2","name":"Grappled","duration":null,"desc":"Grappled by {{caster.name}}\n - Escape DC 14","effects":null,"attacks":null,"buttons":[{"label":"Escape Grapple","verb":"tries to escape","automation":[{"type":"target","target":"self","effects":[{"type":"check","ability":["acrobatics","athletics"],"dc":"14","success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}]},{"type":"text","text":"A creature grappled by the monster can use its action to try to escape. To do so, it must succeed on a Strength (Athletics) or Dexterity (Acrobatics) check against the escape DC in the monster's stat block."}]}],"end":false,"conc":false,"stacking":false,"save_as":"grapple"}],"miss":[],"attackBonus":"6"}]},{"type":"text","text":"*Melee Weapon Attack:* +6 to hit, reach 10 ft., one target. *Hit:* 11 (2d6 + 4) bludgeoning damage. The target is grappled (escape DC 14) if it is a Large or smaller creature and the chuul doesn't have two other creatures grappled."}],"_v":2}
	},
	{
		"name": "Chuul - Tentacles",
		"description": "",
		"automation": {"name":"Chuul - Tentacles","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"13","fail":[{"type":"ieffect2","name":"Poisoned (Paralyzed)","duration":10,"effects":{"attack_advantage":-1,"check_dis":["all"]},"desc":"They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of each of its turns, ending the effect on a success","buttons":[{"label":"Resist Poison","verb":"attempts to resist Poison","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"con","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"One creature grappled by the chuul must succeed on a DC 13 Constitution saving throw or be poisoned for 1 minute. Until this poison ends, the target is paralyzed. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."}],"_v":2,"proper":true}
	},
	{
		"name": "Clay Golem - Slam",
		"description": "",
		"automation": {"name":"Clay Golem - Slam","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d10 + 5 [magical bludgeoning]"},{"type":"save","stat":"con","dc":"15","fail":[{"type":"ieffect2","name":"Drained","effects":{"max_hp_bonus":"-lastDamage"},"stacking":true}],"success":[]}],"miss":[],"attackBonus":"8"}]},{"type":"text","text":"*Melee Weapon Attack:* +8 to hit, reach 5 ft., one target. *Hit:* 16 (2d10 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 15 Constitution saving throw or have its hit point maximum reduced by an amount equal to the damage taken. The target dies if this attack reduces its hit point maximum to 0. The reduction lasts until removed by the greater restoration spell or other magic."}],"_v":2}
	},
	{
		"name": "Clay Golem - Haste",
		"description": "",
		"automation": {"name":"Clay Golem - Haste","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Haste Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 5","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Haste!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Haste!"}],"errorBehaviour":"false"}],"label":"Recharge Haste","verb":"attempts to recharge their Haste","style":"3"}]},{"type":"ieffect2","name":"Haste","duration":2,"effects":{"save_bonus":"2","save_adv":["dex"]},"end":true,"desc":"The golem can use its slam attack as a bonus action"}]},{"type":"text","text":"Until the end of its next turn, the golem magically gains a +2 bonus to its AC, has advantage on Dexterity saving throws, and can use its slam attack as a bonus action."}],"_v":2,"verb":"uses","proper":true,"activation_type":1}
	},
	{
		"name": "Clay Golem - Berserk",
		"description": "",
		"automation": {"name":"Clay Golem - Berserk","automation":[{"type":"roll","dice":"1d6","name":"berserk chance","hidden":false,"cantripScale":false},{"type":"condition","condition":"lastRoll == 6","onTrue":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Berserk","duration":null,"desc":"The golem attacks the nearest creature it can see on each of its turns","effects":null,"attacks":null,"buttons":null,"end":false,"conc":false,"stacking":false,"parent":null}]}],"onFalse":[],"errorBehaviour":"false"},{"type":"text","text":"Whenever the golem starts its turn with 60 hit points or fewer, roll a d6. On a 6, the golem goes berserk. On each of its turns while berserk, the golem attacks the nearest creature it can see. If no creature is near enough to move to and attack, the golem attacks an object, with preference for an object smaller than itself. Once the golem goes berserk, it continues to do so until it is destroyed or regains all its hit points."}],"_v":2,"verb":"might go","proper":true,"activation_type":8}
	},
	{
		"name": "Cloaker - Bite",
		"description": "",
		"automation": {"name":"Cloaker - Bite","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d6 + 3 [piercing]"},{"type":"condition","condition":"lastAttackHadAdvantage > 0","onTrue":[{"type":"ieffect2","name":"Blinded (Cloaker)","duration":null,"desc":"{{caster.name}} is attached to the target\n - A creature can detach the cloaker by succeeding on a DC 16 Strength check","effects":null,"attacks":null,"buttons":[{"label":"Detach Cloaker","verb":"attempts to detach the cloaker","style":"3","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"check","ability":["strength"],"dc":"16","success":[{"type":"remove_ieffect","removeParent":null}],"fail":[]}]}],"end":false,"conc":false,"stacking":false,"save_as":"grapple"}],"onFalse":[],"errorBehaviour":"false"}],"miss":[],"attackBonus":"6"}]},{"type":"condition","condition":"lastAttackDidHit and lastAttackHadAdvantage and any(targets)","onTrue":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Latched On","duration":null,"desc":"Can only bite {{targets[0].name if str(targets[0])!=targets[0] else targets[0]}}","effects":{"attack_advantage":1},"attacks":[{"attack":{"name":"Unrelenting Bite","automation":[{"type":"target","target":"parent","effects":[{"type":"attack","hit":[{"type":"damage","damage":"2d6 + 3 [piercing]"}],"miss":[],"attackBonus":"6","adv":1}]},{"type":"text","text":"*Melee Weapon Attack:* +6 to hit, reach 5 ft., one creature. *Hit:* 10 (2d6 + 3) piercing damage, and if the target is Large or smaller, the cloaker attaches to it. If the cloaker has advantage against the target, the cloaker attaches to the target's head, and the target is blinded and unable to breathe while the cloaker is attached. While attached, the cloaker can make this attack only against the target and has advantage on the attack roll. The cloaker can detach itself by spending 5 feet of its movement. A creature, including the target, can take its action to detach the cloaker by succeeding on a DC 16 Strength check."}],"_v":2},"defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null}],"buttons":null,"end":false,"conc":false,"stacking":false,"parent":"grapple"}]}],"onFalse":[],"errorBehaviour":"false"},{"type":"text","text":"*Melee Weapon Attack:* +6 to hit, reach 5 ft., one creature. *Hit:* 10 (2d6 + 3) piercing damage, and if the target is Large or smaller, the cloaker attaches to it. If the cloaker has advantage against the target, the cloaker attaches to the target's head, and the target is blinded and unable to breathe while the cloaker is attached. While attached, the cloaker can make this attack only against the target and has advantage on the attack roll. The cloaker can detach itself by spending 5 feet of its movement. A creature, including the target, can take its action to detach the cloaker by succeeding on a DC 16 Strength check."}],"_v":2}
	},
	{
		"name": "Cloaker - Moan",
		"description": "",
		"automation": {"name":"Cloaker - Moan","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"wis","dc":"13","fail":[{"type":"ieffect2","name":"Frightened","duration":2,"desc":"Frightened of {{caster.name}}"}],"success":[]}]},{"type":"text","text":"Each creature within 60 feet of the cloaker that can hear its moan and that isn't an aberration must succeed on a DC 13 Wisdom saving throw or become frightened until the end of the cloaker's next turn. If a creature's saving throw is successful, the creature is immune to the cloaker's moan for the next 24 hours."}],"_v":2,"verb":"lets out"}
	},
	{
		"name": "Cloaker - Phantasms",
		"description": "",
		"automation": {"name":"Cloaker - Phantasms","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Phantasms Used","stacking":true,"buttons":[]},{"type":"ieffect2","name":"Phantasm","desc":"Roll randomly to determine if an attack or harmful spell will target a duplicate","stacking":true},{"type":"ieffect2","name":"Phantasm","stacking":true},{"type":"ieffect2","name":"Phantasm","stacking":true}],"sortBy":null},{"type":"text","text":"The cloaker magically creates three illusory duplicates of itself if it isn't in bright light. The duplicates move with it and mimic its actions, shifting position so as to make it impossible to track which cloaker is the real one. If the cloaker is ever in an area of bright light, the duplicates disappear.\n\nWhenever any creature targets the cloaker with an attack or a harmful spell while a duplicate remains, that creature rolls randomly to determine whether it targets the cloaker or one of the duplicates. A creature is unaffected by this magical effect if it can't see or if it relies on senses other than sight.\n\nA duplicate has the cloaker's AC and uses its saving throws. If an attack hits a duplicate, or if a duplicate fails a saving throw against an effect that deals damage, the duplicate disappears."}],"_v":2,"verb":"creates","proper":true,"activation_type":1}
	},
	{
		"name": "Cockatrice - Bite",
		"description": "",
		"automation": {"name":"Cockatrice - Bite","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"1d4 + 1 [piercing]"},{"type":"save","stat":"con","dc":"11","fail":[{"type":"ieffect2","name":"Restrained (Petrifying)","effects":{"attack_advantage":-1,"save_dis":["dex"]},"desc":"They must repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of its next turn, ending the effect on a success\n - On a failure, the target is petrified for 24 hours","buttons":[{"label":"Resist Petrification","verb":"attempts to resist Petrification","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"remove_ieffect","removeParent":"if_no_children"},{"type":"save","stat":"con","dc":null,"success":[],"fail":[{"type":"ieffect2","name":"Petrified","duration":14400}]}],"sortBy":null},{"type":"text","text":"It must repeat the saving throw at the end of its next turn. On a success, the effect ends. On a failure, the creature is petrified until freed by the greater restoration spell or other magic."}]}]}],"success":[]}],"miss":[],"attackBonus":"3"}]},{"type":"text","text":"*Melee Weapon Attack:* +3 to hit, reach 5 ft., one creature. *Hit:* 3 (1d4 + 1) piercing damage, and the target must succeed on a DC 11 Constitution saving throw against being magically petrified. On a failed save, the creature begins to turn to stone and is restrained. It must repeat the saving throw at the end of its next turn. On a success, the effect ends. On a failure, the creature is petrified for 24 hours."}],"_v":2}
	},
	{
		"name": "Couatl - Bite",
		"description": "",
		"automation": {"name":"Couatl - Bite","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"1d6 + 5 [magical piercing]"},{"type":"save","stat":"con","dc":"13","fail":[{"type":"ieffect2","name":"Poisoned (Unconscious)","duration":14400,"desc":"Another creature can use an action to shake the target awake","effects":{"attack_advantage":-1,"check_dis":["all"]},"attacks":null,"buttons":[{"label":"Shook Awake","verb":"wakes up","style":"3","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"remove_ieffect"},{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Poisoned","duration":"ieffect.remaining","effects":{"attack_advantage":-1,"check_dis":["all"]}}]},{"type":"text","text":"Another creature can use an action to shake the target awake."}]}],"end":false,"conc":false,"stacking":false,"parent":null}],"success":[]}],"miss":[],"attackBonus":"8"}]},{"type":"text","text":"*Melee Weapon Attack:* +8 to hit, reach 5 ft., one creature. *Hit:* 8 (1d6 + 5) piercing damage, and the target must succeed on a DC 13 Constitution saving throw or be poisoned for 24 hours. Until this poison ends, the target is unconscious. Another creature can use an action to shake the target awake."}],"_v":2}
	},
	{
		"name": "Darkmantle - Crush",
		"description": "",
		"automation": {"name":"Darkmantle - Crush","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"1d6 + 3 [bludgeoning]"},{"type":"condition","condition":"lastAttackHadAdvantage > 0","onTrue":[{"type":"ieffect2","name":"Blinded (Darkmantle)","duration":null,"desc":"{{caster.name}} is attached to the target\n - A creature can detach the darkmantle by succeeding on a DC 13 Strength check","effects":null,"attacks":null,"buttons":[{"label":"Detach Darkmantle","verb":"attempts to detach the darkmantle","style":"3","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"check","ability":["strength"],"dc":"13","success":[{"type":"remove_ieffect","removeParent":null}],"fail":[]}]}],"end":false,"conc":false,"stacking":false,"save_as":"grapple"}],"onFalse":[],"errorBehaviour":"false"}],"miss":[],"attackBonus":"5"}]},{"type":"condition","condition":"lastAttackDidHit and lastAttackHadAdvantage and any(targets)","onTrue":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Latched On","duration":null,"desc":"Can only bite {{targets[0].name if str(targets[0])!=targets[0] else targets[0]}}","effects":{"attack_advantage":1},"attacks":[{"attack":{"name":"Unrelenting Bite","automation":[{"type":"target","target":"parent","effects":[{"type":"attack","hit":[{"type":"damage","damage":"1d6 + 3 [piercing]"}],"miss":[],"attackBonus":"5","adv":1}]},{"type":"text","text":"*Melee Weapon Attack:* +5 to hit, reach 5 ft., one creature. *Hit:* 6 (1d6 + 3) bludgeoning damage, and the darkmantle attaches to the target. If the target is Medium or smaller and the darkmantle has advantage on the attack roll, it attaches by engulfing the target's head, and the target is also blinded and unable to breathe while the darkmantle is attached in this way.\nWhile attached to the target, the darkmantle can attack no other creature except the target but has advantage on its attack rolls. The darkmantle's speed also becomes 0, it can't benefit from any bonus to its speed, and it moves with the target.\nA creature can detach the darkmantle by making a successful DC 13 Strength check as an action. On its turn, the darkmantle can detach itself from the target by using 5 feet of movement."}],"_v":2},"defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null}],"buttons":null,"end":false,"conc":false,"stacking":false,"parent":"grapple"}]}],"onFalse":[],"errorBehaviour":"false"},{"type":"text","text":"*Melee Weapon Attack:* +5 to hit, reach 5 ft., one creature. *Hit:* 6 (1d6 + 3) bludgeoning damage, and the darkmantle attaches to the target. If the target is Medium or smaller and the darkmantle has advantage on the attack roll, it attaches by engulfing the target's head, and the target is also blinded and unable to breathe while the darkmantle is attached in this way.\nWhile attached to the target, the darkmantle can attack no other creature except the target but has advantage on its attack rolls. The darkmantle's speed also becomes 0, it can't benefit from any bonus to its speed, and it moves with the target.\nA creature can detach the darkmantle by making a successful DC 13 Strength check as an action. On its turn, the darkmantle can detach itself from the target by using 5 feet of movement."}],"_v":2}
	},
	{
		"name": "Darkmantle - Darkness Aura",
		"description": "",
		"automation": {"name":"Darkmantle - Darkness Aura","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Darkness Aura Used","stacking":true,"buttons":[]},{"type":"ieffect2","name":"Darkness Aura","duration":100,"desc":"","effects":null,"attacks":null,"buttons":null,"end":false,"conc":true,"stacking":false,"parent":null}],"sortBy":null},{"type":"text","text":"A 15-foot radius of magical darkness extends out from the darkmantle, moves with it, and spreads around corners. The darkness lasts as long as the darkmantle maintains concentration, up to 10 minutes (as if concentrating on a spell). Darkvision can't penetrate this darkness, and no natural light can illuminate it. If any of the darkness overlaps with an area of light created by a spell of 2nd level or lower, the spell creating the light is dispelled."}],"_v":2,"verb":"exudes","proper":false,"activation_type":1}
	},
	{
		"name": "Death Dog - Bite",
		"description": "",
		"automation": {"name":"Death Dog - Bite","automation":[{"type":"target","target":"each","effects":[{"type":"attack","hit":[{"type":"damage","damage":"1d6 + 2 [piercing]"},{"type":"save","stat":"con","dc":"12","fail":[{"type":"ieffect2","name":"Poisoned","effects":{"attack_advantage":-1,"check_dis":["all"]}}],"success":[]}],"miss":[],"attackBonus":"4"}]},{"type":"text","text":"*Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 5 (1d6 + 2) piercing damage. If the target is a creature, it must succeed on a DC 12 Constitution saving throw against disease or become poisoned until the disease is cured. Every 24 hours that elapse, the creature must repeat the saving throw, reducing its hit point maximum by 5 (1d10) on a failure. This reduction lasts until the disease is cured. The creature dies if the disease reduces its hit point maximum to 0."}],"_v":2}
	},
	{
		"name": "Deva - Healing Touch",
		"description": "",
		"automation": {"name":"Deva - Healing Touch","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Healing Touch Used","stacking":true,"buttons":[]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"damage","damage":"-(4d8 + 2) [heal]"}]},{"type":"text","text":"The deva touches another creature. The target magically regains 20 (4d8 + 2) hit points and is freed from any curse, disease, poison, blindness, or deafness."}],"_v":2,"verb":"reaches out with","activation_type":1}
	},
	{
		"name": "Djinni - Create Whirlwind",
		"description": "",
		"automation": {"name":"Djinni - Create Whirlwind","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Whirlwind","save_as":"parent","conc":true}]},{"type":"target","target":"each","effects":[{"type":"save","stat":"str","dc":"18","fail":[{"type":"ieffect2","name":"Restrained","effects":{"attack_advantage":-1,"save_dis":["dex"]},"buttons":[{"label":"Resist Whirlwind","verb":"attempts to resist the Whirlwind","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"check","ability":["strength"],"dc":"18","success":[{"type":"remove_ieffect","removeParent":null}],"fail":[]}],"sortBy":null}]}],"parent":"parent"}],"success":[]}]},{"type":"text","text":" A 5-foot-radius, 30-foot-tall cylinder of swirling air magically forms on a point the djinni can see within 120 feet of it. The whirlwind lasts as long as the djinni maintains concentration (as if concentrating on a spell). Any creature but the djinni that enters the whirlwind must succeed on a DC 18 Strength saving throw or be restrained by it. The djinni can move the whirlwind up to 60 feet as an action, and creatures restrained by the whirlwind move with it. The whirlwind ends if the djinni loses sight of it.\nA creature can use its action to free a creature restrained by the whirlwind, including itself, by succeeding on a DC 18 Strength check. If the check succeeds, the creature is no longer restrained and moves to the nearest space outside the whirlwind."}],"_v":2,"verb":"begins to","proper":true}
	},
	{
		"name": "Dretch - Fetid Cloud",
		"description": "",
		"automation": {"name":"Dretch - Fetid Cloud","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Fetid Cloud Used","stacking":true,"buttons":[]},{"type":"ieffect2","name":"Fetid Cloud","duration":10,"desc":"","effects":null,"attacks":[{"attack":{"name":"Spread the Fetid Cloud","automation":[{"type":"target","target":"each","effects":[{"type":"ieffect2","name":"In the Fetid Cloud","duration":"ieffect.remaining","desc":"They must make a DC 11 Constitution saving throw if it starts its turn inside the cloud, or be poisoned until tghe start of its next turn","effects":null,"attacks":null,"buttons":[{"label":"Fetid Cloud Poison","verb":"is inside the Fetid Cloud","style":"4","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"con","dc":"11","fail":[{"type":"ieffect2","name":"Poisoned","duration":1,"effects":{"attack_advantage":-1,"check_dis":["all"]},"desc":"The target can take either an action or a bonus action on its turn, not both, and can't take reactions"}],"success":[]},{"type":"text","text":"Any creature that starts its turn in that area must succeed on a DC 11 Constitution saving throw or be poisoned until the start of its next turn. While poisoned in this way, the target can take either an action or a bonus action on its turn, not both, and can't take reactions."}]}]},{"label":"Leave the Fetid Cloud","verb":"leaves the range of the Fetid Cloud","style":"3","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"remove_ieffect","removeParent":null}]}],"end":false,"conc":false,"stacking":false,"parent":"ieffect"}]},{"type":"text","text":"A 10-foot radius of disgusting green gas extends out from the dretch. The gas spreads around corners, and its area is lightly obscured. It lasts for 1 minute or until a strong wind disperses it. Any creature that starts its turn in that area must succeed on a DC 11 Constitution saving throw or be poisoned until the start of its next turn. While poisoned in this way, the target can take either an action or a bonus action on its turn, not both, and can't take reactions."}],"_v":2,"verb":"begins to","proper":true}}],"buttons":null,"end":false,"conc":false,"stacking":false,"parent":null}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"ieffect2","name":"In the Fetid Cloud","duration":"10","desc":"They must make a DC 11 Constitution saving throw if it starts its turn inside the cloud, or be poisoned until tghe start of its next turn","effects":null,"attacks":null,"buttons":[{"label":"Fetid Cloud Poison","verb":"is inside the Fetid Cloud","style":"4","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"con","dc":"11","fail":[{"type":"ieffect2","name":"Poisoned","duration":1,"effects":{"attack_advantage":-1,"check_dis":["all"]},"desc":"The target can take either an action or a bonus action on its turn, not both, and can't take reactions"}],"success":[]},{"type":"text","text":"Any creature that starts its turn in that area must succeed on a DC 11 Constitution saving throw or be poisoned until the start of its next turn. While poisoned in this way, the target can take either an action or a bonus action on its turn, not both, and can't take reactions."}]}]},{"label":"Leave the Fetid Cloud","verb":"leaves the range of the Fetid Cloud","style":"3","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"remove_ieffect","removeParent":null}]}],"end":false,"conc":false,"stacking":false,"parent":"cloud"}]},{"type":"text","text":"A 10-foot radius of disgusting green gas extends out from the dretch. The gas spreads around corners, and its area is lightly obscured. It lasts for 1 minute or until a strong wind disperses it. Any creature that starts its turn in that area must succeed on a DC 11 Constitution saving throw or be poisoned until the start of its next turn. While poisoned in this way, the target can take either an action or a bonus action on its turn, not both, and can't take reactions."}],"_v":2,"verb":"lets out"}
	},
	{
		"name": "Dryad - Fey Charm",
		"description": "",
		"automation": {"name":"Dryad - Fey Charm","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"wis","dc":"14","fail":[{"type":"ieffect2","name":"Charmed","duration":14400,"desc":"Charmed by {{caster.name}}\n - They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw each time the dryad or its allies does anything harmful to the target, ending the effect on a success","buttons":[{"label":"Resist Charm","verb":"attempts to resist Charm","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"wis","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"The dryad targets one humanoid or beast that she can see within 30 feet of her. If the target can see the dryad, it must succeed on a DC 14 Wisdom saving throw or be magically charmed. The charmed creature regards the dryad as a trusted friend to be heeded and protected. Although the target isn't under the dryad's control, it takes the dryad's requests or actions in the most favorable way it can.\nEach time the dryad or its allies do anything harmful to the target, it can repeat the saving throw, ending the effect on itself on a success. Otherwise, the effect lasts 24 hours or until the dryad dies, is on a different plane of existence from the target, or ends the effect as a bonus action. If a target's saving throw is successful, the target is immune to the dryad's Fey Charm for the next 24 hours.\nThe dryad can have no more than one humanoid and up to three beasts charmed at a time."}],"_v":2,"verb":"uses their","proper":true,"activation_type":1}
	},
	{
		"name": "Duergar - Invisibility",
		"description": "",
		"automation": {"name":"Duergar - Invisibility","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Invisibility Used"},{"type":"ieffect2","name":"Invisible","conc":true,"duration":600,"effects":{"attack_advantage":1},"desc":"Lasts until the duergar attacks, casts a spell, or uses Enlarge","buttons":[{"label":"Break Invisibility","verb":"suddenly appears","style":"4","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"remove_ieffect","removeParent":"if_no_children"}]}]}]},{"type":"text","text":"The duergar magically turns invisible until it attacks, casts a spell, or uses its Enlarge, or until its concentration is broken, up to 1 hour (as if concentrating on a spell). Any equipment the duergar wears or carries is invisible with it."}],"_v":2,"verb":"uses","proper":true,"activation_type":1}
	},
	{
		"name": "Dust Mephit - Blinding Breath",
		"description": "",
		"automation": {"name":"Dust Mephit - Blinding Breath","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Blinding Breath Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 6","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Blinding Breath!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Blinding Breath!"}],"errorBehaviour":"false"}],"label":"Recharge Blinding Breath","verb":"attempts to recharge their Blinding Breath","style":"3"}]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"save","stat":"dex","dc":"10","fail":[{"type":"ieffect2","name":"Blinded","duration":10,"desc":"They can repeat the DC {lastSaveDC} {lastSaveAbility} saving throw at the end of each of its turns, ending the effect on a success","buttons":[{"label":"Resist Blindness","verb":"attempts to resist Blindness","defaultDC":"lastSaveDC","automation":[{"type":"target","target":"self","effects":[{"type":"save","stat":"dex","dc":null,"success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[]}],"sortBy":null}]}]}],"success":[]}]},{"type":"text","text":"The mephit exhales a 15-foot cone of blinding dust. Each creature in that area must succeed on a DC 10 Dexterity saving throw or be blinded for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success."}],"_v":2,"verb":"unleashes their","proper":true}
	},
	{
		"name": "Dust Mephit - Death Burst",
		"description": "",
		"automation": {"name":"Dust Mephit - Death Burst","automation":[{"type":"target","target":"each","effects":[{"type":"save","stat":"con","dc":"10","fail":[],"success":[]}]},{"type":"text","text":"When the mephit dies, it explodes in a burst of dust. Each creature within 5 feet of it must then succeed on a DC 10 Constitution saving throw or be blinded for 1 minute. A blinded creature can repeat the saving throw on each of its turns, ending the effect on itself on a success."}],"_v":2,"verb":"explodes in","activation_type":8}
	},
	{
		"name": "Ettercap - Web",
		"description": "",
		"automation": {"name":"Ettercap - Web","automation":[{"type":"target","target":"self","effects":[{"type":"ieffect2","name":"Web Used","stacking":true,"buttons":[{"automation":[{"type":"roll","dice":"1d6","name":"recharge","hidden":false,"cantripScale":false},{"type":"condition","condition":"int(recharge) >= 5","onTrue":[{"type":"remove_ieffect","removeParent":null},{"type":"text","text":"{{caster.name}} recharges their Web!"}],"onFalse":[{"type":"text","text":"{{caster.name}} doesn't recharge their Web!"}],"errorBehaviour":"false"}],"label":"Recharge Web","verb":"attempts to recharge their Web","style":"3"}]}],"sortBy":null},{"type":"target","target":"each","effects":[{"type":"attack","attackBonus":"4","hit":[{"type":"ieffect2","name":"Restrained (Web)","desc":"The target is restrained as long as it remains in the webs or until it breaks free\n - A target restrained by the webs can use its action to make a DC 11 Strength check\n - If it succeeds, it is no longer restrained","effects":{"attack_advantage":-1,"save_dis":["dex"]},"buttons":[{"label":"Break Free (Webs)","verb":"attempts to break free of the Webs","automation":[{"type":"target","target":"self","effects":[{"type":"check","ability":["strength"],"dc":"11","success":[{"type":"remove_ieffect","removeParent":"if_no_children"}],"fail":[],"contestTie":"neither"}],"sortBy":null}]}]}],"miss":[]}]},{"type":"text","text":"*Ranged Weapon Attack:* +4 to hit, range 30/60 ft., one Large or smaller creature. *Hit:* The creature is restrained by webbing. As an action, the restrained creature can make a DC 11 Strength check, escaping from the webbing on a success. The effect ends if the webbing is destroyed. The webbing has AC 10, 5 hit points, is vulnerable to fire damage and immune to bludgeoning, poison and psychic damage."}],"_v":2,"verb":"uses their","proper":true}
	},
	{
		"name": "Fire Elemental - Fire Form",
		"description": "",
		"automation": [{"name":"Fire Elemental - Fire Form","automation":[{"type":"target","target":"each","effects":[{"type":"damage","damage":"1d10 [fire]"}]},{"type":"text","text":"The elemental can move through a space as narrow as 1 inch wide without squeezing. A creature that touches the elemental or hits it with a melee attack while within 5 feet of it takes 5 (1d10) fire damage. In addition, the elemental can enter a hostile creature's space and stop there. The first time it enters a creature's space on a turn, that creature takes 5 (1d10) fire damage and catches fire; until someone takes an action to douse the fire, the creature takes 5 (1d10) fire damage at the start of each of its turns."}],"_v":2,"verb":"has","activation_type":8}, {"name":"Fire Elemental - Fire Form (Enter Space)","automation":[{"type":"target","target":"each","effects":[{"type":"damage","damage":"1d10 [fire]"},{"type":"ieffect2","name":"On fire","buttons":[{"label":"Douse","verb":"douses the flames","style":"3","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"remove_ieffect","removeParent":null}]},{"label":"Fire Damage","verb":"takes damage from the fire","style":"4","defaultDC":null,"defaultAttackBonus":null,"defaultCastingMod":null,"automation":[{"type":"target","target":"self","effects":[{"type":"damage","damage":"1d10 [fire]","overheal":false,"cantripScale":false}]},{"type":"text","text":"If the target is a creature or a flammable object, it ignites. Until a creature takes an action to douse the fire, the target takes 5 (1d10) fire damage at the start of each of its turns."}]}],"desc":"Target takes 1d10 fire at the start of their turns until a creature takes an action to douse the flames"}]},{"type":"text","text":"The elemental can move through a space as narrow as 1 inch wide without squeezing. A creature that touches the elemental or hits it with a melee attack while within 5 feet of it takes 5 (1d10) fire damage. In addition, the elemental can enter a hostile creature's space and stop there. The first time it enters a creature's space on a turn, that creature takes 5 (1d10) fire damage and catches fire; until someone takes an action to douse the fire, the creature takes 5 (1d10) fire damage at the start of each of its turns."}],"_v":2,"verb":"has","activation_type":8}]
	},
	// {
	// 	"name": "Fire Elemental",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// 	{
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
	// {
	// 	"name": "",
	// 	"description": "",
	// 	"automation": 
	// },
		
] as FeatureEntity[]