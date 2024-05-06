//Api handling
export interface error {
	error: string;
}
export async function handleApiResponse<Type>(response: Response) {
	let data = await response.json();
	if (response.status >= 200 && response.status < 300) {
		//Succesful
		return {success: true, data: data as Type};
	} else {
		//Failed
		return {success: false, data: data as error};
	}
}
//Get logged in user
import type {User} from "~/shared";
export const user = fetch("/api/user").then(async (response: any) => {
	let result = await handleApiResponse<User>(response);
	if (result.success) return result.data as User;
	else return null;
});
export type limitsType = {
	nameLength: number;
	nameMin: number;
	descriptionLength: number;
	creatureAmount: number;
	imageFormats: string[];
};
export const asyncLimits = fetch("/api/limits").then(async (response: any) => {
	let result = await handleApiResponse<limitsType>(response);
	if (result.success) return result.data as limitsType;
	else return null;
});
export const tags = fetch("/api/tags").then(async (response: any) =>
	handleApiResponse<string[]>(response).then(async (result) => {
		if (result.success) return result.data as string[];
		else return null;
	})
);
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
