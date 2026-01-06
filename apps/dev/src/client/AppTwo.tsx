import { useSearchParamsObject, useStorageState } from "@zayne-labs/toolkit-react";

function AppTwo() {
	const [searchParams, setSearchParams] = useSearchParamsObject<{ flow: string; random: string }>();

	const [storageState, actions] = useStorageState(
		"state",
		{ flow: "create", value: 0 }
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
					setSearchParams({ flow: Math.random().toString(), random: Math.random().toString() });
				}}
			>
				Click me from App Two
			</button>
			<p>
				Search Params: {searchParams.random} {searchParams.flow}
			</p>
			<p> Storage State: {JSON.stringify(storageState)}</p>
		</div>
	);
}

export default AppTwo;
