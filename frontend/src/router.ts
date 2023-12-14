import {createRouter, createWebHistory} from "vue-router";

/*@ts-ignore*/
import fileRoutes from "~pages";
import relevantRoutes from "./routes";
import {blockForNonUsers} from "./routes";
import {user, loginLink} from "@/main";
const routes = relevantRoutes.map((route) => ({
	path: route.path,
	name: route.name,
	navbar: route.navbar,
	component: fileRoutes.find((fileRoute: any) => fileRoute.name === route.file.replace(".vue", "").replace("/", "-"))?.component,
	meta: route.meta,
	props: true
}));

//Create router
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: routes
});

//Reload page on route change
router.beforeEach(async (to, from, next) => {
	if (from.name && to.name != from.name) {
		///window.location.pathname = to.path;
	}

	if (blockForNonUsers.includes(to.name?.toString() ?? "")) {
		let loggedIn = await user;
		if (!loggedIn) {
			window.location.href = loginLink;
			return;
		}
	}
	next();
});

//Meta tags
router.beforeEach((to, from, next) => {
	// This goes through the matched routes from last to first, finding the closest route with a title.
	const nearestWithTitle = to.matched
		.slice()
		.reverse()
		.find((r) => r.meta && r.meta.title);

	// Find the nearest route element with meta tags.
	const nearestWithMeta = to.matched
		.slice()
		.reverse()
		.find((r) => r.meta && r.meta.metaTags);

	const previousNearestWithMeta = from.matched
		.slice()
		.reverse()
		.find((r) => r.meta && r.meta.metaTags);

	// If a route with a title was found, set the document (page) title to that value.
	if (nearestWithTitle) {
		document.title = nearestWithTitle.meta.title as string;
	} else if (previousNearestWithMeta) {
		document.title = previousNearestWithMeta.meta.title as string;
	}

	// Remove any stale meta tags from the document using the key attribute we set below.
	Array.from(document.querySelectorAll("[data-vue-router-controlled]")).map((el) => el.parentNode?.removeChild(el));

	// Skip rendering meta tags if there are none.
	if (!nearestWithMeta) return next();

	// Turn the meta tag definitions into actual elements in the head.
	(nearestWithMeta.meta.metaTags as any)
		.map((tagDef: Object) => {
			const tag = document.createElement("meta");

			Object.keys(tagDef).forEach((key: string) => {
				/*@ts-ignore*/
				tag.setAttribute(key, tagDef[key]);
			});

			// We use this to track which meta tags we create so we don't interfere with other ones.
			tag.setAttribute("data-vue-router-controlled", "");

			return tag;
		})
		// Add the meta tags to the document head.
		.forEach((tag: any) => document.head.appendChild(tag));

	next();
});

//Export
export default router;
