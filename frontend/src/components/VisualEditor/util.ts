import type { EffectWithTarget, Features } from "~/shared";
import { ref } from "vue";

export const displayNames: Record<string, { label: string; icon: string }> = {
	variable: { label: "Set Variable", icon: "proicons:braces-variable" },
	target: { label: "Target", icon: "mdi:target-variant" },
	onFalse: { label: "On False", icon: "material-symbols:chat-error-sharp" },
	onTrue: { label: "On True", icon: "material-symbols:check-box" },
	fail: { label: "Fail", icon: "material-symbols:chat-error-sharp" },
	success: { label: "Success", icon: "material-symbols:check-box" },
	text: { label: "Text", icon: "material-symbols:text-fields-sharp" },
	damage: { label: "Damage", icon: "picon:angry" },
	condition: { label: "Branch", icon: "material-symbols:arrow-split" },
	hit: { label: "Hit", icon: "mdi:check" },
	miss: { label: "Miss", icon: "mdi:close" },
	attack: { label: "Attack", icon: "material-symbols:swords" },
	roll: { label: "Roll", icon: "ion:dice" },
	spell: { label: "Spell", icon: "material-symbols:magic-button" },
	ieffect2: { label: "Init Effect", icon: "streamline-sharp:magic-wand-2-remix" },
	counter: { label: "Use Counter", icon: "material-symbols:123" },
	remove_ieffect: { label: "Remove Ieffect", icon: "material-symbols:delete-sharp" },
	attacks: { label: "Action", icon: "mdi:sword" },
	buttons: { label: "Button", icon: "material-symbols:joystick" },
	save: { label: "Saving Throw", icon: "fa6-solid:recycle" },
	temphp: { label: "Temp HP", icon: "material-symbols:shield-with-heart" },
	check: { label: "Ability Check", icon: "twemoji:man-cartwheeling" },
	proneButton: { label: "Prone Button", icon: "material-symbols:falling-rounded" },
	rechargeButton: { label: "Recharge Button", icon: "material-symbols:charger" },
	damageStartOfTurnButton: { label: "Damage start of turn Button", icon: "mdi:fire" },
	basicAttack: { label: "Attack and Damage", icon: "mdi:toy-brick" },
	saveForHalfDamage: { label: "Save for Half Damage", icon: "mdi:content-save-off" },
	saveForHalfDamageWithRecharge: { label: "Save for Half Damage With Recharge", icon: "material-symbols:battery-4-bar-sharp" },
	attackWithPoison: { label: "Attack with Poison", icon: "mdi:spider" },
	attackWithGrappleRestrain: { label: "Attack with Grapple (Restrain)", icon: "game-icons:fist" }
} as const;

