//Api handling
async function handleApiResponse<Type>(response: Response): Promise<{success: true; data: Type} | {success: false; error: string}> {
	let data = await response.json();
	if (response.status >= 200 && response.status < 300) {
		//Succesful
		return {success: true, data: data as Type};
	} else {
		//Failed
		return {success: false, error: data.error as string};
	}
}
export async function fetchBackend<Type>(url: string, method: "GET" | "POST" = "GET", body?: unknown) {
	let result = await fetch(url, {
		method: method,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: body
			? JSON.stringify({
					data: body
			  })
			: undefined
	}).then((response) => handleApiResponse<Type>(response));
	return result;
}
//Get logged in user
import type {User} from "~/shared";
export const user = fetchBackend<User>("/api/user").then(async (result) => {
	if (result.success) return result.data;
	else return null;
});
export type limitsType = {
	nameLength: number;
	nameMin: number;
	descriptionLength: number;
	creatureAmount: number;
	imageFormats: string[];
};
export const asyncLimits = fetchBackend<limitsType>("/api/limits").then(async (result) => {
	if (result.success) return result.data;
	else return null;
});
export const tags = fetchBackend<string[]>("/api/tags").then(async (result) => {
	if (result.success) return result.data;
	else return null;
});
const clientId = import.meta.env.VITE_DISCORD_ID ?? "";
const loginLink = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&response_type=code&scope=identify+email&redirect_uri=${encodeURIComponent(window.location.origin + "/user")}`;

export function sendToLogin(route: string) {
	window.document.cookie = "route=" + route;
	window.location.href = loginLink;
}
export function getLoginRoute() {
	let name = "route=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(";");
	//Reset cookie
	document.cookie = "route=;";
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
