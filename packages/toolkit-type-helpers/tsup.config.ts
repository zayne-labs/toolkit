import { type Options, defineConfig } from "tsup";

const isDevMode = process.env.NODE_ENV === "development";

const sharedOptions = {
	clean: true, // clean up dist folder,
	format: ["esm"],
	platform: "browser",
	splitting: true,
	target: "esnext",
	treeshake: true,
	tsconfig: "tsconfig.json",
} satisfies Options;

const config = defineConfig([
	{
		...sharedOptions,
		dts: true,
		entry: ["src/index.ts"],
		name: "ESM",
		outDir: "./dist/esm",
		sourcemap: !isDevMode,
	},

	{
		...sharedOptions,
		clean: true,
		entry: ["src/resets/index.js"],
		name: "Resets",
		async onSuccess() {
			const { cp: copyDirectory } = await import("node:fs/promises");

			return copyDirectory("src/resets", "dist/resets", { recursive: true });
		},
		outDir: "./dist/resets",
	},
]);

export default config;
