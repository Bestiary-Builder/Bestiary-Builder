/* eslint-disable regexp/no-misleading-capturing-group */
/* eslint-disable regexp/no-super-linear-backtracking */
import type { CasterSpells, FeatureEntity, SenseEntity, SpeedEntity } from "~/shared";
import { parseDescIntoAutomation } from "~/shared";

export function abilityParser(fData: any, activationType: number): [FeatureEntity[], string[]] {
	const output = [] as FeatureEntity[];
	const notices = [] as string[];
	for (const f of fData ?? []) {
		const name = markdownReplacer(f.name);

		// if critterDB, don't attempt to parse spellcasting in this step.
		if (f.description && name.toLowerCase().includes("spellcasting"))
			continue;

		// f.entries / f.headerEntries for 5etools, f.description for critterdb
		const description = descParser(f.entries || f.headerEntries || (f.description || "").replaceAll("<i>", "*").replaceAll("<b>", "**").replaceAll("</i>", "*").replaceAll("</b>", "**").replaceAll("<I>", "*").replaceAll("</I>", "*").replaceAll("<B>", "**").replaceAll("</B>", "**"));
		const [automation, notice] = parseDescIntoAutomation(description, name, activationType);
		if (notice)
			notices.push(notice);
		output.push({
			name,
			description: description.replace(/<avrae hidden>.*?<\/avrae>/gis, ""),
			automation
		});
	}
	return [output, notices];
}

export function parseSenses(senses: string[] = []): SenseEntity[] {
	const output: SenseEntity[] = [];
	for (const sense of senses) {
		const value = Number.parseInt(sense.replace(/[a-z]/gi, ""));
		let name = "";
		let isBlind = false;

		if (sense.toLowerCase().includes("dark")) {
			name = "Darkvision";
		}
		else if (sense.toLowerCase().includes("blind")) {
			name = "Blindsight";
			isBlind = senses.some(value => value.includes("blind beyond this radius"));
		}
		else if (sense.toLowerCase().includes("true")) {
			name = "Truesight";
		}
		else if (sense.toLowerCase().includes("tremor")) {
			name = "Tremorsense";
		}

		if (name)
			output.push({ name, value, unit: "ft", comment: isBlind ? "blind beyond this radius" : "" });
	}
	return output;
}

export function buildSpeedEntries(speeds: { walk?: number; fly?: number; climb?: number; swim?: number; burrow?: number; hover?: boolean }): SpeedEntity[] {
	const output: SpeedEntity[] = [];
	for (const [name, value] of Object.entries(speeds)) {
		if (name === "hover" || typeof value !== "number" || !value)
			continue;
		output.push({
			name: name[0].toUpperCase() + name.slice(1),
			value,
			comment: name === "fly" && speeds.hover ? "hover" : "",
			unit: "ft"
		});
	}
	return output;
}

export function detectCastingClass(text: string): CasterSpells["castingClass"] {
	for (const casterClass of ["Wizard", "Ranger", "Sorcerer", "Bard", "Druid", "Artificer", "Cleric", "Warlock", "Paladin"] as const) {
		if (text.toLowerCase().includes(casterClass.toLowerCase()))
			return casterClass;
	}
	return null;
}

export function descParser(dData: any) {
	if (typeof dData == "string")
		return dData;
	const output = [];
	for (const d of dData) {
		if (typeof d == "string")
			output.push(markdownReplacer(d));
		if (typeof d == "object") {
			if (d.type === "list") {
				for (const i of d.items)
					output.push(`* *${markdownReplacer(i.name)}*: ${markdownReplacer(i.entry || i?.entries.join("\n"))}`);
			}
		}
	}
	return output.join("\n");
}

