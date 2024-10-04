import zayne from "@zayne-labs/eslint-config";

export default zayne({
	type: "lib",
	ignores: ["dist/**", "eslint.config.js"],
	react: true,
	tailwindcss: true,
	node: {
		overrides: {
			"node/no-unsupported-features/node-builtins": "off",
			"node/no-unsupported-features/es-syntax": "off",
		},
	},
	typescript: {
		tsconfigPath: "tsconfig.eslint.json",
	},
});
