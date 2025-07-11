import { zayne } from "@zayne-labs/eslint-config";

export default zayne(
	{
		ignores: ["packages/**/dist/**"],
		react: true,
		type: "lib",
		typescript: {
			tsconfigPath: ["**/tsconfig.json"],
		},
	},
	{
		files: ["packages/**/*.ts"],
		rules: {
			"ts-eslint/consistent-type-definitions": "off",
		},
	}
);