export const defaultNodes: Record<string, EffectWithTarget | EffectWithTarget[]> = {
	target: {
		type: "target",
		target: "each",
		effects: []
	},
	attack: {
		type: "attack",
		hit: [],
		miss: []
	},
	damage: {
		type: "damage",
		damage: ""
	},
	save: {
		type: "save",
		stat: "dex",
		dc: "10",
		success: [],
		fail: []
	},
	temphp: {
		type: "temphp",
		amount: ""
	},
	ieffect2: {
		type: "ieffect2",
		name: ""
	},
	roll: {
		type: "roll",
		dice: "",
		name: "",
	},
	text: {
		type: "text",
		text: "",
		title: ""
	},
	variable: {
		type: "variable",
		name: "",
		value: ""
	},
	condition: {
		type: "condition",
		condition: "",
		onTrue: [],
		onFalse: []
	},
	counter: {
		type: "counter",
		counter: "",
		amount: "1"
	},
	check: {
		type: "check",
		ability: ["athletics"],
		success: [],
		fail: []
	},
	remove_ieffect: {
		type: "remove_ieffect",
	},
	spell: {
		type: "spell",
		id: 2102
	},
	basicAttack: [
		{
			type: "target",
			target: "each",
			effects: [
				{
					type: "attack",
					hit: [
						{
							type: "damage",
							damage: "1d6 [slashing]",
							overheal: false
						}
					],
					miss: [],
					attackBonus: "4"
				}
			]
		},
		{
			type: "text",
			text: "*Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 5 (1d6 + 2) slashing damage.",
			title: "Effect"
		}
	],
	saveForHalfDamage: [
		{
			type: "roll",
			dice: "8d6 [fire]",
			name: "damage"
		},
		{
			type: "target",
			target: "each",
			effects: [
				{
					type: "save",
					stat: "dex",
					dc: "19",
					fail: [
						{
							type: "damage",
							damage: "{damage}"
						}
					],
					success: [
						{
							type: "damage",
							damage: "({damage}) / 2"
						}
					]
				}
			],
		},
		{
			type: "text",
			text: "Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one."
		}
	],
	saveForHalfDamageWithRecharge:
		[
			{
				type: "target",
				target: "self",
				effects: [
					{
						type: "ieffect2",
						name: "Ability Used",
						stacking: true,
						buttons: [
							{
								automation: [
									{
										type: "roll",
										dice: "1d6",
										name: "recharge",
										hidden: false,
										cantripScale: false
									},
									{
										type: "condition",
										condition: "int(recharge) >= 5",
										onTrue: [
											{
												type: "remove_ieffect",
											},
											{
												type: "text",
												text: "{{caster.name}} recharges their Ability!"
											}
										],
										onFalse: [
											{
												type: "text",
												text: "{{caster.name}} doesn't recharge their Ability!"
											}
										],
										errorBehaviour: "false"
									}
								],
								label: "Recharge Ability",
								verb: "attempts to recharge their Ability",
								style: "3"
							}
						]
					}
				],
			},
			{
				type: "roll",
				dice: "12d8 [fire]",
				name: "damage"
			},
			{
				type: "target",
				target: "each",
				effects: [
					{
						type: "save",
						stat: "dex",
						dc: "18",
						fail: [
							{
								type: "damage",
								damage: "{damage}"
							}
						],
						success: [
							{
								type: "damage",
								damage: "{damage}/2"
							}
						]
					}
				],
			},
			{
				type: "text",
				text: "The monster spews fire in a 60-foot line that is 5 feet wide. Each creature in that line must make a DC 18 Dexterity saving throw, taking 54 (12d8) fire damage on a failed save, or half as much damage on a successful one."
			}
		],
	attackWithPoison: [{
		"type": "target",
		"target": "each",
		"effects": [
			{
				"type": "attack",
				"hit": [
					{
						"type": "damage",
						"damage": "1d4 + 4 [piercing]"
					},
					{
						"type": "save",
						"stat": "con",
						"dc": "10",
						"fail": [
							{
								"type": "damage",
								"damage": "3d6 [poison]"
							}
						],
						"success": [
							{
								"type": "damage",
								"damage": "(3d6 [poison]) / 2"
							}
						],
					}
				],
				"miss": [],
				"attackBonus": "6"
			}
		]
	},
	{
		"type": "text",
		"text": "*Melee Weapon Attack:* +6 to hit, reach 10 ft., one target. *Hit:* 6 (1d4 + 4) piercing damage, and the target must make a DC 10 Constitution saving throw, taking 10 (3d6) poison damage on a failed save, or half as much damage on a successful one."
	},],
	attackWithGrappleRestrain: [
		{
			"type": "target",
			"target": "each",
			"effects": [
				{
					"type": "attack",
					"hit": [
						{
							"type": "damage",
							"damage": "2d6 + 4 [bludgeoning]"
						},
						{
							"type": "ieffect2",
							"name": "Grappled",
							"desc": "Grappled by {{caster.name}}\n - Escape DC 14",
							"buttons": [
								{
									"label": "Escape Grapple",
									"verb": "tries to escape",
									"automation": [
										{
											"type": "target",
											"target": "self",
											"effects": [
												{
													"type": "check",
													"ability": [
														"acrobatics",
														"athletics"
													],
													"dc": "14",
													"success": [
														{
															"type": "remove_ieffect",
															"removeParent": "if_no_children"
														}
													],
													"fail": []
												}
											]
										},
										{
											"type": "text",
											"text": "A creature grappled by the monster can use its action to try to escape. To do so, it must succeed on a Strength (Athletics) or Dexterity (Acrobatics) check against the escape DC in the monster's stat block."
										}
									]
								}
							],
							"end": false,
							"conc": false,
							"stacking": false,
							"save_as": "grapple"
						}
					],
					"miss": [],
					"attackBonus": "6"
				}
			]
		},
		{
			"type": "text",
			"text": "*Melee Weapon Attack:* +6 to hit, reach 10 ft., one target. *Hit:* 11 (2d6 + 4) bludgeoning damage. The target is grappled (escape DC 14) if it is a Large or smaller creature and the monster doesn't have two other creatures grappled."
		}
	],
	proneButton: {
		type: "ieffect2",
		name: "Prone",
		effects: {
			attack_advantage: "-1"
		},
		buttons: [
			{
				label: "Stand Up",
				automation: [
					{
						type: "remove_ieffect"
					}
				]
			}
		],
		desc: "A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition"
	},

	rechargeButton: {
		type: "ieffect2",
		name: "Ability Used",
		stacking: true,
		buttons: [
			{
				automation: [
					{
						type: "roll",
						dice: "1d6",
						name: "recharge",
						hidden: false,
						cantripScale: false
					},
					{
						type: "condition",
						condition: "int(recharge) >= 5",
						onTrue: [
							{
								type: "remove_ieffect",
							},
							{
								type: "text",
								text: "{{caster.name}} recharges their Ability!"
							}
						],
						onFalse: [
							{
								type: "text",
								text: "{{caster.name}} doesn't recharge their Ability!"
							}
						],
						errorBehaviour: "false"
					}
				],
				label: "Recharge Ability",
				verb: "attempts to recharge their Ability",
				style: "3"
			}
		]
	},
	damageStartOfTurnButton: {
		"type": "ieffect2",
		"name": "On Fire",
		"desc": "Target takes 2d6 fire at the start of its turns",
		"buttons": [
			{
				"label": "On Fire",
				"verb": "is On Fire",
				"style": "4",
				"automation": [
					{
						"type": "target",
						"target": "self",
						"effects": [
							{
								"type": "damage",
								"damage": "2d6 [fire]"
							}
						]
					},
					{
						"type": "text",
						"text": "While the target is on fire it takes 7 (2d6) fire damage at the start of each of its turns."
					}
				]
			}
		]
	}

};

