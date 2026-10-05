if (import.meta.env.MODE === "production") {
	const script = document.createElement("script");
	script.defer = true;
	script.src = import.meta.env.VITE_UMAMI_URL;
	const website_id = (window.location.hostname.startsWith("stage.") ? import.meta.env.VITE_UMAMI_STAGE_WEBSITE_ID : import.meta.env.VITE_UMAMI_WEBSITE_ID)
	script.setAttribute("data-website-id", website_id);
	script.setAttribute("data-performance", "true");
	document.head.appendChild(script);
}

class umami {
	// Tracks the current page
	public track(): Promise<string> | undefined;
	// Custom payload
	public track(payload: object): Promise<string> | undefined;
	// Custom event
	public track(event_name: string): Promise<string> | undefined;
	// Custom event with data
	public track(event_name: string, data: object): Promise<string> | undefined;
	// eslint-disable-next-line  unused-imports/no-unused-vars
	public track(a?: unknown, b?: unknown): Promise<string> | undefined {
		return undefined;
	}

	// Assign ID to current session
	public async identify(unique_id: string): Promise<void>;
	// Session data
	public async identify(unique_id: string, data: object): Promise<void>;
	// Session data without ID
	public async identify(data: object): Promise<void>;
	// eslint-disable-next-line  unused-imports/no-unused-vars
	public async identify(a?: unknown, b?: unknown): Promise<void> {
		return new Promise(resolve => resolve());
	}
}

// @ts-expect-error Umami is not defined in the global window scope type, but exists
export const getUmami = () => window.umami as umami | undefined;
