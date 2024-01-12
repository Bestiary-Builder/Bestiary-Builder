interface metaTag {
	name?: string;
	itemprop?: string;
	property?: string;
	content: string;
}
interface Route {
	path: string;
	name: string;
	file: string;
	component: any;
	meta: {
		navbar: boolean;
		loggedIn: boolean;
		icon?: string;
		description?: string;
		keywords?: string;
		image?: string;
	};
}

export const defaultMetaTags = [
	//Basic
	{
		name: "title",
		content: "Bestiary Builder"
	},
	{
		name: "keywords",
		content: ""
	},
	{
		name: "image",
		content: "https://bestiarybuilder.com/logo.svg"
	},
	{
		name: "description",
		content: "Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!"
	},
	//Schema.org for Google
	{
		itemprop: "name",
		content: "Bestiary Builder"
	},
	{
		itemprop: "description",
		content: "Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!"
	},
	{
		itemprop: "image",
		content: "https://bestiarybuilder.com/logo.svg"
	},
	//Twitter
	{
		name: "twitter:card",
		content: "summary"
	},
	{
		name: "twitter:title",
		content: "Bestiary Builder"
	},
	{
		name: "twitter:description",
		content: "Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!"
	},
	{
		name: "twitter:site",
		content: ""
	},
	{
		name: "twitter:image:src",
		content: "https://bestiarybuilder.com/logo.svg"
	},
	//Open Graph general (Facebook, Pinterest & Google+)
	{
		property: "og:title",
		content: "Bestiary Builder"
	},
	{
		property: "og:description",
		content: "Bestiary Builder, the convenient Bestiary Creator for D&D 5e, designed for incredible integration with Avrae and convenience of use!"
	},
	{
		property: "og:image",
		content: "https://bestiarybuilder.com/logo.svg"
	},
	{
		property: "og:url",
		content: "https://bestiarybuilder.com"
	},
	{
		property: "og:site_name",
		content: "Bestiary Builder"
	},
	{
		property: "og:type",
		content: "website"
	}
] as metaTag[];

const routes = [
	//Home
	{
		path: "/",
		name: "",
		file: "HomeView.vue",
		meta: {
			navbar: false,
			loggedIn: false,
			icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>`
		}
	},
	// help
	{
		path: "/help",
		navbar: true,
		loggedIn: false,
		name: "Help",
		file: "HelpView.vue",
		meta: {}
	},

	// a list of your bestiaries
	{
		path: "/my-bestiaries",
		name: "My Bestiaries",
		file: "PersonalBestiaryList.vue",
		meta: {
			navbar: true,
			loggedIn: true,
			icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M408 120c0 54.6-73.1 151.9-105.2 192c-7.7 9.6-22 9.6-29.6 0C241.1 271.9 168 174.6 168 120C168 53.7 221.7 0 288 0s120 53.7 120 120zm8 80.4c3.5-6.9 6.7-13.8 9.6-20.6c.5-1.2 1-2.5 1.5-3.7l116-46.4C558.9 123.4 576 135 576 152V422.8c0 9.8-6 18.6-15.1 22.3L416 503V200.4zM137.6 138.3c2.4 14.1 7.2 28.3 12.8 41.5c2.9 6.8 6.1 13.7 9.6 20.6V451.8L32.9 502.7C17.1 509 0 497.4 0 480.4V209.6c0-9.8 6-18.6 15.1-22.3l122.6-49zM327.8 332c13.9-17.4 35.7-45.7 56.2-77V504.3L192 449.4V255c20.5 31.3 42.3 59.6 56.2 77c20.5 25.6 59.1 25.6 79.6 0zM288 152c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40s17.9 40 40 40z"/></svg>`
		}
	},
	// a list of all public bestiaries
	{
		path: "/bestiaries",
		name: "Public Bestiaries",
		file: "PublicBestiaryList.vue",
		meta: {
			navbar: true,
			loggedIn: false,
			icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M408 120c0 54.6-73.1 151.9-105.2 192c-7.7 9.6-22 9.6-29.6 0C241.1 271.9 168 174.6 168 120C168 53.7 221.7 0 288 0s120 53.7 120 120zm8 80.4c3.5-6.9 6.7-13.8 9.6-20.6c.5-1.2 1-2.5 1.5-3.7l116-46.4C558.9 123.4 576 135 576 152V422.8c0 9.8-6 18.6-15.1 22.3L416 503V200.4zM137.6 138.3c2.4 14.1 7.2 28.3 12.8 41.5c2.9 6.8 6.1 13.7 9.6 20.6V451.8L32.9 502.7C17.1 509 0 497.4 0 480.4V209.6c0-9.8 6-18.6 15.1-22.3l122.6-49zM327.8 332c13.9-17.4 35.7-45.7 56.2-77V504.3L192 449.4V255c20.5 31.3 42.3 59.6 56.2 77c20.5 25.6 59.1 25.6 79.6 0zM288 152c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40s17.9 40 40 40z"/></svg>`
		}
	},
	// viewing a particular bestiary or edit it
	{
		path: "/bestiary-viewer/:id",
		name: "Bestiary Viewer",
		file: "BestiaryViewer.vue",
		meta: {navbar: false, loggedIn: false}
	},
	// editing a creature in a bestiary (which one by url param)
	{
		path: "/statblock-editor/:id",
		name: "Stat block Editor",
		file: "StatblockEditorView.vue",
		meta: {navbar: false, loggedIn: true}
	},
	// user settings
	{
		path: "/user",
		name: "User Settings",
		file: "UserSettings.vue",
		meta: {navbar: false, loggedIn: false}
	},

	// privacy policy
	{
		path: "/privacy-policy",
		name: "Privacy Policy",
		file: "PrivacyPolicy.vue",
		meta: {navbar: false, loggedIn: false}
	},
	// terms and conditions
	{
		path: "/terms-and-conditions",
		name: "Terms And Conditions",
		file: "TermsAndConditions.vue",
		meta: {navbar: false, loggedIn: false}
	},
	// changelog
	{
		path: "/changelog",
		name: "Changelog",
		file: "Changelog.vue",
		meta: {navbar: true, loggedIn: false}
	},
	// 404 not found page
	{
		path: "/:notfound",
		name: "Page not found",
		file: "NotFound.vue",
		meta: {navbar: false, loggedIn: false}
	}
] as Route[];
export default routes;

export const siteMapRoutes = routes.map((route) => ({
	path: route.path,
	name: route.name,
	props: true
}));
