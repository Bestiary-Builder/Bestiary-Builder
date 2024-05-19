/* eslint-disable regexp/no-super-linear-backtracking */
import { type FeatureEntity, parseDescIntoAutomation } from "~/shared";

export function abilityParser(fData: any, activationType: number): [FeatureEntity[], string[]] {
	const output = [] as FeatureEntity[];
	const notices = [] as string[];
	for (const f of fData ?? []) {
		const name = markdownReplacer(f.name);

		// if critterDB, don't attempt to parse spellcasting in this step.
		if (f.description && name.toLowerCase().includes("spellcasting"))
			continue;

		// f.entries for 5etools, f.description for critterdb
		const description = descParser(f.entries || f.description.replaceAll("<i>", "*").replaceAll("<b>", "**").replaceAll("</i>", "*").replaceAll("</b>", "**"));
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
					output.push(`<br><b class="indent">${markdownReplacer(i.name)}</b> ${markdownReplacer(i.entry || i?.entries.join("\n"))}`);
			}
		}
	}
	return output.join("\n");
}

export function markdownReplacer(text: string): string {
	text = text
		.replaceAll("{@atk mw}", "*Melee Weapon Attack:*")
		.replaceAll("{@atk rw}", "*Ranged Weapon Attack:*")
		.replaceAll("{@atk mw,rw}", "*Melee or Ranged Weapon Attack:*")
		.replaceAll("{@atk ms}", "*Melee Spell Attack:*")
		.replaceAll("{@atk rs}", "*Ranged Spell Attack:*")
		.replaceAll("{@atk ms,rs}", "*Melee or Ranged Spell Attack:*")
		.replaceAll("{@h}", "*Hit:* ")
		.replace(/\{@damage\s+([^}]+)\}/g, "$1")
		.replace(/\{@dc\s+([^}]+)\}/g, "DC $1")
		.replace(/\{@dice\s+([^}]+)\}/g, "$1")
		.replace(/\{@spell\s+([^}]+)\}/g, "$1")
		.replace(/\{@item\s+([^}]+)\}/g, "$1")
		.replace(/\{@condition\s+([^}]+)\}/g, "<u>$1</u>")
		.replace(/\{@recharge\s+(\d+)\}/g, "(Recharge $1-6)")
		.replace(
			/\{@quickref\s[a-z\s]+\|+\d+\}/,
			"$1".replace(/(?:^|\s)\S/g, (t) => {
				return t.toUpperCase();
			})
		)
		.replace("Recharge 6-6", "Recharge 6")
		.replace("{@recharge}", "(Recharge 6)")
		.replace(/\{@hit\s+(-?\d+)\}/g, (_, number) => (number >= 0 ? `+${number}` : number))
		.replaceAll("<u>", "*")
		.replaceAll("</u>", "*");
	return text;
}
