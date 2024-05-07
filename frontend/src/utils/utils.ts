//Api handling
async function handleApiResponse<Type>(response: Response): Promise<{success: true; data: Type; error: undefined} | {success: false; data: undefined; error: string}> {
	let data = await response.json();
	if (response.status >= 200 && response.status < 300) {
		//Succesful
		return {success: true, data: data as Type, error: undefined};
	} else {
		//Failed
		return {success: false, data: undefined, error: data.error as string};
	}
}

export async function useFetch<Type>(url: string, method: "GET" | "POST" = "GET", body?: unknown) {
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
