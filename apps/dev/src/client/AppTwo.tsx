import { useSearchParamsObject, useStorageState } from "@zayne-labs/toolkit-react";

function AppTwo() {
	const [searchParams, setSearchParams] = useSearchParamsObject<{ state: string }>();

	const [storageState, actions] = useStorageState(
		"state",
		{ flow: "crate", value: 0 }
		// {
		// 	syncStateAcrossTabs: false,
		// }
	);

	return (
		<div>
			<button
				type="button"
				onClick={() => {
					actions.setState({ value: Math.random() });
					setSearchParams({ state: Math.random().toString() });
				}}
			>
				Click me from App Two
			</button>
			<p> Search Params: {searchParams.state}</p>
			<p> Storage State: {JSON.stringify(storageState)}</p>
		</div>
	);
}

export default AppTwo;
