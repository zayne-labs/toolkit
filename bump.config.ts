import { defineConfig } from "bumpp";
// import { globSync } from "tinyglobby";

export default defineConfig({
	commit: "chore: update package version",
	files: ["./packages/**/package.json"],
	push: false,
	tag: "@zayne-labs/toolkit@v",
});
