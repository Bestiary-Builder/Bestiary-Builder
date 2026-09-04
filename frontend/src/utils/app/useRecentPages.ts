// composables/useRecentPages.ts
import { useLocalStorage } from "@vueuse/core";

interface RecentPage {
	path: string;
	label: string;
	icon: string;
	visitedAt: number;
}

interface TrackedRoute {
	pattern: RegExp;
	icon: string;
	labelPrefix: string;
}

const MAX_RECENT = 5;

const TRACKED_ROUTES: TrackedRoute[] = [
	{ pattern: /^\/creature\/edit\/([^/]+)$/, icon: "$creature", labelPrefix: "Creature" },
	{ pattern: /^\/bestiary\/edit\/([^/]+)$/, icon: "$bestiary", labelPrefix: "Bestiary" },
	{ pattern: /^\/armory\/edit\/([^/]+)$/, icon: "$automationCollection", labelPrefix: "Armory" },
	{ pattern: /^\/automation\/edit\/([^/]+)$/, icon: "$automation", labelPrefix: "Automation" },
	{ pattern: /^\/characters\/([^/]+)$/, icon: "$character", labelPrefix: "Character" },
];

const recentPages = useLocalStorage<RecentPage[]>("recent-pages", []);

const trackVisit = (path: string, label?: string) => {
	const match = TRACKED_ROUTES.find(route => route.pattern.test(path));
	if (!match)
		return; // not a route we care about — do nothing

	const withoutDuplicate = recentPages.value.filter(p => p.path !== path);

	recentPages.value = [
		{
			path,
			label: label || `${match.labelPrefix} ${path.split("/").pop()}`,
			icon: match.icon,
			visitedAt: Date.now(),
		},
		...withoutDuplicate,
	].slice(0, MAX_RECENT);
};

// call this once the real name is fetched, to patch the existing entry in place
const updateLabel = (path: string, label: string) => {
	const entry = recentPages.value.find(p => p.path === path);
	if (entry)
		entry.label = label;
};

export const useRecentPages = () => {
	return {
		recentPages,
		trackVisit,
		updateLabel
	};
};
