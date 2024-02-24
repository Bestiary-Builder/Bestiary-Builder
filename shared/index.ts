export * from "./types";
import types from "./types-ti";
export const typeInterface = types;

import type {IErrorDetail} from "ts-interface-checker";

export function interfaceValidation(validation: IErrorDetail[], nestlevel = 0 as number) {
	let message = "";
	for (let err of validation) {
		message += `${"	".repeat(nestlevel)}${err.path.replace("value.", "")} ${err.message}${err.nested ? ":" : "."}\n`;
		if (err.nested) {
			message += interfaceValidation(err.nested, nestlevel + 1) ?? "";
		}
	}
	return message;
}
