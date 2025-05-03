import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AppThree from "./AppThree";
import AppTwo from "./AppTwo";

createRoot(document.querySelector("#app") as HTMLElement).render(
	<>
		<App />
		<AppTwo />
		<AppThree />
	</>
);
