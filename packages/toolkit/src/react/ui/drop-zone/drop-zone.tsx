import { type UseDropZoneProps, useDropZone } from "./useDropZone";

function DropZone(props: UseDropZoneProps) {
	const api = useDropZone(props);

	return (
		<div {...api.getRootProps()}>
			<input type="file" {...api.getInputProps()} />

			{api.getChildren()}
		</div>
	);
}

export { DropZone };
