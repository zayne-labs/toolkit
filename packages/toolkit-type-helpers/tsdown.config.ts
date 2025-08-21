import { defineConfig, type Options } from "tsdown";

const isDevMode = process.env.NODE_ENV === "development";

const sharedOptions = {
	clean: true, // clean up dist folder,
	format: ["esm"],
	platform: "browser",
	target: "esnext",
	treeshake: true,
	tsconfig: "tsconfig.json",
} satisfies Options;

const config = defineConfig([
	{
		...sharedOptions,
		dts: { newContext: true },
		entry: ["src/index.ts"],
		name: "ESM",
		outDir: "./dist/esm",
		sourcemap: !isDevMode,
	},

	{
		...sharedOptions,
		clean: true,
		entry: ["src/resets/index.ts"],
		name: "Resets",
		async onSuccess() {
			const { cp: copyDirectory } = await import("node:fs/promises");

			return copyDirectory("src/resets/dts", "dist/resets", { recursive: true });
		},
		outDir: "./dist/resets",
	},
]);

export default config;
