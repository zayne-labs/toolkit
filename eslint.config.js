import { zayne } from "@zayne-labs/eslint-config";

export default zayne({
	ignores: ["packages/toolkit/dist/**"],
	react: true,
	type: "lib",
	typescript: {
		tsconfigPath: ["**/tsconfig.json"],
	},
});
