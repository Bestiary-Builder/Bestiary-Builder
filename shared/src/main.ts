export function interfaceValidation(validation: IErrorDetail[], nestlevel = 0 as number) {
	let message = "";
	for (let err of validation) {
		message += `<span style="margin-left:${nestlevel}rem"><span style="font-family: monospace; font-size: 1rem;">${err.path.replace("value.", "")}</span> ${err.message}${err.nested ? ":" : "."}</span>\n`;
		if (err.nested) {
			message += interfaceValidation(err.nested, nestlevel + 1) ?? "";
		}
	}
	return message.replaceAll("is not a", "is not of type");
}

import types from "./build-types-ti";
export const typeInterface = types;

import type {IErrorDetail} from "ts-interface-checker";
