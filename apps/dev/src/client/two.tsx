import { useSearchParamsObject, useStorageState } from "@zayne-labs/toolkit-react";

function AppTwo() {
	const [searchParams, setSearchParams] = useSearchParamsObject<{
		randomOne: string;
		randomTwo: string;
	}>();

	const [storageState, actions] = useStorageState(
		"test-state",
		{ flow: "create", value: 0 }
		// { syncStateAcrossTabs: false }
	);

	const onClick = () => {
		actions.setState({ value: Math.random() });
		setSearchParams({
			randomOne: Math.random().toString(),
			randomTwo: Math.random().toString(),
		});
	};

	return (
		<div>
			<button type="button" onClick={onClick}>
				Click me from App Two
			</button>

			<p>Search Params Object: {JSON.stringify(searchParams)}</p>
			<p> Storage State: {JSON.stringify(storageState)}</p>
		</div>
	);
}

export { AppTwo };
