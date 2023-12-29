import {fileURLToPath, URL} from "node:url";

//@ts-expect-error
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
//@ts-ignore
import {siteMapRoutes} from "./src/routes";
import Pages from "vite-plugin-pages";
import generateSitemap from "vite-plugin-pages-sitemap";
//@ts-expect-error
import FontAwesome from "unplugin-vue-fontawesome/vite";
import rawloader from "vite-raw-plugin";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		Pages({
			dirs: "src/views",
			onRoutesGenerated: (fileroutes) => {
				generateSitemap({
					routes: siteMapRoutes,
					readable: true,
					hostname: "https://bestiary.stevnbak.dk"
				});
				console.log("\nSitemap generated");
			}
		}),
		rawloader({
			fileRegex: /\.md$/
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
	},
	build: {
		chunkSizeWarningLimit: 1000,
	},
	server: {
		proxy: {
			'/api': 'http://localhost:5000'		
		},
	}
});
