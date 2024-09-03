import { type Options, defineConfig } from "tsup";

export default defineConfig((options) => {
	const isDevMode = options.watch;

	const sharedOptions = {
		clean: true, // clean up dist folder,
		dts: true, // generate d.ts
		entry: ["src/core/index.ts", "src/react/index.ts", "src/type-helpers/index.ts"],
		format: ["esm"],
		platform: "browser",
		sourcemap: !isDevMode,
		splitting: true,
		target: "esnext",
		treeshake: true,
		tsconfig: "tsconfig.json",
	} satisfies Options;

	return [
		{
			...sharedOptions,
			name: "ESM",
			outDir: "./dist",
		},

		{
			...sharedOptions,
			minify: "terser",
			name: "ESM-MIN",
			outDir: "./dist/min",
		},
	];
});
