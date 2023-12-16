import {createRouter, createWebHistory} from "vue-router";

/*@ts-ignore*/
import fileRoutes from "~pages";
import relevantRoutes, {defaultMetaTags} from "./routes";
import {user, loginLink} from "@/main";
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

//Before each
router.beforeEach(async (to, from, next) => {
	//Reload page on route switch
	if (from.name && to.name != from.name) {
		///window.location.pathname = to.path;
	}

	//Requires being logged in?
	if (routes.find((a) => a.path == to.path)?.loggedIn) {
		let loggedIn = await user;
		if (!loggedIn) {
			window.location.href = loginLink;
			return;
		}
	}

	//Meta tags
	let current = to.matched[0];
	// If a route with a title was found, set the document (page) title to that value.
	let name = current.name?.toString() as string;
	if (!name || name == "") name = "Bestiary Builder";
	else name += " | Bestiary Builder";
	document.title = name;
	// Remove any stale meta tags from the document using the key attribute set below.
	Array.from(document.querySelectorAll("[data-vue-router-controlled]")).map((el) => el.parentNode?.removeChild(el));
	// Turn the meta tag definitions into actual elements in the head.
	let metaTags = defaultMetaTags;
	metaTags
		.map((tagDef) => {
			//Change content of meta tags:
			if (tagDef.name?.includes("title") || tagDef.itemprop?.includes("name")) tagDef.content = name;
			else if (tagDef.name?.includes("description") || tagDef.itemprop?.includes("description")) tagDef.content = (current.meta.description ?? "") as string;
			else if (tagDef.name == "keywords") tagDef.content = (current.meta.keywords ?? "") as string;
			else if (tagDef.name?.includes("image") || tagDef.itemprop == "image") tagDef.content = (current.meta.image ?? "") as string;
			//Create meta element
			const tag = document.createElement("meta");
			Object.keys(tagDef).forEach((key: string) => {
				/*@ts-ignore*/
				tag.setAttribute(key, tagDef[key]);
			});
			tag.setAttribute("data-vue-router-controlled", "");
			return tag;
		})
		// Add the meta tags to the document head.
		.forEach((tag: any) => document.head.appendChild(tag));

	//Continue
	next();
});

//Export
export default router; /*@ts-ignore*/
