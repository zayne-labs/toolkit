import { useStorageState } from "@zayne-labs/toolkit/react";

function AnotherApp() {
	const [stateTwo] = useStorageState("test");

	console.info(stateTwo);

	return null;
}
export default AnotherApp;
