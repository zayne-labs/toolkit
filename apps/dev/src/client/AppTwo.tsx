import { useSearchParamsObject } from "@zayne-labs/toolkit-react";
import { useState } from "react";

function AppTwo() {
	const [searchParams, setSearchParams] = useSearchParamsObject<{ state: string }>();
	const [state, setState] = useState(false);

	console.log({ searchParams });

	return (
		<div>
			<button
				type="button"
				onClick={() => {
					const newState = !state;
					// setState(newState);
					setSearchParams({ state: "foo" });
				}}
			>
				Click me
			</button>
			<p>{searchParams.state}</p>
		</div>
	);
}

export default AppTwo;
