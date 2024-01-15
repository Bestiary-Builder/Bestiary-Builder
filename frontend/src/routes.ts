interface Route {
	path: string;
	name: string;
	file: string;
	component: any;
	meta: {
		navbar: boolean;
		loggedIn: boolean;
	};
}

export const routes = [
	//Home
	{
		path: "/",
		name: "",
		file: "HomeView.vue",
		meta: {navbar: false, loggedIn: false}
	},
	// help
	{
		path: "/help",
		name: "Help",
		file: "HelpView.vue",
		meta: {navbar: true, loggedIn: false}
	},

	// a list of your bestiaries
	{
		path: "/my-bestiaries",
		name: "My Bestiaries",
		file: "PersonalBestiaryList.vue",
		meta: {navbar: true, loggedIn: true}
	},
	// a list of all public bestiaries
	{
		path: "/bestiaries",
		name: "Public Bestiaries",
		file: "PublicBestiaryList.vue",
		meta: {navbar: true, loggedIn: false}
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

export const siteMapRoutes = routes.map((route) => ({
	path: route.path,
	name: route.name,
	props: true
}));
