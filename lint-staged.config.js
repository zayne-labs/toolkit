export default {
	"*.{js,ts,jsx,tsx}": () => "pnpm lint:eslint",
	"*.{ts,tsx}": () => "pnpm lint:check-types",
	"package.json": ["pnpm lint:publint"],
};
