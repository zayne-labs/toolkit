import { type Options, defineConfig } from "tsup";

export default defineConfig((options) => {
	const isDevMode = options.watch;

	const sharedOptions = {
		clean: true, // clean up dist folder,
		dts: true, // generate d.ts
		sourcemap: !isDevMode,
		tsconfig: "tsconfig.json",
	} satisfies Options;

	const sharedESMOptions = {
		format: ["esm"],
		platform: "browser",
		splitting: true,
		target: "esnext",
		treeshake: true,
	} satisfies Options;

	return [
		{
			...sharedOptions,
			...sharedESMOptions,
			entry: ["src/index.ts"],
			name: "ESM",
			outDir: "./dist/esm",
		},

		{
			...sharedOptions,
			...sharedESMOptions,
			entry: ["src/index.ts"],
			name: "ESM-MIN",
			outDir: "./dist/esm/min",
			minify: "terser",
		},

		// Remove if you don't need to support cjs
		{
			...sharedOptions,
			entry: ["src/index.ts"],
			format: ["cjs"],
			name: "CJS",
			outDir: "./dist/cjs",
			platform: "neutral",
		},
	];
});
