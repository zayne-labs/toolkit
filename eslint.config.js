import { zayne } from "@zayne-labs/eslint-config";

export default zayne(
	{
		ignores: ["eslint.config.js"],
		react: true,
		type: "lib",
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
