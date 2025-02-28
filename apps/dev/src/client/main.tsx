import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import AnotherApp from "./AnotherApp";
import App from "./App";

createRoot(document.querySelector("#app") as HTMLElement).render(
	<StrictMode>
		<App />
		<Suspense fallback={<p>Loading...</p>}>
			<AnotherApp />
		</Suspense>
	</StrictMode>
);
