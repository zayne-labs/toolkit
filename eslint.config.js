import { zayne } from "@zayne-labs/eslint-config";

export default zayne(
	{
		type: "lib",
		ignores: ["eslint.config.js"],
		react: true,
		typescript: {
			tsconfigPath: ["tsconfig.json", "packages/*/tsconfig.json", "apps/*/tsconfig.json"],
			// tsconfigPath: ["**/tsconfig.json"],
		},
	},
	{
		files: ["packages/**/*.ts"],
		rules: {
			"ts-eslint/consistent-type-definitions": "off",
		},
	}
);
