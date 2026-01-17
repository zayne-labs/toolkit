import { defineConfig, type UserConfig } from "tsdown";

const isDevMode = process.env.NODE_ENV === "development";

const sharedOptions = {
	clean: true, // clean up dist folder,
	dts: true,
	format: ["esm"],
	ignoreWatch: [".turbo"],
	platform: "browser",
	sourcemap: !isDevMode,
	target: "esnext",
	treeshake: true,
	tsconfig: "tsconfig.json",
} satisfies UserConfig;

const config = defineConfig([
	{
		...sharedOptions,
		entry: ["src/index.ts"],
		name: "ESM",
		outDir: "./dist/esm",
	},
]);

export default config;
