import { useLocationState, useStorageState } from "@zayne-labs/toolkit-react";

function AppThree() {
	const [searchString] = useLocationState((state) => state.searchString);

	const [storageState, actions] = useStorageState(
		"test-state",
		{ flow: "create", value: "" }
		// { syncStateAcrossTabs: false }
	);

	const onClick = () => {
		actions.setState({ value: crypto.randomUUID() as never });
	};

	return (
		<div>
			<button type="button" onClick={onClick}>
				Click me From App Three
			</button>

			<p> Search String: {searchString}</p>
			<p> Storage State: {JSON.stringify(storageState)}</p>
		</div>
	);
}

export { AppThree };
