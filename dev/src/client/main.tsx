import { DropZone } from "@zayne-labs/toolkit/react/ui/drop-zone";
import { createRoot } from "react-dom/client";

// eslint-disable-next-line import/extensions
import "@zayne-labs/toolkit/tailwind.css";

/* eslint-disable react-refresh/only-export-components */

function App() {
	return (
		<DropZone>
			<p>foo</p>
		</DropZone>
	);
}

createRoot(document.querySelector("#app") as HTMLElement).render(<App />);
