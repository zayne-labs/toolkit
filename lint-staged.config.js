export default {
	"*.{js,ts,jsx,tsx}": () => "pnpm lint:eslint:root",
	"*.{ts,tsx}": () => ["pnpm test", "pnpm lint:type-check"],
	"package.json": () => "pnpm lint:publint",
	"packages/**/*.{js,ts,jsx,tsx}": () => "pnpm lint:size",
};
