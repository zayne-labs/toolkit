import { DropZone } from "@zayne-labs/toolkit/react/ui/drop-zone";
import { createRoot } from "react-dom/client";
import "@zayne-labs/toolkit/tailwind.css";
import { useStorageState } from "@zayne-labs/toolkit/react";

// eslint-disable react-refresh/only-export-components
function App() {
	const [files, setFiles] = useStorageState(
		"foo",
		{ name: "sde", version: "1.0.0" },
		{
			partialize: ({ name }) => ({ name }),
		}
	);

	console.log(files);

	return (
		<>
			<button
				style={{
					padding: "50px",
				}}
				onClick={() => setFiles({ name: "flow", version: "hello" })}
			>
				Click
			</button>

			<DropZone>
				<p>foo</p>
			</DropZone>
		</>
	);
}

createRoot(document.querySelector("#app") as HTMLElement).render(<App />);
