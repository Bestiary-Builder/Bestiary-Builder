const keywords = ["bestiary", "bestiary builder", "creator", "creatures", "D&D", "avrae", "D&D 5e", "creature creator"];
const image = "https://bestiarybuilder.com/logo.png";
const description = "Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!";
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
		content: keywords.join(",")
	},
	{
		name: "image",
		type: "name",
		content: image
	},
	{
		name: "description",
		type: "name",
		content: description
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
		content: description
	},
	{
		name: "image",
		type: "itemprop",
		content: image
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
		content: description
	},
	{
		name: "twitter:site",
		type: "name",
		content: ""
	},
	{
		name: "twitter:image",
		type: "name",
		content: image
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
		content: description
	},
	{
		name: "og:image",
		type: "property",
		content: image
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
] as readonly metaTag[];

export const routes = [
	//Home
	{
		path: "/",
		name: "",
		meta: {
			dynamic: false
		}
	},
	// help
	{
		path: "/help",
		name: "Help",
		meta: {
			dynamic: false
		}
	},

	// a list of your bestiaries
	{
		path: "/my-bestiaries",
		name: "My Bestiaries",
		meta: {
			dynamic: false
		}
	},
	// a list of all public bestiaries
	{
		path: "/bestiaries",
		name: "Public Bestiaries",
		meta: {
			dynamic: false
		}
	},
	// viewing a particular bestiary or edit it
	{
		path: "/bestiary-viewer/:id",
		name: "Bestiary Viewer",
		meta: {
			dynamic: true
		}
	},
	// editing a creature in a bestiary (which one by url param)
	{
		path: "/statblock-editor/:id",
		name: "Stat block Editor",
		meta: {
			dynamic: true
		}
	},
	// user settings
	{
		path: "/user",
		name: "User Settings",
		meta: {
			dynamic: false
		}
	},

	// privacy policy
	{
		path: "/privacy-policy",
		name: "Privacy Policy",
		meta: {
			dynamic: false
		}
	},
	// terms and conditions
	{
		path: "/terms-and-conditions",
		name: "Terms And Conditions",
		meta: {
			dynamic: false
		}
	},
	// changelog
	{
		path: "/changelog",
		name: "Changelog",
		meta: {
			dynamic: false
		}
	},
	// 404 not found page
	{
		path: "/notfound",
		name: "Page not found",
		meta: {
			dynamic: false
		}
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
		dynamic: boolean;
		description?: string;
		keywords?: string;
		image?: string;
	};
}
