import { defineConfig } from "bumpp";
// import { globSync } from "tinyglobby";

export default defineConfig({
	all: true,
	commit: "chore: update package version",
	files: ["./packages/**/package.json"],
	// tag: "@zayne-labs/toolkit@v",
});
