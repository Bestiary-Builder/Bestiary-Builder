import type { IValidation as TypiaValidation } from "typia";

export * from "./typia-output/automation-consumable";
export * from "./typia-output/automation-model";
export * from "./typia-output/search";
export * from "./typia-output/statblock";
export type { IValidation } from "typia";

export function interfaceValidation(validation: TypiaValidation.IError[]) {
	let message = "";
	for (const err of validation) {
		const path = err.path.replace(/^\$input\.?/, "") || "value";
		message += `<span><span style="font-family: monospace; font-size: 1rem;">${escapeHtml(path)}</span> is not of type ${escapeHtml(err.expected)}.</span>\n`;
	}
	return message;
}

function escapeHtml(value: string) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
