import { createRouter, createWebHistory } from "vue-router";

import { toast } from "vue-sonner";
import { store } from "./utils/store";
import { app } from "./main";
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

// Show login messages
router.afterEach((to) => {
	const keys = Object.keys(to.query);
	if (keys.includes("loginSuccess") || keys.includes("loginError")) {
		if (to.query.loginSuccess) {
			toast.success("Succesfully logged in");
			delete to.query.loginSuccess;
		}
		if (to.query.loginError) {
			toast.error(`Login failed: ${to.query.loginError.toString()}`, { duration: 0 });
			delete to.query.loginError;
		}
		// Remove queries from parameter
		router.replace({ query: to.query, force: true }).catch((err) => {
			console.error(err);
		});
	}
});

// Export
export default router;
