export const editorHintsGlobal = [
    { name: 'charisma', detail: 'int', doc: 'Charisma score.' },
    { name: 'charismaMod', detail: 'int', doc: 'Charisma modifier.' },
    { name: 'charismaSave', detail: 'int', doc: 'Charisma saving throw modifier.' },
    { name: 'constitution', detail: 'int', doc: 'Constitution score.' },
    { name: 'constitutionMod', detail: 'int', doc: 'Constitution modifier.' },
    { name: 'constitutionSave', detail: 'int', doc: 'Constitution saving throw modifier.' },
    { name: 'dexterity', detail: 'int', doc: 'Dexterity score.' },
    { name: 'dexterityMod', detail: 'int', doc: 'Dexterity modifier.' },
    { name: 'dexteritySave', detail: 'int', doc: 'Dexterity saving throw modifier.' },
    { name: 'intelligence', detail: 'int', doc: 'Intelligence score.' },
    { name: 'intelligenceMod', detail: 'int', doc: 'Intelligence modifier.' },
    { name: 'intelligenceSave', detail: 'int', doc: 'Intelligence saving throw modifier.' },
    { name: 'strength', detail: 'int', doc: 'Strength score.' },
    { name: 'strengthMod', detail: 'int', doc: 'Strength modifier.' },
    { name: 'strengthSave', detail: 'int', doc: 'Strength saving throw modifier.' },
    { name: 'wisdom', detail: 'int', doc: 'Wisdom score.' },
    { name: 'wisdomMod', detail: 'int', doc: 'Wisdom modifier.' },
    { name: 'wisdomSave', detail: 'int', doc: 'Wisdom saving throw modifier.' },
    { name: 'proficiencyBonus', detail: 'int', doc: 'Proficiency bonus.' },

]

export const editorHintsCharacter = [
    { name: 'ArtificerLevel', detail: 'int', doc: 'The character\'s Artificer Level' },
    { name: 'BardLevel', detail: 'int', doc: 'The character\'s Bard Level' },
    { name: 'BarbarianLevel', detail: 'int', doc: 'The character\'s BarbarianLevel Level' },
    { name: 'ClericLevel', detail: 'int', doc: 'The character\'s Cleric Level' },
    { name: 'DruidLevel', detail: 'int', doc: 'The character\'s Druid Level' },
    { name: 'FighterLevel', detail: 'int', doc: 'The character\'s Fighter Level' },
    { name: 'MonkLevel', detail: 'int', doc: 'The character\'s Monk Level' },
    { name: 'PaladinLevel', detail: 'int', doc: 'The character\'s Paladin Level' },
    { name: 'RangerLevel', detail: 'int', doc: 'The character\'s Ranger Level' },
    { name: 'RogueLevel', detail: 'int', doc: 'The character\'s Rogue Level' },
    { name: 'SorcererLevel', detail: 'int', doc: 'The character\'s Sorcerer Level' },
    { name: 'WarlockLevel', detail: 'int', doc: 'The character\'s Warlock Level' },
    { name: 'WizardLevel', detail: 'int', doc: 'The character\'s Wizard Level' },
    { name: 'color', detail: 'str', doc: 'The CSettings color for the character.' },
    { name: 'description', detail: 'str', doc: 'Full character description.' },
    { name: 'hp', detail: 'int', doc: 'Maximum hit points.' },
    { name: 'image', detail: 'str', doc: 'Character image URL.' },
    { name: 'level', detail: 'int', doc: 'Character level.' },
    { name: 'name', detail: 'str', doc: 'The character\u2019s name.' },
    { name: 'spell', detail: 'int', doc: 'The character\u2019s spellcasting ability mod.' },
    { name: 'armor', detail: 'int', doc: 'Armor Class.' },
]

export const automationGlobalHints = [
    { name: 'caster', detail: 'AliasStatBlock', doc: 'The character, combatant, or monster who is running the automation' },
    { name: 'targets', detail: 'list of AliasStatBlock, str, or None', doc: 'A list of combatants targeted by this automation (i.e. the -t argument)' },
    { name: 'spell_attack_bonus', detail: 'int or None', doc: 'The attack bonus for the spell, or the caster’s default attack bonus.' },
    { name: 'spell_dc', detail: 'int or None', doc: 'The DC for the spell, or the caster’s default DC.' },
    { name: 'spell', detail: 'int or None', doc: 'The casting mod for the spell, or the caster’s default casting mod.' },
    { name: 'spell_level', detail: 'int or None', doc: 'The level used to cast the spell, or None' },
    { name: 'choice', detail: 'str', doc: 'The input provided by the -choice argument, always lowercase. If the arg was not used, it will be an empty string.' },

]

