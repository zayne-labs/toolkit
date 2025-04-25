import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AnotherApp from "./AnotherApp";

createRoot(document.querySelector("#app") as HTMLElement).render(
	<StrictMode>
		<AnotherApp />
	</StrictMode>
);
