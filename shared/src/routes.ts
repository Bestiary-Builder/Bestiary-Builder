export interface Route {
	path: string;
	name: string;
	file: string;
	meta: {
		navbar: boolean;
		loggedIn: boolean;
		dynamic: boolean;
		description?: string;
		keywords?: string;
		image?: string;
	};
	props?: Record<string, unknown>;
}

export const routes: Route[] = [
	// Home
	{
		path: "/",
		name: "",
		file: "FrontPage.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
	},
	// help
	{
		path: "/help",
		name: "Help",
		file: "GenericMarkdownView.vue",
		meta: { navbar: true, loggedIn: false, dynamic: false },
		props: { filePath: "help" },
	},
	{
		path: "/bestiaries/personal",
		name: "My Bestiaries",
		file: "BestiariesPersonal.vue",
		meta: { navbar: true, loggedIn: true, dynamic: false },
	},
	{
		path: "/bestiaries/public",
		name: "Public Bestiaries",
		file: "BestiariesPublic.vue",
		meta: { navbar: true, loggedIn: false, dynamic: false },
	},
	{
		path: "/bestiary/edit/:id",
		name: "Bestiary Edit",
		file: "BestiaryEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: true },
	},
	{
		path: "/bestiary/view/:id",
		name: "Bestiary Viewer",
		file: "BestiaryView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: true },
	},
	{
		path: "/creature/edit/:id",
		name: "Stat block Editor",
		file: "CreatureEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: true },
	},
	{
		path: "/creature/view/:id",
		name: "View Creature",
		file: "CreatureView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: true },
	},
	{
		path: "/creature/edit/:id/:type/:aid",
		name: "Feature Editor",
		file: "CreatureFeatureEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: true },
	},
	{
		path: "/automations/personal",
		name: "My Automation Collections",
		file: "AutomationCollectionsPersonal.vue",
		meta: { navbar: true, loggedIn: true, dynamic: false },
	},
	{
		path: "/automations/edit/:id",
		name: "Edit Automations",
		file: "AutomationCollectionEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: false },
	},
	{
		path: "/characters",
		name: "My Characters",
		file: "CharactersPersonal.vue",
		meta: { navbar: true, loggedIn: true, dynamic: false },
	},
	{
		path: "/characters/:upstream",
		name: "Character Attacks",
		file: "CharacterAttacksEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: false },
	},
	// user settings
	{
		path: "/user",
		name: "User Settings",
		file: "UserSettings.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
	},

	// privacy policy
	{
		path: "/privacy-policy",
		name: "Privacy Policy",
		file: "GenericMarkdownView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
		props: { filePath: "privacy-policy" },

	},
	// terms and conditions
	{
		path: "/terms-and-conditions",
		name: "Terms And Conditions",
		file: "GenericMarkdownView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
		props: { filePath: "terms-and-conditions" },
	},
	// changelog
	{
		path: "/changelog",
		name: "Changelog",
		file: "GenericMarkdownView.vue",
		meta: { navbar: true, loggedIn: false, dynamic: false },
		props: { filePath: "changelog" },
	},
	// Server error
	{
		path: "/server-error",
		name: "",
		file: "GenericMarkdownView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
		props: { filePath: "server-error" },
	},
	// 404 not found page - must be last.
	{
		path: "/:pathMatch(.*)*",
		name: "Page not found",
		file: "GenericMarkdownView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
		props: { filePath: "not-found" },
	},
];
export const siteMapRoutes = routes.filter(route => route.path !== "/server-error").map(route => ({
	path: route.path,
	name: route.name,
	props: true,
}));

const keywords = ["bestiary", "bestiary builder", "creator", "creatures", "D&D", "avrae", "D&D 5e", "creature creator"];
const image = "https://bestiarybuilder.com/logo.png";
const description = "Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!";
export const defaultMetaTags = [
	// Basic
	{
		name: "title",
		type: "name",
		content: "Bestiary Builder",
	},
	{
		name: "keywords",
		type: "name",
		content: keywords.join(","),
	},
	{
		name: "image",
		type: "name",
		content: image,
	},
	{
		name: "description",
		type: "name",
		content: description,
	},
	// Schema.org for Google
	{
		name: "name",
		type: "itemprop",
		content: "Bestiary Builder",
	},
	{
		name: "description",
		type: "itemprop",
		content: description,
	},
	{
		name: "image",
		type: "itemprop",
		content: image,
	},
	// Twitter
	{
		name: "twitter:card",
		type: "name",
		content: "summary",
	},
	{
		name: "twitter:title",
		type: "name",
		content: "Bestiary Builder",
	},
	{
		name: "twitter:description",
		type: "name",
		content: description,
	},
	{
		name: "twitter:site",
		type: "name",
		content: "",
	},
	{
		name: "twitter:image",
		type: "name",
		content: image,
	},
	// Open Graph general (Facebook, Pinterest & Google+)
	{
		name: "og:title",
		type: "property",
		content: "Bestiary Builder",
	},
	{
		name: "og:description",
		type: "property",
		content: description,
	},
	{
		name: "og:image",
		type: "property",
		content: image,
	},
	{
		name: "og:url",
		type: "property",
		content: "https://bestiarybuilder.com",
	},
	{
		name: "og:site_name",
		type: "property",
		content: "Bestiary Builder",
	},
	{
		name: "og:type",
		type: "property",
		content: "website",
	},
] as readonly metaTag[];

export interface metaTag {
	name: string;
	type: string;
	content: string;
}
