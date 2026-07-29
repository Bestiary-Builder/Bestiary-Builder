if (import.meta.env.MODE === "production") {
	const script = document.createElement("script");
	script.defer = true;
	script.src = import.meta.env.VITE_UMAMI_URL;
	script.setAttribute("data-website-id", import.meta.env.VITE_UMAMI_WEBSITE_ID);
	script.setAttribute("data-performance", "true");
	document.head.appendChild(script);
}

export const getUmami = () => window.umami as umami.umami | undefined;
