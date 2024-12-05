import { type Options, defineConfig } from "tsup";

const isDevMode = process.env.NODE_ENV === "development";

const sharedOptions = {
	clean: true, // clean up dist folder,
	dts: true, // generate d.ts
	entry: [
		"src/core/index.ts",
		"src/react/index.ts",
		"src/react/ui/index.ts",
		"src/react/utils/index.ts",
		"src/react/zustand/index.ts",
		"src/type-helpers/index.ts",
	],
	format: ["esm"],
	platform: "browser",
	sourcemap: !isDevMode,
	splitting: true,
	target: "esnext",
	treeshake: true,
	tsconfig: "tsconfig.json",
} satisfies Options;

export default defineConfig([
	{
		...sharedOptions,
		name: "ESM",
		outDir: "./dist/esm",
	},

	{
		...sharedOptions,
		minify: "terser",
		name: "ESM-MIN",
		outDir: "./dist/esm-min",
	},
]);
