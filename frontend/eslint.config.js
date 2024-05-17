import antfu from "@antfu/eslint-config";

export default antfu(
	// antfu cionfig inbuild settings
	{
		ignores: ["dist", "dist/**", "node_modules", "node_modules/**"],
		vue: true,
		formatters: {
			css: true,
			html: true,
		},
		// ts settings, filesTypeAware makes typing is better but slowing down overall tping
		typescript: {
			tsconfigPath: ["tsconfig.json", "tsconfig.app.json", "tsconfig.node.json"],
			filesTypeAware: ["**\/*.{ts,vue}"],
		},
		// stylistic eslint plugin
		stylistic: {
			indent: "tab", // 4, or 'tab'
			quotes: "double",
			semi: true,
			commaDangle: ["error", "never"],
			quoteProps: "consistent-as-needed",
		},

	},
	{
		rules: {
			"antfu/top-level-function": "off",
			"style/comma-dangle": "off",
			"vue/comma-dangle": "off",
			"style/comma-dangle": "off",
			"jsonc/comma-dangle": "off",
			// TODO: Refactor components so this can be turned to error.
			"vue/no-mutating-props": "off",
			"no-console": "warn",
			"ts/no-unsafe-assignment": "off",
			"ts/no-unsafe-argument": "off",
			"ts/no-unsafe-member-access": "off",
			"ts/no-unsafe-call": "off",
			"ts/no-unsafe-return": "off",
			"no-use-before-define": "off",
			// messes with code organization in script setup.
			"ts/no-use-before-define": "off",
			// We need confirm to stop people not having saved changes.
			"no-alert": "off",
			"no-throw-literal": "off",
			"ts/only-throw-error": "off",
			"ts/no-throw-literal": "off",
			"ts/no-misused-promises": "off"
		},
	},
);
