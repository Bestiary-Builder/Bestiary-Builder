import {createRouter, createWebHistory} from "vue-router";

// @ts-ignore
import fileRoutes from "~pages";
import {routes as sharedRoutes} from "~/shared";
import {user, sendToLogin} from "@/utils/functions";
import { nextTick } from "vue";
const routes = sharedRoutes.routes.map((route) => {
	return {
		...route,
		...{component: fileRoutes.find((fileRoute: any) => fileRoute.name === route.file.replace(".vue", "").replace("/", "-"))?.component}
	};
});

//Create router
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
		  return savedPosition
		} else {
		  return { top: 0, behavior: 'smooth' }
		}
	  },
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
