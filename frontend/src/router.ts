import {createRouter, createWebHistory} from "vue-router";

/*@ts-ignore*/
import fileRoutes from "~pages";
import {routes as relevantRoutes} from "./routes";
import {user, sendToLogin} from "@/main";
const routes = relevantRoutes.map((route) => {
	return {
		...route,
		...{component: fileRoutes.find((fileRoute: any) => fileRoute.name === route.file.replace(".vue", "").replace("/", "-"))?.component, props: true}
	};
});

//Create router
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: routes
});

//Check logged in
router.beforeEach(async (to, from, next) => {
	//Requires being logged in?
	if (to.meta.loggedIn) {
		let loggedIn = await user;
		if (!loggedIn) {
			sendToLogin(to.path);
			return;
		}
	}
	next();
});
//Change title on route change
router.beforeEach((to, from, next) => {
	let name = (to.name?.toString() ?? "") + " | Bestiary Builder";
	if (name.startsWith(" | ")) name = "Bestiary Builder";
	document.title = name;
	next();
});

//Export
export default router;
