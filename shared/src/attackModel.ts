export type AutomationModel = null | AttackModel | AttackModel[];

export interface AttackModel {
	_v: 2;
	name: string;
	automation: Effect[];
	verb?: string;
	proper?: boolean;
	criton?: number;
	phrase?: string;
	thumb?: string;
	extra_crit_damage?: string;
	activation_type?: number;
	list_display_override?: string;
}

export type IntExpression = string | number;
export type AnnotatedString = string;
export type Effect = Target | Remove_IEffect | Roll | Text | Variable | Condition | Counter | Spell;
export type EffectWithTarget = Target | Remove_IEffect | Roll | Text | Variable | Condition | Counter | Spell | Check | Attack | Save | Damage | TempHP | IEffect;
export type EffectKey = keyof Target | keyof Attack | keyof Save | keyof Damage | keyof TempHP | keyof IEffect | keyof Remove_IEffect | keyof Roll | keyof Text | keyof Variable | keyof Condition | keyof Counter | keyof Spell | keyof Check;

export interface Target {
	type: "target";
	target: "all" | "each" | number | "self" | "parent" | "children";
	effects: EffectWithTarget[];
	sortBy?: "hp_asc" | "hp_desc" | "user_input";
	self_target?: boolean;
}
export interface Attack {
	type: "attack";
	hit: EffectWithTarget[];
	miss: EffectWithTarget[];
	attackBonus?: IntExpression;
	adv?: IntExpression;
}

export interface Save {
	type: "save";
	stat: "str" | "dex" | "con" | "int" | "wis" | "cha";
	fail: EffectWithTarget[];
	success: EffectWithTarget[];
	dc?: IntExpression;
	adv?: -1 | 0 | 1;
}

export interface Damage {
	type: "damage";
	damage: AnnotatedString;
	overheal?: boolean;
	higher?: { [key: number]: string };
	cantripScale?: boolean;
	fixedValue?: boolean;
}

export interface TempHP {
	type: "temphp";
	amount: AnnotatedString;
	higher?: { [key: number]: string };
	cantripScale?: boolean;
}

export interface IEffect {
	type: "ieffect2";
	name: AnnotatedString;
	duration?: IntExpression;
	effects?: PassiveEffects;
	attacks?: AttackInteraction[];
	buttons?: ButtonInteraction[];
	end?: boolean;
	conc?: boolean;
	desc?: AnnotatedString;
	stacking?: boolean;
	save_as?: string;
	parent?: string;
	target_self?: boolean;
	tick_on_caster?: boolean;
	hidden?: boolean;
}

export interface PassiveEffects {
	attack_advantage?: IntExpression;
	to_hit_bonus?: AnnotatedString;
	damage_bonus?: AnnotatedString;
	magical_damage?: IntExpression;
	silvered_damage?: IntExpression;
	resistances?: AnnotatedString[];
	immunities?: AnnotatedString[];
	vulnerabilities?: AnnotatedString[];
	ignored_resistances?: AnnotatedString[];
	ac_value?: IntExpression;
	ac_bonus?: IntExpression;
	max_hp_value?: IntExpression;
	max_hp_bonus?: IntExpression;
	save_bonus?: AnnotatedString;
	save_adv?: AnnotatedString[];
	save_dis?: AnnotatedString[];
	check_bonus?: AnnotatedString;
	check_adv?: AnnotatedString[];
	check_dis?: AnnotatedString[];
	dc_bonus?: IntExpression;
}
export interface AttackInteraction {
	attack: AttackModel;
	defaultDC?: IntExpression;
	defaultAttackBonus?: IntExpression;
	defaultCastingMod?: IntExpression;
}

export interface ButtonInteraction {
	automation: Effect[];
	label: AnnotatedString;
	verb?: AnnotatedString;
	style?: IntExpression;
	defaultDC?: IntExpression;
	defaultAttackBonus?: IntExpression;
	defaultCastingMod?: IntExpression;
}

export interface Remove_IEffect {
	type: "remove_ieffect";
	removeParent?: "always" | "if_no_children";
}

export interface Roll {
	type: "roll";
	dice: AnnotatedString;
	name: string;
	higher?: { [key: number]: string };
	cantripScale?: boolean;
	hidden?: boolean;
	displayName?: string;
	fixedValue?: boolean;
}

export interface Text {
	type: "text";
	text: AnnotatedString | AbilityReference;
	title?: string;
}

export interface AbilityReference {
	id: number;
	typeId: number;
}

export interface Variable {
	type: "variable";
	name: string;
	value: IntExpression;
	higher?: { [key: number]: IntExpression };
	onError?: IntExpression;
}

export interface Condition {
	type: "condition";
	condition: IntExpression;
	onTrue: Effect[];
	onFalse: Effect[];
	errorBehaviour?: "true" | "false" | "both" | "neither" | "raise";
}

export interface Counter {
	type: "counter";
	counter: string | SpellSlotReference | AbilityReference;
	amount: IntExpression;
	allowOverflow?: boolean;
	errorBehaviour?: "warn" | "raise" | "ignore";
	fixedValue?: boolean;
}

export interface SpellSlotReference {
	slot: number | IntExpression;
}

export interface Spell {
	type: "spell";
	id: number;
	level?: number;
	dc?: IntExpression;
	attackBonus?: IntExpression;
	castingMod?: IntExpression;
	parent?: string;
}

export interface Check {
	type: "check";
	ability: string[];
	contestAbility?: string[];
	dc?: IntExpression;
	success: Effect[];
	fail: Effect[];
	contestTie?: "fail" | "success" | "neither";
	adv?: -1 | 0 | 1;
}