export const deepKeys = ["effects", "hit", "miss", "fail", "success", "onTrue", "onFalse"];

type activation_types = {
	[id in keyof Features]: number;
};;
export const activation_type: activation_types = {
	features: 2,
	actions: 1,
	bonus: 3,
	reactions: 4,
	legendary: 9,
	mythic: 10,
	lair: 11,
	regional: 8
};

const dragState = ref<{
	originalDepth: number;
	ghostNodes: { el: HTMLElement; originalDepth: number }[];
} | null>(null);

const collectDepthNodes = (root: HTMLElement) => {
	const nodes: { el: HTMLElement; originalDepth: number }[] = [];
	const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>("[style*='--depth']"))];

	for (const el of all) {
		const raw = el.style.getPropertyValue("--depth");
		if (raw)
			nodes.push({ el, originalDepth: Number.parseFloat(raw) });
	}

	return nodes;
};

const onGhostStart = (evt: any) => {
	const item = evt.item as HTMLElement | null;
	if (!item)
		return;

	const originalDepth = Number.parseFloat(getComputedStyle(item).getPropertyValue("--depth"));
	dragState.value = { originalDepth, ghostNodes: [] };
};

const onGhostMove = (evt: any) => {
	const related = evt.related as HTMLElement | null;
	const to = evt.to as HTMLElement | null;

	const depthSource
		= related?.querySelector<HTMLElement>(".tree-row")
		?? related
		?? to;
	if (!depthSource || !dragState.value)
		return true;

	const targetDepthRaw = getComputedStyle(depthSource).getPropertyValue("--depth").trim();
	if (!targetDepthRaw)
		return true;
	const targetDepth = Number.parseFloat(targetDepthRaw);

	const ghostClass = (draggingProps as any).ghostClass ?? "sortable-ghost";
	const ghostEl = to?.querySelector<HTMLElement>(`.${ghostClass}`);
	if (!ghostEl)
		return true;

	// Lazily snapshot the ghost's own inline-depth nodes the first time we see it,
	// since SortableJS creates the ghost clone slightly after onStart fires.
	if (dragState.value.ghostNodes.length === 0)
		dragState.value.ghostNodes = collectDepthNodes(ghostEl);

	const { originalDepth, ghostNodes } = dragState.value;
	const delta = targetDepth - originalDepth;

	for (const { el, originalDepth: nodeOriginalDepth } of ghostNodes)
		el.style.setProperty("--depth", (nodeOriginalDepth + delta).toString());

	return true;
};

const onGhostEnd = () => {
	dragState.value = null;
};

export const draggingProps = {
	group: "tree-group",
	handle: ".drag-handle",
	'ghost-class': "drag-ghost",
	class: "draggable-list",
	animation: 200,
	'swap-treshold': 0.65,
	'invert-swap': true,
	'inverted-swap-treshold': 0.65,
	'on-move': onGhostMove,
	'on-start': onGhostStart,
	'on-end': onGhostEnd
};
