import { DropZone } from "@zayne-labs/toolkit/react/ui/drop-zone";
import "@zayne-labs/toolkit/tailwind.css";
import { useStorageState } from "@zayne-labs/toolkit/react";
// import { useStorageState } from "./useStorageState";

export default function App() {
	const [state, setState] = useStorageState({
		initialValue: "",
		key: "test",
	});

	return (
		<>
			{/* <button type="button" onClick={() => setState({ health: "new", name: "flow" })}>
				Click me
			</button> */}
			<input value={state} onChange={(e) => setState(e.target.value)} />

			<DropZone>
				<p>foo</p>
			</DropZone>
		</>
	);
}