export function markdownReplacer(text: string): string {
	if (text === undefined || text === null || text === "")
		return "";
	text = text
		.replaceAll("{@atk mw}", "*Melee Weapon Attack:*")
		.replaceAll("{@atk m}", "*Melee Attack:*")
		.replaceAll("{@atk r}", "*Ranged Attack:*")
		.replaceAll("{@atkr m}", "*Melee Attack Roll:*")
		.replaceAll("{@atkr r}", "*Ranged Attack Roll:*")
		.replaceAll("{@atkr m,r}", "*Melee or Ranged Attack Roll:*")
		.replaceAll("{@atk rw}", "*Ranged Weapon Attack:*")
		.replaceAll("{@atk mw,rw}", "*Melee or Ranged Weapon Attack:*")
		.replaceAll("{@atk ms}", "*Melee Spell Attack:*")
		.replaceAll("{@atk rs}", "*Ranged Spell Attack:*")
		.replaceAll("{@atk ms,rs}", "*Melee or Ranged Spell Attack:*")
		.replaceAll("{@h}", "*Hit:* ")
		.replaceAll(/\{@damage\s+([^}]+)\}/g, "$1")
		.replaceAll(/\{@dice\s+([^}]+)\}/g, "$1")
		.replaceAll(/\{@spell\s+([^}|]+).+?\}/g, "$1")
		.replaceAll(/\{@dc\s+([^}]+)\}/g, "DC $1")
		.replaceAll(/\{@item\s+([^}|]+).+?\}/g, "$1")
		.replaceAll(/\{@skill\s+([^}|]+).+?\}/g, "$1")
		.replaceAll(/\{@variantrule\s+([^}|]+).+?\}/g, "$1")
		.replaceAll(/\{@action\s+([^}|]+).+?\}/g, "$1")
		.replaceAll(/\{@condition\s+([^}|]+).+?\}/g, "*$1*")
		.replaceAll(/\{@status\s+([^}|]+).+?\}/g, "$1")
		.replaceAll(/\{@creature\s+([^}|]+).+?\}/g, "*$1*")
		.replaceAll(/\{@hazard\s+([^}|]+).+?\}/g, "$1")
		.replaceAll(" [Area of Effect]", "")
		.replaceAll(/\{@recharge\s+(\d+)\}/g, "(Recharge $1-6)")
		.replaceAll("{@actSave str}", "*Strength Saving Throw*:")
		.replaceAll("{@actSave dex}", "*Dexterity Saving Throw*:")
		.replaceAll("{@actSave con}", "*Constitution Saving Throw*:")
		.replaceAll("{@actSave wis}", "*Wisdom Saving Throw*:")
		.replaceAll("{@actSave cha}", "*Charisma Saving Throw*:")
		.replaceAll("{@actSave int}", "*Intelligence Saving Throw*:")
		.replaceAll("{@hom}", "*Hit or Miss*: ")
		.replaceAll("{@actSaveFail}", "*Failure*:")
		.replaceAll("{@actSaveFail 1}", "*First Failure*:")
		.replaceAll("{@actSaveFail 2}", "*Second Failure*:")
		.replaceAll("{@actSaveFail 3}", "*Third Failure*:")
		.replaceAll("{@actSaveFailBy 5}", "*Failure by 5 or More*:")
		.replaceAll("{@actSaveSuccess}", "*Success*:")
		.replaceAll("{@actSaveSuccessOrFail}", "*Failure or Success*:")
		.replaceAll("{@actTrigger}", "*Trigger*:")
		.replaceAll("{@actResponse}", "*Response*:")
		.replaceAll("{@actResponse d}", "*Response*—")
		.replaceAll(/\{@quickref.*\|([^|}]*)\}/g, "$1")
		.replaceAll(
			/\{@quickref\s[a-z\s]+\|+\d+\}/g,
			"$1".replace(/(?:^|\s)\S/g, (t) => {
				return t.toUpperCase();
			})
		)
		.replaceAll(/\{@chance.*\|([^|}]*)\}/g, "$1")
		.replaceAll("Recharge 6-6", "Recharge 6")
		.replaceAll("{@recharge}", "(Recharge 6)")
		.replaceAll(/\{@hit\s+(-?\d+)\}/g, (_, number) => (number >= 0 ? `+${number}` : number))
		.replaceAll("<u>", "*")
		.replaceAll("</u>", "*");
	return text;
}
