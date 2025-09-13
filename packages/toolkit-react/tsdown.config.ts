import { defineConfig, type Options } from "tsdown";

const isDevMode = process.env.NODE_ENV === "development";

const sharedOptions = {
	clean: !isDevMode, // clean up dist folder,, // clean up dist folder,
	dts: { newContext: true }, // generate d.ts
	entry: ["src/hooks/index.ts", "src/utils/index.ts", "src/zustand/index.ts"],
	format: ["esm"],
	platform: "browser",
	sourcemap: !isDevMode,
	target: "esnext",
	treeshake: true,
	tsconfig: "tsconfig.json",
} satisfies Options;

const config = defineConfig([
	{
		...sharedOptions,
		name: "ESM",
		outDir: "./dist/esm",
	},
]);

export default config;
