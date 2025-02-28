import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AnotherApp from "./AnotherApp";
import App from "./App";

createRoot(document.querySelector("#app") as HTMLElement).render(
	<StrictMode>
		<App />
		<AnotherApp />
	</StrictMode>
);
