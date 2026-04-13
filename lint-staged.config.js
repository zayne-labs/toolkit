/** @type {import('lint-staged').Configuration} */
export default {
	"*.{ts,tsx,_parallel-1_}": () => "pnpm test",
	"*.{ts,tsx,_parallel-2_}": () => "pnpm lint:type-check",
	"*.{ts,tsx,_parallel-3_}": () => "pnpm lint:eslint:root",
	"package.json": () => ["pnpm lint:publint"],
	"packages/**/*.{js,ts,jsx,tsx}": () => "pnpm lint:size",
};