export const exposedAutomationVariables = [
    {
        "name": "target",
        "detail": "AliasStatBlock",
        "doc": "The current target"
    },
    {
        "name": "targetIteration",
        "detail": "int",
        "doc": "If running multiple iterations (i.e. `-rr`), the current iteration (1-indexed)."
    },
    {
        "name": "targetIndex",
        "detail": "int",
        "doc": "The index of the target in the list of targets processed by this effect (0-indexed - first target = `0`, second = `1`, etc.). Self targets and nth-targets (`target: \"self\"` and `target: int`) will always be 0."
    },
    {
        "name": "targetNumber",
        "detail": "int",
        "doc": "Same as `targetIndex`, but 1-indexed (equivalent to `targetIndex + 1`)."
    },
    {
        "name": "lastAttackDidHit",
        "detail": "bool",
        "doc": "Whether the attack hit."
    },
    {
        "name": "lastAttackDidCrit",
        "detail": "bool",
        "doc": "If the attack hit, whether it crit."
    },
    {
        "name": "lastAttackRollTotal",
        "detail": "int",
        "doc": "The result of the last to-hit roll (0 if no roll was made)."
    },
    {
        "name": "lastAttackNaturalRoll",
        "detail": "int",
        "doc": "The natural roll of the last to-hit roll (e.g. 10 in 1d20 (10) + 5 = 15; 0 if no roll was made)."
    },
    {
        "name": "lastAttackHadAdvantage",
        "detail": "int",
        "doc": "The advantage type of the last to-hit roll. `0` for flat, `1` for; Advantage, `2` for Elven Accuracy, `-1` for Disadvantage"
    },
    {
        "name": "lastSaveDidPass",
        "detail": "bool",
        "doc": "Whether the target passed the save."
    },
    {
        "name": "lastSaveDC",
        "detail": "int",
        "doc": "The DC of the last save roll."
    },
    {
        "name": "lastSaveRollTotal",
        "detail": "int",
        "doc": "The result of the last save roll (0 if no roll was made)."
    },
    {
        "name": "lastSaveNaturalRoll",
        "detail": "int",
        "doc": "The natural roll of the last save roll (e.g. `10` in `1d20 (10) + 5 = 15`; 0 if no roll was made)."
    },
    {
        "name": "lastSaveAbility",
        "detail": "str",
        "doc": "The title-case full name of the ability the save was made with (e.g. `\"Strength\"`, `\"Wisdom\"`, etc)."
    },
    {
        "name": "lastDamage",
        "detail": "int",
        "doc": "The amount of damage dealt."
    },
    {
        "name": "lastTempHp",
        "detail": "int",
        "doc": "The amount of temp HP granted."
    },
    {
        "name": "lastRoll",
        "detail": "int",
        "doc": "The total of the roll."
    },
    {
        "name": "lastCounterName",
        "detail": "str",
        "doc": "The name of the last used counter. If it was a spell slot, the level of the slot (safe to cast to int, i.e. `int(lastCounterName)`). (`None` on error)."
    },
    {
        "name": "lastCounterRemaining",
        "detail": "int",
        "doc": "The remaining charges of the last used counter (0 on error)."
    },
    {
        "name": "lastCounterUsedAmount",
        "detail": "int",
        "doc": "The amount of the counter successfully used."
    },
    {
        "name": "lastCounterRequestedAmount",
        "detail": "int",
        "doc": "The amount of the counter requested to be used (i.e. the amount specified by automation or requested by `-amt`, regardless of the presence of the `-i` arg)."
    },
    {
        "name": "lastCheckRollTotal",
        "detail": "int",
        "doc": "The result of the last check roll (`0` if no roll was made)."
    },
    {
        "name": "lastCheckNaturalRoll",
        "detail": "int",
        "doc": "The natural roll of the last check roll (e.g. `10` in `1d20 (10) + 5 = 15`; `0` if no roll was made)."
    },
    {
        "name": "lastCheckAbility",
        "detail": "str",
        "doc": "The title-case full name of the rolled skill (e.g. \"Animal Handling\", \"Arcana\")."
    },
    {
        "name": "lastCheckDidPass",
        "detail": "bool or None",
        "doc": "If a DC was given, whether the target succeeded the check. If a contest was specified, whether the target won the contest. `None` if no or contest given."
    },
    {
        "name": "lastCheckDC",
        "detail": "int or None",
        "doc": "If a DC was given, the DC of the last save roll. `None` if no DC given."
    },
    {
        "name": "lastContestRollTotal",
        "detail": "int or None",
        "doc": "The result of the caster's contest roll; `None` if no contest was made."
    },
    {
        "name": "lastContestNaturalRoll",
        "detail": "int or None",
        "doc": "The natural roll of the caster's contest roll (e.g. 10 in 1d20 (10) + 5 = 15; `None` if no contest was made)."
    },
    {
        "name": "lastContestAbility",
        "detail": "str or None",
        "doc": "The title-case full name of the skill the caster rolled (e.g. \"Animal Handling\", \"Arcana\"). `None` if no contest was made."
    },
    {
        "name": "lastContestDidTie",
        "detail": "bool",
        "doc": "Whether a ability contest resulted in a tie."
    }
]


export const automationContextHints = [...editorHintsGlobal, ...automationGlobalHints, ...exposedAutomationVariables];

export const characterContextHints = [...editorHintsGlobal, ...editorHintsCharacter];