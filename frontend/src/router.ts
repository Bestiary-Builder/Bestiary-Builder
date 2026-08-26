import { createRouter, createWebHistory } from "vue-router";
// @ts-expect-error Comes in from vite-plugin-pages
import fileRoutes from "~pages";
import { sendToLogin } from "@/utils/utils";

import { routes as sharedRoutes } from "~/shared";
import { useToast } from "./utils/app/toast";
import { useRecentPages } from "./utils/app/useRecentPages";

import { store } from "./utils/store";

const { addToast } = useToast();
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
router.beforeEach(async (to, from) => {
	// On server error, refresh page to check for updated info
	if (from.path === "/server-error") {
		window.location.href = to.fullPath;
		return false;
	}
	// Requires being logged in?
	if (to.meta.loggedIn) {
		if (!store.user) {
			if (to.fullPath.includes("/bestiary/edit"))
				return `/bestiary/view/${to.params.id as string || ""}`;
			if (to.fullPath.includes("/creature/edit"))
				return `/creature/view/${to.params.id as string || ""}`;
			sendToLogin(to.path);
			return false;
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
			addToast("Succesfully logged in", { color: "success" });
			delete to.query.loginSuccess;
		}
		if (to.query.loginError) {
			addToast(`Login failed: ${to.query.loginError.toString()}`, { color: "success", timeout: -1 });
			delete to.query.loginError;
		}
		// Remove queries from parameter
		router.replace({ query: to.query, force: true }).catch((err) => {
			console.error(err);
		});
	}

	const { trackVisit } = useRecentPages();
	trackVisit(to.path, to.meta.pageTitle as string | undefined);
});

// Export
export default router;
