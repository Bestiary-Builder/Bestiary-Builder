import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		env: {
			port: "4000"
		}
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
			"~": path.resolve(__dirname, "../")
		}
	}
});
