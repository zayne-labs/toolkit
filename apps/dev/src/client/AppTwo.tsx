import { useSearchParamsObject } from "@zayne-labs/toolkit-react";

function AppTwo() {
	const [searchParams, setSearchParams] = useSearchParamsObject<{ state: string }>();

	// const [storageState, actions] = useStorageState<number>("state");

	return (
		<div>
			<button
				type="button"
				onClick={() => {
					// actions.setState(Math.random());
					setSearchParams({ state: Math.random().toString() });
				}}
			>
				Click me from App Two
			</button>
			<p> Search Params: {searchParams.state}</p>
			{/* <p> Storage State: {storageState}</p> */}
		</div>
	);
}

export default AppTwo;
