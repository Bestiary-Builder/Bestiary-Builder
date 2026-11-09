export type AutomationModel = null | AttackModel | AttackModel[];
type Maybe<T> = T | null | undefined;

export interface AttackModel {
	_v: 2;
	name: string;
	automation: Effect[];
	verb?: Maybe<string>;
	proper?: Maybe<boolean>;
	criton?: Maybe<number>;
	phrase?: Maybe<string>;
	thumb?: Maybe<string>;
	extra_crit_damage?: Maybe<string>;
	activation_type?: Maybe<number>;
	list_display_override?: Maybe<string>;
}

export type IntExpression = string | number;
// despite it being an Annotated_String_, a number is actually valid. Avrae uses Pydantic 1.9 `constr`, which also supports floats and ints by casting them to a string...
export type AnnotatedString = string | number;
export type Effect = Target | Remove_IEffect | Roll | Text | Variable | Condition | Counter | Spell | Check | Attack | Save | Damage | TempHP | IEffect;
export type EffectKey = keyof Target | keyof Attack | keyof Save | keyof Damage | keyof TempHP | keyof IEffect | keyof Remove_IEffect | keyof Roll | keyof Text | keyof Variable | keyof Condition | keyof Counter | keyof Spell | keyof Check;

export interface Target {
	type: "target";
	target: "all" | "each" | number | "self" | "parent" | "children";
	effects: Effect[];
	sortBy?: Maybe<"hp_asc" | "hp_desc" | "user_input">;
	self_target?: Maybe<boolean>;
}
export interface Attack {
	type: "attack";
	hit: Effect[];
	miss: Effect[];
	attackBonus?: Maybe<IntExpression>;
	adv?: Maybe<IntExpression>;
}

export interface Save {
	type: "save";
	stat: "str" | "dex" | "con" | "int" | "wis" | "cha";
	fail: Effect[];
	success: Effect[];
	dc?: Maybe<IntExpression>;
	adv?: Maybe<-1 | 0 | 1>;
}

export interface Damage {
	type: "damage";
	damage: AnnotatedString;
	overheal?: Maybe<boolean>;
	higher?: Maybe<{ [key: number]: string }>;
	cantripScale?: Maybe<boolean>;
	fixedValue?: Maybe<boolean>;
}

export interface TempHP {
	type: "temphp";
	amount: AnnotatedString;
	higher?: Maybe<{ [key: number]: string }>;
	cantripScale?: Maybe<boolean>;
}

export interface IEffect {
	type: "ieffect2";
	name: AnnotatedString;
	duration?: Maybe<IntExpression>;
	effects?: Maybe<PassiveEffects>;
	attacks?: Maybe<AttackInteraction[]>;
	buttons?: Maybe<ButtonInteraction[]>;
	end?: Maybe<boolean>;
	conc?: Maybe<boolean>;
	desc?: Maybe<AnnotatedString>;
	stacking?: Maybe<boolean>;
	save_as?: Maybe<string>;
	parent?: Maybe<string>;
	target_self?: Maybe<boolean>;
	tick_on_caster?: Maybe<boolean>;
	hidden?: Maybe<boolean>;
}

export interface PassiveEffects {
	attack_advantage?: Maybe<IntExpression>;
	to_hit_bonus?: Maybe<AnnotatedString>;
	damage_bonus?: Maybe<AnnotatedString>;
	magical_damage?: Maybe<IntExpression>;
	silvered_damage?: Maybe<IntExpression>;
	resistances?: Maybe<AnnotatedString[]>;
	immunities?: Maybe<AnnotatedString[]>;
	vulnerabilities?: Maybe<AnnotatedString[]>;
	ignored_resistances?: Maybe<AnnotatedString[]>;
	ac_value?: Maybe<IntExpression>;
	ac_bonus?: Maybe<IntExpression>;
	max_hp_value?: Maybe<IntExpression>;
	max_hp_bonus?: Maybe<IntExpression>;
	save_bonus?: Maybe<AnnotatedString>;
	save_adv?: Maybe<AnnotatedString[]>;
	save_dis?: Maybe<AnnotatedString[]>;
	check_bonus?: Maybe<AnnotatedString>;
	check_adv?: Maybe<AnnotatedString[]>;
	check_dis?: Maybe<AnnotatedString[]>;
	dc_bonus?: Maybe<IntExpression>;
}
export interface AttackInteraction {
	attack: AttackModel;
	defaultDC?: Maybe<IntExpression>;
	defaultAttackBonus?: Maybe<IntExpression>;
	defaultCastingMod?: Maybe<IntExpression>;
}

export interface ButtonInteraction {
	automation: Effect[];
	label: AnnotatedString;
	verb?: Maybe<AnnotatedString>;
	style?: Maybe<IntExpression>;
	defaultDC?: Maybe<IntExpression>;
	defaultAttackBonus?: Maybe<IntExpression>;
	defaultCastingMod?: Maybe<IntExpression>;
}

export interface Remove_IEffect {
	type: "remove_ieffect";
	removeParent?: Maybe<"always" | "if_no_children">;
}

export interface Roll {
	type: "roll";
	dice: AnnotatedString;
	name: string;
	higher?: Maybe<{ [key: number]: string }>;
	cantripScale?: Maybe<boolean>;
	hidden?: Maybe<boolean>;
	displayName?: Maybe<string>;
	fixedValue?: Maybe<boolean>;
}

export interface Text {
	type: "text";
	text: AnnotatedString | AbilityReference;
	title?: Maybe<string>;
}

export interface AbilityReference {
	id: number;
	typeId: number;
}

export interface Variable {
	type: "variable";
	name: string;
	value: IntExpression;
	higher?: Maybe<{ [key: number]: IntExpression }>;
	onError?: Maybe<IntExpression>;
}

export interface Condition {
	type: "condition";
	condition: IntExpression;
	onTrue: Effect[];
	onFalse: Effect[];
	errorBehaviour?: Maybe<"true" | "false" | "both" | "neither" | "raise">;
}

export interface Counter {
	type: "counter";
	counter: string | SpellSlotReference | AbilityReference;
	amount: IntExpression;
	allowOverflow?: Maybe<boolean>;
	errorBehaviour?: Maybe<"warn" | "raise" | "ignore">;
	fixedValue?: Maybe<boolean>;
}

export interface SpellSlotReference {
	slot: number | IntExpression;
}

export interface Spell {
	type: "spell";
	id: number;
	level?: Maybe<number>;
	dc?: Maybe<IntExpression>;
	attackBonus?: Maybe<IntExpression>;
	castingMod?: Maybe<IntExpression>;
	parent?: Maybe<string>;
}

export interface Check {
	type: "check";
	ability: string[];
	contestAbility?: string[];
	dc?: Maybe<IntExpression>;
	success: Effect[];
	fail: Effect[];
	contestTie?: Maybe<"fail" | "success" | "neither">;
	adv?: Maybe<-1 | 0 | 1>;
}
