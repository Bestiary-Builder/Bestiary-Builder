import antfu from "@antfu/eslint-config";

export default antfu(
	// antfu cionfig inbuild settings
	{
		ignores: ["dist", "dist/**", "node_modules", "node_modules/**", "staticData/**/*.json"],
		typescript: {
			tsconfigPath: ["tsconfig.json"],
			filesTypeAware: ["**\/*.{ts}"],
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
			"jsonc/comma-dangle": "off",
			"no-console": "warn",
			"ts/no-unsafe-assignment": "off",
			"ts/no-unsafe-argument": "off",
			"ts/no-unsafe-member-access": "off",
			"ts/no-unsafe-call": "off",
			"ts/no-unsafe-return": "off",
			"no-use-before-define": "off",
			"no-throw-literal": "off",
			"ts/only-throw-error": "off",
			"ts/no-throw-literal": "off",
			"ts/no-misused-promises": "off",
			"node/prefer-global/process": "off",
		},
	},
);
