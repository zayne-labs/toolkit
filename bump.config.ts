import { defineConfig } from "bumpp";
// import { globSync } from "tinyglobby";

export default defineConfig({
	// all: true,
	commit: "chore(bumpp): update package version to v",
	files: ["./packages/**/package.json"],
	// push: false,
	// tag: "@zayne-labs/toolkit@%",
});
