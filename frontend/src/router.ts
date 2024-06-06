import { createRouter, createWebHistory } from "vue-router";

import { store } from "./utils/store";
// @ts-expect-error Comes in from vite-plugin-pages
import fileRoutes from "~pages";
import { routes as sharedRoutes } from "~/shared";
import { sendToLogin } from "@/utils/utils";

const routes = sharedRoutes.routes.map((route) => {
	return {
		...route,
		...{ component: fileRoutes.find((fileRoute: any) => fileRoute.name === route.file.replace(".vue", "").replace("/", "-"))?.component }
	};
});

// Create router
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition)
			return savedPosition;
		else
			return { top: 0, behavior: "smooth" };
	}
});

// Check logged in
router.beforeEach(async (to, _from) => {
	// Requires being logged in?
	if (to.meta.loggedIn) {
		if (!store.user) {
			sendToLogin(to.path);
			return;
		}
	}
	return true;
});
// Change title on route change
router.beforeEach((to, _from) => {
	let name = `${to.name?.toString() ?? ""} | Bestiary Builder`;
	if (name.startsWith(" | "))
		name = "Bestiary Builder";
	document.title = name;
	return true;
});

// Export
export default router;
