export const defaultMetaTags = [
	//Basic
	{
		name: "title",
		type: "name",
		content: "Bestiary Builder"
	},
	{
		name: "keywords",
		type: "name",
		content: ""
	},
	{
		name: "image",
		type: "name",
		content: "https://bestiarybuilder.com/logo.png"
	},
	{
		name: "description",
		type: "name",
		content: "Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!"
	},
	//Schema.org for Google
	{
		name: "name",
		type: "itemprop",
		content: "Bestiary Builder"
	},
	{
		name: "description",
		type: "itemprop",
		content: "Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!"
	},
	{
		name: "image",
		type: "itemprop",
		content: "https://bestiarybuilder.com/logo.png"
	},
	//Twitter
	{
		name: "twitter:card",
		type: "name",
		content: "summary"
	},
	{
		name: "twitter:title",
		type: "name",
		content: "Bestiary Builder"
	},
	{
		name: "twitter:description",
		type: "name",
		content: "Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!"
	},
	{
		name: "twitter:site",
		type: "name",
		content: ""
	},
	{
		name: "twitter:image",
		type: "name",
		content: "https://bestiarybuilder.com/logo.png"
	},
	//Open Graph general (Facebook, Pinterest & Google+)
	{
		name: "og:title",
		type: "property",
		content: "Bestiary Builder"
	},
	{
		name: "og:description",
		type: "property",
		content: "Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!"
	},
	{
		name: "og:image",
		type: "property",
		content: "https://bestiarybuilder.com/logo.png"
	},
	{
		name: "og:url",
		type: "property",
		content: "https://bestiarybuilder.com"
	},
	{
		name: "og:site_name",
		type: "property",
		content: "Bestiary Builder"
	},
	{
		name: "og:type",
		type: "property",
		content: "website"
	}
] as metaTag[];

export const routes = [
	//Home
	{
		path: "/",
		name: ""
	},
	// help
	{
		path: "/help",
		name: "Help"
	},

	// a list of your bestiaries
	{
		path: "/my-bestiaries",
		name: "My Bestiaries"
	},
	// a list of all public bestiaries
	{
		path: "/bestiaries",
		name: "Public Bestiaries"
	},
	// viewing a particular bestiary or edit it
	{
		path: "/bestiary-viewer/:id",
		name: "Bestiary Viewer"
	},
	// editing a creature in a bestiary (which one by url param)
	{
		path: "/statblock-editor/:id",
		name: "Stat block Editor"
	},
	// user settings
	{
		path: "/user",
		name: "User Settings"
	},

	// privacy policy
	{
		path: "/privacy-policy",
		name: "Privacy Policy"
	},
	// terms and conditions
	{
		path: "/terms-and-conditions",
		name: "Terms And Conditions"
	},
	// changelog
	{
		path: "/changelog",
		name: "Changelog"
	},
	// 404 not found page
	{
		path: "/notfound",
		name: "Page not found"
	}
] as Route[];

export interface metaTag {
	name: string;
	type: string;
	content: string;
}
export interface Route {
	path: string;
	name: string;
	meta: {
		icon?: string;
		description?: string;
		keywords?: string;
		image?: string;
	};
}
