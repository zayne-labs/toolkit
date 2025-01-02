import { useSearchParamsObject } from "@zayne-labs/toolkit/react";

function App() {
	const [searchParams, setSearchParams] = useSearchParamsObject();

	console.info(searchParams.test);

	return (
		<div>
			<button type="button" onClick={() => setSearchParams({ test: "clay" })}>
				Click me
			</button>
		</div>
	);
}

export default App;
