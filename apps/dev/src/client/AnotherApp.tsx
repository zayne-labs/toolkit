import { useResource } from "@zayne-labs/toolkit-react";

function AnotherApp() {
	const resource = useResource({
		fn: () => fetch("https://jsonplaceholder.typicode.com/todos/1").then((res) => res.json()),
	});

	console.info(resource);

	return (
		<>
			<style>
				{`
					.btn {
						background-color: red;
						margin-top: 10px;
					}
				`}
			</style>
			<div>
				<button className="btn" type="button">
					Force Render
				</button>
			</div>
		</>
	);
}
export default AnotherApp;
