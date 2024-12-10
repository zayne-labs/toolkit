import * as React from "react";
import { type UseDropZoneProps, useDropZone } from "./useDropZone";

function DropZone(props: UseDropZoneProps) {
	const api = useDropZone(props);

	return (
		<div {...api.getRootProps()}>
			<input {...api.getInputProps()} />

			{api.getChildren()}
		</div>
	);
}

export { DropZone };
