/// <reference types="vitest" />

import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";

import { defineConfig } from "vite";
import Pages from "vite-plugin-pages";
import generateSitemap from "vite-plugin-pages-sitemap";
import rawloader from "vite-raw-plugin";
import svgLoader from "vite-svg-loader";
import vuetify from 'vite-plugin-vuetify'
import { visualizer } from 'rollup-plugin-visualizer';

// @ts-expect-error Magic
import { routes } from "../shared/";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vuetify(),
		svgLoader(),
		Pages({
			dirs: "src/views",
			onRoutesGenerated: (_fileroutes) => {
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
		visualizer({ open: true, gzipSize: true, template: "sunburst" }),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"~": fileURLToPath(new URL("../", import.meta.url)),
		}
	},
	build: {
		chunkSizeWarningLimit: 1250,
		target: "esnext",
		outDir: "../build/frontend",
		emptyOutDir: true,
		rollupOptions: {
			input: "index.html",
		},
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
