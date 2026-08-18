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
		file: "other/FrontPage.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
	},
	// help
	{
		path: "/help",
		name: "Help",
		file: "other/GenericMarkdownView.vue",
		meta: { navbar: true, loggedIn: false, dynamic: false },
		props: { filePath: "help" },
	},
	{
		path: "/bestiaries/personal",
		name: "My Bestiaries",
		file: "bestiary/BestiariesPersonal.vue",
		meta: { navbar: true, loggedIn: true, dynamic: false },
	},
	{
		path: "/bestiaries/public",
		name: "Public Bestiaries",
		file: "bestiary/BestiariesPublic.vue",
		meta: { navbar: true, loggedIn: false, dynamic: false },
	},
	{
		path: "/bestiary/edit/:id",
		name: "Edit Bestiary",
		file: "bestiary/BestiaryEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: true },
	},
	{
		path: "/bestiary/view/:id",
		name: "View Bestiary",
		file: "bestiary/BestiaryView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: true },
	},
	{
		path: "/creature/edit/:id",
		name: "Edit Creature",
		file: "creature/CreatureEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: true },
	},
	{
		path: "/creature/view/:id",
		name: "View Creature",
		file: "creature/CreatureView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: true },
	},
	{
		path: "/creature/edit/:id/:type/:aid",
		name: "Feature Editor",
		file: "creature/CreatureFeatureEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: true },
	},
	{
		path: "/armory/personal",
		name: "My Automation Collections",
		file: "armory/ArmoriesPersonal.vue",
		meta: { navbar: true, loggedIn: true, dynamic: false },
	},
	{
		path: "/armory/public",
		name: "Public Automation Collections",
		file: "armory/ArmoriesPublic.vue",
		meta: { navbar: true, loggedIn: false, dynamic: false },
	},
	{
		path: "/armory/edit/:id",
		name: "Edit Automation Collection",
		file: "armory/ArmoryEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: true },
	},
	{
		path: "/armory/view/:id",
		name: "View Automation Collection",
		file: "armory/ArmoryView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: true },
	},
	{
		path: "/automation/edit/:id",
		name: "Edit Automation",
		file: "armory/AutomationEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: true },
	},
	{
		path: "/automation/view/:id",
		name: "View Automation",
		file: "armory/AutomationView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: true },
	},
	{
		path: "/characters",
		name: "My Characters",
		file: "character/CharactersPersonal.vue",
		meta: { navbar: true, loggedIn: true, dynamic: false },
	},
	{
		path: "/characters/:upstream",
		name: "Character Attacks",
		file: "character/CharacterAttacksEdit.vue",
		meta: { navbar: false, loggedIn: true, dynamic: false },
	},
	// user settings
	{
		path: "/user",
		name: "User Settings",
		file: "other/UserSettings.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
	},

	// privacy policy
	{
		path: "/privacy-policy",
		name: "Privacy Policy",
		file: "other/GenericMarkdownView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
		props: { filePath: "privacy-policy" },

	},
	// terms and conditions
	{
		path: "/terms-and-conditions",
		name: "Terms And Conditions",
		file: "other/GenericMarkdownView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
		props: { filePath: "terms-and-conditions" },
	},
	// changelog
	{
		path: "/changelog",
		name: "Changelog",
		file: "other/GenericMarkdownView.vue",
		meta: { navbar: true, loggedIn: false, dynamic: false },
		props: { filePath: "changelog" },
	},
	// Server error
	{
		path: "/server-error",
		name: "",
		file: "other/GenericMarkdownView.vue",
		meta: { navbar: false, loggedIn: false, dynamic: false },
		props: { filePath: "server-error" },
	},
	// 404 not found page - must be last.
	{
		path: "/:pathMatch(.*)*",
		name: "Page not found",
		file: "other/GenericMarkdownView.vue",
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
