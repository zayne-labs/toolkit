import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AppFour from "./AppFour";
import AppThree from "./AppThree";
import AppTwo from "./AppTwo";

export default function Main() {
	const pathname = globalThis.location.pathname;

	switch (pathname) {
		case "/four": {
			return <AppFour />;
		}

		case "/one": {
			return (
				<>
					<App />
					<AppTwo />
					<AppThree />
				</>
			);
		}

		default: {
			return null;
		}
	}
}

createRoot(document.querySelector("#app") as HTMLElement).render(
	<StrictMode>
		<Main />
	</StrictMode>
);
