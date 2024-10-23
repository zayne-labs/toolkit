import { zayne } from "@zayne-labs/eslint-config";

export default zayne({
	ignores: ["packages/toolkit/dist/**"],
	node: {
		overrides: {
			"node/no-unsupported-features/es-syntax": "off",
			"node/no-unsupported-features/node-builtins": "off",
		},
	},
	react: true,
	tailwindcss: true,
	type: "lib",
	typescript: {
		tsconfigPath: ["dev/tsconfig.json", "packages/toolkit/tsconfig.json"],
	},
});
