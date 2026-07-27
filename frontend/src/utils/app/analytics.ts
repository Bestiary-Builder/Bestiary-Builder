if (import.meta.env.MODE === "production" || true) {
	const script = document.createElement("script");
	script.defer = true;
	script.src = import.meta.env.VITE_UMAMI_URL;
	script.setAttribute("data-website-id", import.meta.env.VITE_UMAMI_WEBSITE_ID);
	script.setAttribute("data-performance", "true");
	document.head.appendChild(script);
}

export class Umami {
	// Tracks the current page
	public track(): void;
	// Custom payload
	public track(payload: object): void;
	// Custom event
	public track(event_name: string): void;
	// Custom event with data
	public track(event_name: string, data: object): void;
	// Mock implementation for typescript
	public track(a?: unknown, b?: unknown): void {}

	// Assign ID to current session
	public identify(unique_id: string): void;
	// Session data
	public identify(unique_id: string, data: object): void;
	// Session data without ID
	public identify(data: object): void;
	// Mock implementation for typescript
	public identify(a?: unknown, b?: unknown): void { }
}

// @ts-expect-error Umami object exists on the window property if in production
export const getUmami = () => window.umami as Umami | undefined;
