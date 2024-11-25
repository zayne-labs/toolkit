import { zayne } from "@zayne-labs/eslint-config";

export default zayne({
	ignores: ["packages/toolkit/dist/**"],
	react: true,
	tailwindcss: {
		settings: {
			config: "packages/toolkit/tailwind.config.js",
		},
	},
	type: "lib",
	typescript: {
		tsconfigPath: ["**/tsconfig.json"],
	},
});
