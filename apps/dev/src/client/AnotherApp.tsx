import { useScrollObserver } from "@zayne-labs/toolkit-react";

function AnotherApp() {
	const { isScrolled, observedElementRef } = useScrollObserver();

	console.info({ isScrolled });

	return (
		<div>
			<style>
				{`
					@scope {
						button {
							background-color: red;
							margin-top: 10px;
						}

						header {
							position: sticky;
							top: 0;
							height: 100px;
							background-color: blue;
							width: 100%;
							margin-bottom: 10000px;
						}
					}
				`}
			</style>
			<header ref={observedElementRef}>Header</header>
			<div />
			<button className="btn" type="button">
				Force Render
			</button>
		</div>
	);
}
export default AnotherApp;
