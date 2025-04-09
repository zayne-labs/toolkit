import { useSearchParamsObject } from "@zayne-labs/toolkit-react";

function App() {
	const [searchParams, setSearchParams] = useSearchParamsObject();

	console.info({ searchParams });

	return (
		<div>
			<button type="button" onClick={() => setSearchParams({ foo: "bar" })}>
				Click me
			</button>
		</div>
	);
}

export default App;
