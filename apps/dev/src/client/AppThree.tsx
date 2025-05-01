import { useLocation } from "@zayne-labs/toolkit-react";

function AppTwo() {
	const [locationState] = useLocation((state) => state.search);

	return (
		<div>
			<button type="button">Click me</button>
			{/* <p>{location}</p> */}
		</div>
	);
}

export default AppTwo;
