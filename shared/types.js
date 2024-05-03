"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
exports.spellListFlattened = exports.spellList = exports.getSpellSlots = exports.getXPbyCR = exports.XPbyCR = exports.defaultStatblock = exports.stringToId = exports.Automation = exports.Creature = exports.Bestiary = exports.User = void 0;
var bson_1 = require("bson");
__createBinding(exports, bson_1, "ObjectId", "Id");
var bson_2 = require("bson");
//Database types
var User = /** @class */ (function () {
    function User(username, avatar, email, verified, banner_color, global_name, bestiaries, bookmarks, supporter, joinedAt, _id, secret) {
        if (bestiaries === void 0) { bestiaries = []; }
        if (bookmarks === void 0) { bookmarks = []; }
        this.username = username;
        this.avatar = avatar;
        this.email = email;
        this.verified = verified;
        this.banner_color = banner_color;
        this.global_name = global_name;
        this.bestiaries = bestiaries;
        this.bookmarks = bookmarks;
        this.supporter = supporter;
        this.joinedAt = joinedAt;
        this._id = _id;
        this.secret = secret;
    }
    return User;
}());
exports.User = User;
var Bestiary = /** @class */ (function () {
    function Bestiary(name, owner, editors, status, description, creatures, tags, viewCount, bookmarks, lastUpdated, _id) {
        this.name = name;
        this.owner = owner;
        this.editors = editors;
        this.status = status;
        this.description = description;
        this.creatures = creatures;
        this.tags = tags;
        this.viewCount = viewCount;
        this.bookmarks = bookmarks;
        this.lastUpdated = lastUpdated;
        this._id = _id;
    }
    return Bestiary;
}());
exports.Bestiary = Bestiary;
var Creature = /** @class */ (function () {
    function Creature(lastUpdated, stats, bestiary, _id) {
        this.lastUpdated = lastUpdated;
        this.stats = stats;
        this.bestiary = bestiary;
        this._id = _id;
    }
    return Creature;
}());
exports.Creature = Creature;
var Automation = /** @class */ (function () {
    function Automation(_id, name, description, owner, lastUpdated, automation) {
        this._id = _id;
        this.name = name;
        this.description = description;
        this.owner = owner;
        this.lastUpdated = lastUpdated;
        this.automation = automation;
    }
    return Automation;
}());
exports.Automation = Automation;
function stringToId(id) {
    if (!id)
        return null;
    if (id.length != 24)
        return null;
    return new bson_2.ObjectId(id);
}
exports.stringToId = stringToId;
//Frontend types
exports.defaultStatblock = {
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
        speed: [
            {
                name: "Walk",
                value: 30,
                unit: "ft",
                comment: ""
            }
        ],
        senses: [],
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
            str: { isProficient: false, override: null },
            dex: { isProficient: false, override: null },
            con: { isProficient: false, override: null },
            wis: { isProficient: false, override: null },
            int: { isProficient: false, override: null },
            cha: { isProficient: false, override: null }
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
        mythic: [],
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
            isPsionics: false,
            displayAsAction: false
        },
        casterSpells: {
            casterLevel: null,
            castingClass: null,
            spellCastingAbility: null,
            spellCastingAbilityOverride: null,
            spellList: [[], [], [], [], [], [], [], [], [], []],
            spellSlotList: {},
            spellDcOverride: null,
            spellBonusOverride: null,
            displayAsAction: false
        }
    },
    misc: {
        legActionsPerRound: 3,
        telepathy: 0,
        passivePerceptionOverride: null,
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
exports.XPbyCR = [
    // skips 1/8 1/4 1/2
    0, 200, 450, 700, 1100, 1800, 2300, 2900, 3900, 5000, 5900, 7200, 8400, 10000, 11500, 13000, 15000, 18000, 20000, 22000, 25000, 33000, 41000, 50000, 62000, 75000, 90000, 105000, 120000, 135000, 255000
];
function getXPbyCR(cr) {
    var _a;
    if (cr == 0.125)
        return 25;
    else if (cr == 0.25)
        return 50;
    else if (cr == 0.5)
        return 100;
    else
        return (_a = exports.XPbyCR[cr]) !== null && _a !== void 0 ? _a : 0;
}
exports.getXPbyCR = getXPbyCR;
function getSpellSlots(sClass, level) {
    if (!sClass || !level)
        return {};
    if (sClass == "Warlock") {
        return {
            1: { 1: 1 },
            2: { 1: 2 },
            3: { 2: 2 },
            4: { 2: 2 },
            5: { 3: 2 },
            6: { 3: 2 },
            7: { 4: 2 },
            8: { 4: 2 },
            9: { 5: 2 },
            10: { 5: 2 },
            11: { 5: 3 },
            12: { 5: 3 },
            13: { 5: 3 },
            14: { 5: 3 },
            15: { 5: 3 },
            16: { 5: 3 },
            17: { 5: 4 },
            18: { 5: 4 },
            19: { 5: 4 },
            20: { 5: 4 }
        }[level];
    }
    else if (["Ranger", "Paladin", "Artificer"].includes(sClass)) {
        if (level == 1 && sClass == "Artificer")
            return { 1: 2 };
        return {
            1: {},
            2: { 1: 2 },
            3: { 1: 3 },
            4: { 1: 3 },
            5: { 1: 4, 2: 2 },
            6: { 1: 4, 2: 2 },
            7: { 1: 4, 2: 3 },
            8: { 1: 4, 2: 3 },
            9: { 1: 4, 2: 3, 3: 2 },
            10: { 1: 4, 2: 3, 3: 2 },
            11: { 1: 4, 2: 3, 3: 3 },
            12: { 1: 4, 2: 3, 3: 3 },
            13: { 1: 4, 2: 3, 3: 3, 4: 1 },
            14: { 1: 4, 2: 3, 3: 3, 4: 1 },
            15: { 1: 4, 2: 3, 3: 3, 4: 2 },
            16: { 1: 4, 2: 3, 3: 3, 4: 2 },
            17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
            18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
            19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
            20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }
        }[level];
    }
    else {
        return {
            1: { 1: 2 },
            2: { 1: 3 },
            3: { 1: 4, 2: 2 },
            4: { 1: 4, 2: 3 },
            5: { 1: 4, 2: 3, 3: 2 },
            6: { 1: 4, 2: 3, 3: 3 },
            7: { 1: 4, 2: 3, 3: 3, 4: 1 },
            8: { 1: 4, 2: 3, 3: 3, 4: 2 },
            9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
            10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
            11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
            12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
            13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
            14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
            15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
            16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
            17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
            18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
            19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 2, 7: 1, 8: 1, 9: 1 },
            20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 2, 7: 2, 8: 1, 9: 1 }
        }[level];
    }
}
exports.getSpellSlots = getSpellSlots;
exports.spellList = {
    0: [
        "Acid Splash",
        "Blade Ward",
        "Booming Blade",
        "Chill Touch",
        "Control Flames",
        "Create Bonfire",
        "Dancing Lights",
        "Druidcraft",
        "Eldritch Blast",
        "Encode Thoughts",
        "Fire Bolt",
        "Friends",
        "Frostbite",
        "Green-Flame Blade",
        "Guidance",
        "Gust",
        "Infestation",
        "Light",
        "Lightning Lure",
        "Mage Hand",
        "Magic Stone",
        "Mending",
        "Message",
        "Mind Sliver",
        "Minor Illusion",
        "Mold Earth",
        "Poison Spray",
        "Prestidigitation",
        "Primal Savagery",
        "Produce Flame",
        "Ray of Frost",
        "Resistance",
        "Sacred Flame",
        "Sapping Sting",
        "Shape Water",
        "Shillelagh",
        "Shocking Grasp",
        "Spare the Dying",
        "Sword Burst",
        "Thaumaturgy",
        "Thorn Whip",
        "Thunderclap",
        "Toll the Dead",
        "True Strike",
        "Vicious Mockery",
        "Word of Radiance"
    ],
    1: [
        "Absorb Elements",
        "Alarm",
        "Animal Friendship",
        "Armor of Agathys",
        "Arms of Hadar",
        "Bane",
        "Beast Bond",
        "Bless",
        "Burning Hands",
        "Catapult",
        "Cause Fear",
        "Ceremony",
        "Chaos Bolt",
        "Charm Person",
        "Chromatic Orb",
        "Color Spray",
        "Command",
        "Compelled Duel",
        "Comprehend Languages",
        "Create or Destroy Water",
        "Cure Wounds",
        "Detect Evil and Good",
        "Detect Magic",
        "Detect Poison and Disease",
        "Disguise Self",
        "Dissonant Whispers",
        "Distort Value",
        "Divine Favor",
        "Earth Tremor",
        "Ensnaring Strike",
        "Entangle",
        "Expeditious Retreat",
        "Faerie Fire",
        "False Life",
        "Feather Fall",
        "Find Familiar",
        "Floating Disk",
        "Fog Cloud",
        "Frost Fingers",
        "Gift of Alacrity",
        "Goodberry",
        "Grease",
        "Guiding Bolt",
        "Hail of Thorns",
        "Healing Word",
        "Hellish Rebuke",
        "Heroism",
        "Hex",
        "Hideous Laughter",
        "Hunter's Mark",
        "Ice Knife",
        "Identify",
        "Illusory Script",
        "Inflict Wounds",
        "Jim's Magic Missile",
        "Jump",
        "Longstrider",
        "Mage Armor",
        "Magic Missile",
        "Magnify Gravity",
        "Protection from Evil and Good",
        "Purify Food and Drink",
        "Ray of Sickness",
        "Sanctuary",
        "Searing Smite",
        "Shield",
        "Shield of Faith",
        "Silent Image",
        "Silvery Barbs",
        "Sleep",
        "Snare",
        "Speak with Animals",
        "Tasha's Caustic Brew",
        "Tasha's Hideous Laughter",
        "Tenser's Floating Disk",
        "Thunderous Smite",
        "Thunderwave",
        "Unseen Servant",
        "Witch Bolt",
        "Wrathful Smite",
        "Zephyr Strike"
    ],
    2: [
        "Acid Arrow",
        "Aganazzar's Scorcher",
        "Aid",
        "Air Bubble",
        "Alter Self",
        "Animal Messenger",
        "Arcane Lock",
        "Arcanist's Magic Aura",
        "Augury",
        "Barkskin",
        "Beast Sense",
        "Blindness/Deafness",
        "Blur",
        "Borrowed Knowledge",
        "Branding Smite",
        "Calm Emotions",
        "Cloud of Daggers",
        "Continual Flame",
        "Cordon of Arrows",
        "Crown of Madness",
        "Darkness",
        "Darkvision",
        "Detect Thoughts",
        "Dragon's Breath",
        "Dust Devil",
        "Earthbind",
        "Enhance Ability",
        "Enlarge/Reduce",
        "Enthrall",
        "Find Steed",
        "Find Traps",
        "Flame Blade",
        "Flaming Sphere",
        "Flock of Familiars",
        "Fortune's Favor",
        "Gentle Repose",
        "Gift of Gab",
        "Gust of Wind",
        "Healing Spirit",
        "Heat Metal",
        "Hold Person",
        "Immovable Object",
        "Invisibility",
        "Jim's Glowing Coin",
        "Kinetic Jaunt",
        "Knock",
        "Lesser Restoration",
        "Levitate",
        "Locate Animals or Plants",
        "Locate Object",
        "Magic Mouth",
        "Magic Weapon",
        "Maximilian's Earthen Grasp",
        "Melf's Acid Arrow",
        "Mind Spike",
        "Mirror Image",
        "Misty Step",
        "Moonbeam",
        "Nathair's Mischief",
        "Nystul's Magic Aura",
        "Pass without Trace",
        "Phantasmal Force",
        "Prayer of Healing",
        "Protection from Poison",
        "Pyrotechnics",
        "Ray of Enfeeblement",
        "Rime's Binding Ice",
        "Rope Trick",
        "Scorching Ray",
        "See Invisibility",
        "Shadow Blade",
        "Shatter",
        "Silence",
        "Skywrite",
        "Snilloc's Snowball Swarm",
        "Spider Climb",
        "Spike Growth",
        "Spiritual Weapon",
        "Spray of Cards",
        "Suggestion",
        "Summon Beast",
        "Tasha's Mind Whip",
        "Vortex Warp",
        "Warding Bond",
        "Warding Wind",
        "Warp Sense",
        "Web",
        "Wither and Bloom",
        "Wristpocket",
        "Zone of Truth"
    ],
    3: [
        "Animate Dead",
        "Antagonize",
        "Ashardalon's Stride",
        "Aura of Vitality",
        "Beacon of Hope",
        "Bestow Curse",
        "Blinding Smite",
        "Blink",
        "Call Lightning",
        "Catnap",
        "Clairvoyance",
        "Conjure Animals",
        "Conjure Barrage",
        "Counterspell",
        "Create Food and Water",
        "Crusader's Mantle",
        "Daylight",
        "Dispel Magic",
        "Elemental Weapon",
        "Enemies Abound",
        "Erupting Earth",
        "Fast Friends",
        "Fear",
        "Feign Death",
        "Fireball",
        "Flame Arrows",
        "Fly",
        "Freedom of the Waves",
        "Galder's Tower",
        "Gaseous Form",
        "Glyph of Warding",
        "Haste",
        "Hunger of Hadar",
        "Hypnotic Pattern",
        "Incite Greed",
        "Intellect Fortress",
        "Leomund's Tiny Hut",
        "Life Transference",
        "Lightning Arrow",
        "Lightning Bolt",
        "Magic Circle",
        "Major Image",
        "Mass Healing Word",
        "Meld into Stone",
        "Melf's Minute Meteors",
        "Motivational Speech",
        "Nondetection",
        "Phantom Steed",
        "Plant Growth",
        "Protection from Energy",
        "Pulse Wave",
        "Remove Curse",
        "Revivify",
        "Sending",
        "Sleet Storm",
        "Slow",
        "Speak with Dead",
        "Speak with Plants",
        "Spirit Guardians",
        "Spirit Shroud",
        "Stinking Cloud",
        "Summon Fey",
        "Summon Lesser Demons",
        "Summon Shadowspawn",
        "Summon Undead",
        "Thunder Step",
        "Tidal Wave",
        "Tiny Hut",
        "Tiny Servant",
        "Tongues",
        "Vampiric Touch",
        "Wall of Sand",
        "Wall of Water",
        "Water Breathing",
        "Water Walk",
        "Wind Wall"
    ],
    4: [
        "Arcane Eye",
        "Aura of Life",
        "Aura of Purity",
        "Banishment",
        "Black Tentacles",
        "Blight",
        "Charm Monster",
        "Compulsion",
        "Confusion",
        "Conjure Minor Elementals",
        "Conjure Woodland Beings",
        "Control Water",
        "Death Ward",
        "Dimension Door",
        "Divination",
        "Dominate Beast",
        "Elemental Bane",
        "Evard's Black Tentacles",
        "Fabricate",
        "Faithful Hound",
        "Find Greater Steed",
        "Fire Shield",
        "Freedom of Movement",
        "Galder's Speedy Courier",
        "Gate Seal",
        "Giant Insect",
        "Grasping Vine",
        "Gravity Sinkhole",
        "Greater Invisibility",
        "Guardian of Faith",
        "Guardian of Nature",
        "Hallucinatory Terrain",
        "Ice Storm",
        "Leomund's Secret Chest",
        "Locate Creature",
        "Mordenkainen's Faithful Hound",
        "Mordenkainen's Private Sanctum",
        "Otiluke's Resilient Sphere",
        "Phantasmal Killer",
        "Polymorph",
        "Private Sanctum",
        "Raulothim's Psychic Lance",
        "Resilient Sphere",
        "Secret Chest",
        "Shadow of Moil",
        "Sickening Radiance",
        "Spirit of Death",
        "Staggering Smite",
        "Stone Shape",
        "Stoneskin",
        "Storm Sphere",
        "Summon Aberration",
        "Summon Construct",
        "Summon Elemental",
        "Summon Greater Demon",
        "Vitriolic Sphere",
        "Wall of Fire",
        "Watery Sphere"
    ],
    5: [
        "Animate Objects",
        "Antilife Shell",
        "Arcane Hand",
        "Awaken",
        "Banishing Smite",
        "Bigby's Hand",
        "Circle of Power",
        "Cloudkill",
        "Commune",
        "Commune with Nature",
        "Cone of Cold",
        "Conjure Elemental",
        "Conjure Volley",
        "Contact Other Plane",
        "Contagion",
        "Control Winds",
        "Create Spelljamming Helm",
        "Creation",
        "Danse Macabre",
        "Dawn",
        "Destructive Wave",
        "Dispel Evil and Good",
        "Dominate Person",
        "Dream",
        "Enervation",
        "Far Step",
        "Flame Strike",
        "Freedom of the Winds",
        "Geas",
        "Greater Restoration",
        "Hallow",
        "Hold Monster",
        "Holy Weapon",
        "Immolation",
        "Infernal Calling",
        "Insect Plague",
        "Legend Lore",
        "Maelstrom",
        "Mass Cure Wounds",
        "Mislead",
        "Modify Memory",
        "Negative Energy Flood",
        "Passwall",
        "Planar Binding",
        "Raise Dead",
        "Rary's Telepathic Bond",
        "Reincarnate",
        "Scrying",
        "Seeming",
        "Skill Empowerment",
        "Steel Wind Strike",
        "Summon Celestial",
        "Summon Draconic Spirit",
        "Swift Quiver",
        "Synaptic Static",
        "Telekinesis",
        "Telepathic Bond",
        "Teleportation Circle",
        "Temporal Shunt",
        "Transmute Rock",
        "Tree Stride",
        "Wall of Force",
        "Wall of Light",
        "Wall of Stone",
        "Wrath of Nature"
    ],
    6: [
        "Arcane Gate",
        "Blade Barrier",
        "Bones of the Earth",
        "Chain Lightning",
        "Circle of Death",
        "Conjure Fey",
        "Contingency",
        "Create Homunculus",
        "Create Undead",
        "Disintegrate",
        "Drawmij's Instant Summons",
        "Druid Grove",
        "Eyebite",
        "Find the Path",
        "Fizban's Platinum Shield",
        "Flesh to Stone",
        "Forbiddance",
        "Freezing Sphere",
        "Globe of Invulnerability",
        "Gravity Fissure",
        "Guards and Wards",
        "Harm",
        "Heal",
        "Heroes' Feast",
        "Instant Summons",
        "Investiture of Flame",
        "Investiture of Ice",
        "Investiture of Stone",
        "Investiture of Wind",
        "Magic Jar",
        "Mass Suggestion",
        "Mental Prison",
        "Move Earth",
        "Otiluke's Freezing Sphere",
        "Otto's Irresistible Dance",
        "Planar Ally",
        "Primordial Ward",
        "Programmed Illusion",
        "Scatter",
        "Soul Cage",
        "Summon Fiend",
        "Sunbeam",
        "Tasha's Otherworldly Guise",
        "Tenser's Transformation",
        "Transport via Plants",
        "True Seeing",
        "Wall of Ice",
        "Wall of Thorns",
        "Wind Walk",
        "Word of Recall"
    ],
    7: [
        "Conjure Celestial",
        "Create Magen",
        "Crown of Stars",
        "Delayed Blast Fireball",
        "Divine Word",
        "Draconic Transformation",
        "Dream of the Blue Veil",
        "Etherealness",
        "Finger of Death",
        "Fire Storm",
        "Forcecage",
        "Magnificent Mansion",
        "Mirage Arcane",
        "Mordenkainen's Magnificent Mansion",
        "Mordenkainen's Sword",
        "Plane Shift",
        "Power Word Pain",
        "Prismatic Spray",
        "Project Image",
        "Regenerate",
        "Resurrection",
        "Reverse Gravity",
        "Sequester",
        "Simulacrum",
        "Symbol",
        "Teleport",
        "Temple of the Gods",
        "Tether Essence",
        "Whirlwind"
    ],
    8: [
        "Abi-Dalzim's Horrid Wilting",
        "Animal Shapes",
        "Antimagic Field",
        "Antipathy/Sympathy",
        "Clone",
        "Control Weather",
        "Dark Star",
        "Demiplane",
        "Dominate Monster",
        "Earthquake",
        "Feeblemind",
        "Glibness",
        "Holy Aura",
        "Illusory Dragon",
        "Incendiary Cloud",
        "Maddening Darkness",
        "Maze",
        "Mighty Fortress",
        "Mind Blank",
        "Power Word Stun",
        "Reality Break",
        "Sunburst",
        "Telepathy",
        "Tsunami"
    ],
    9: [
        "Astral Projection",
        "Blade of Disaster",
        "Foresight",
        "Gate",
        "Imprisonment",
        "Invulnerability",
        "Mass Heal",
        "Mass Polymorph",
        "Meteor Swarm",
        "Power Word Heal",
        "Power Word Kill",
        "Prismatic Wall",
        "Psychic Scream",
        "Ravenous Void",
        "Shapechange",
        "Storm of Vengeance",
        "Time Ravage",
        "Time Stop",
        "True Polymorph",
        "True Resurrection",
        "Weird",
        "Wish"
    ]
};
exports.spellListFlattened = [];
for (var l in exports.spellList) {
    // @ts-ignore
    exports.spellListFlattened = exports.spellListFlattened.concat(exports.spellList[l]);
}
exports.spellListFlattened.sort();
