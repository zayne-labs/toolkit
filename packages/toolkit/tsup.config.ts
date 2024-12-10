import { type Options, defineConfig } from "tsup";

const isDevMode = process.env.NODE_ENV === "development";

const sharedOptions = {
	clean: true, // clean up dist folder,
	dts: true, // generate d.ts
	entry: [
		"src/core/index.ts",
		"src/react/index.ts",
		"src/react/utils/index.ts",
		"src/react/ui/drop-zone/index.ts",
		"src/react/ui/carousel/index.ts",
		"src/react/ui/form/index.ts",
		"src/react/ui/utils/For/index.ts",
		"src/react/ui/utils/Teleport/index.ts",
		"src/react/ui/utils/Show/index.ts",
		"src/react/ui/utils/Switch/index.ts",
		"src/react/ui/utils/Slot/index.ts",
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
	// {
	// 	...sharedOptions,
	// 	name: "ESM",
	// 	outDir: "./dist/esm",
	// },

	// {
	// 	...sharedOptions,
	// 	entry: [],
	// 	esbuildOptions: (options) => {
	// 		// Append "use client" to the top of the react entry point
	// 		// eslint-disable-next-line no-param-reassign
	// 		options.banner = {
	// 			js: '"use client";',
	// 		};
	// 	},
	// 	name: "ESM-UI",
	// 	outDir: "./dist/esm-ui",
	// 	splitting: false,
	// 	treeshake: false,
	// },

	{
		...sharedOptions,
		name: "ESM",
		outDir: "./dist/esm",
	},
]);
