import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppFour } from "./four";
import { AppOne } from "./one";
import { AppThree } from "./three";
import { AppTwo } from "./two";

export default function Main() {
	const pathname = globalThis.location.pathname;

	switch (pathname) {
		case "/four": {
			return <AppFour />;
		}

		default: {
			return (
				<>
					<AppOne />
					<AppTwo />
					<AppThree />
				</>
			);
		}
	}
}

createRoot(document.querySelector("#app") as HTMLElement).render(
	<StrictMode>
		<Main />
	</StrictMode>
);
