import {fileURLToPath, URL} from "node:url";

import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";

const {siteMapRoutes} = require("./src/routes");
import Pages from "vite-plugin-pages";
import generateSitemap from "vite-plugin-pages-sitemap";

import FontAwesome from "unplugin-vue-fontawesome/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		Pages({
			dirs: "src/views",
			onRoutesGenerated: (fileroutes) => {
				console.log("\nGenerating sitemap");
				generateSitemap({
					routes: siteMapRoutes,
					readable: true,
					hostname: "https://games.thecyclefrontier.wiki"
				});
				console.log("Sitemap generated");
			}
		}),
		FontAwesome({
			// the fontawesome collections to use
			collections: "free",

			// collection that is used if no collection is specified
			defaultCollection: "solid",

			// prop names to be tested for icons
			props: ["icon"],

			// component names to be tested for icons, use an empty array to check all components
			components: ["icon", "font-awesome-icon"],

			// filters for transforming targets
			include: [/\.vue$/, /\.vue\?vue/],
			exclude: [/node_modules/, /\.git/]
		})
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url))
		}
	}
});
