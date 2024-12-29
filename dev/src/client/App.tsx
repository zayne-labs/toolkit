import { useSearchParamsObject } from "@zayne-labs/toolkit/react";
import { DropZone } from "@zayne-labs/toolkit/react/ui/drop-zone";
import "@zayne-labs/toolkit/tailwind.css";

export default function App() {
	const [searchParams, setSearchParams] = useSearchParamsObject();

	console.info(searchParams.test);

	return (
		<div>
			<button type="button" onClick={() => setSearchParams({ test: "clay" })}>
				Click me
			</button>
			<DropZone>
				<p>foo</p>
			</DropZone>
		</div>
	);
}
