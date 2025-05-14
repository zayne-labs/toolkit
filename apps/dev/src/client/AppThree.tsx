import { useLocationState, useStorageState } from "@zayne-labs/toolkit-react";

function AppTwo() {
	const [searchString] = useLocationState((state) => state.searchString);
	const [storageState] = useStorageState(
		"state",
		{ flow: "crate", value: 0 }
		// {
		// 	syncStateAcrossTabs: false,
		// }
	);

	return (
		<div>
			<button type="button">Click me From App Three</button>
			<p> Search String: {searchString}</p>
			<p> Storage State: {JSON.stringify(storageState)}</p>
		</div>
	);
}

export default AppTwo;
