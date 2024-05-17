/// <reference types="vitest" />

import { URL, fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import generateSitemap from "vite-plugin-pages-sitemap";
import FontAwesome from "unplugin-vue-fontawesome/vite";
import rawloader from "vite-raw-plugin";
// @ts-expect-error Magic
import routes from "../shared/";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		Pages({
			dirs: "src/views",
			onRoutesGenerated: (_fileroutes) => {
				// @ts-expect-error untyped
				generateSitemap({
					routes: routes.siteMapRoutes,
					readable: true,
					hostname: "https://bestiarybuilder.com"
				});
				// eslint-disable-next-line no-console
				console.log("\nSitemap generated");
			}
		}),
		// @ts-expect-error untyped
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
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"~": fileURLToPath(new URL("../", import.meta.url))
		}
	},
	build: {
		chunkSizeWarningLimit: 1250,
		target: "esnext",
		outDir: "../build/frontend",
		emptyOutDir: true
	},
	optimizeDeps: {
		esbuildOptions: {
			target: "esnext"
		}
	},
	server: {
		proxy: {
			"/api": "http://localhost:5000"
		}
	}
});
