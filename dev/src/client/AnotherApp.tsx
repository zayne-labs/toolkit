import { useStorageState } from "@zayne-labs/toolkit/react";

export default function AnotherApp() {
	const [stateTwo] = useStorageState("test");

	console.info(stateTwo);

	return null;
}
