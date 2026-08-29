// Api handling
async function handleApiResponse<Type>(response: Response): Promise<{ success: true; data: Type; error: undefined; status: number } | { success: false; data: undefined; error: string; status: number }> {
	try {
		const data = await response.json();
		if (response.status >= 200 && response.status < 300) {
			// Succesful
			return { success: true, data: data as Type, error: undefined, status: response.status };
		}
		else {
			// Failed
			return { success: false, data: undefined, error: data.error as string, status: response.status };
		}
	}
	catch {
		return { success: false, data: undefined, error: "Unrecognized server response", status: response.status };
	}
}

export async function useFetch<Type>(url: string, method: "GET" | "POST" = "GET", body?: unknown) {
	try {
		const result = await fetch(url, {
			method,
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
				"Avrae-Token": localStorage.getItem("AvraeToken") || ""
			},
			body: body
				? JSON.stringify({
						data: body
					})
				: undefined
		}).then(async response => handleApiResponse<Type>(response));
		return result;
	}
	catch (e) {
		console.error(e);
		return { success: false, error: "Connection to backend failed.", data: undefined, status: undefined } as { success: false; data: undefined; error: string; status: undefined };
	}
}

// Login stuff:
const clientId = import.meta.env.VITE_DISCORD_ID ?? "";
const loginLink = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&response_type=code&scope=identify+email&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/login`)}`;

export function sendToLogin(route: string) {
	window.document.cookie = `route=${route}`;
	window.location.href = loginLink;
}

// Prefers reduced motion
export const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
