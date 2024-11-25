export default {
	"*.{js,ts,jsx,tsx}": () => "pnpm lint:eslint:dev",
	"*.{ts,tsx}": () => "pnpm lint:check-types",
	"package.json": ["pnpm lint:publint"],
	"packages/**/*.{js,ts,jsx,tsx}": () => "pnpm lint:size",
};
