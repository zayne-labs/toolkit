import { useLocationState } from "@zayne-labs/toolkit-react";

function AppTwo() {
	const [searchString] = useLocationState((state) => state.searchString);

	return (
		<div>
			<button type="button">Click me From App Three</button>
			<p> Search String: {searchString}</p>
			{/* <p> Storage State: {storageState}</p> */}
		</div>
	);
}

export default AppTwo;
