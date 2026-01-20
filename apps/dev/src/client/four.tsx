import { handleFileValidation } from "@zayne-labs/toolkit-core";

const onUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
	event.preventDefault();

	if (!event.target.files) return;

	const result = handleFileValidation({
		hooks: {
			onErrorEach: (ctx) => {
				console.error(ctx);
			},
			onSuccessBatch: (ctx) => {
				console.info(ctx);
			},
		},
		newFiles: event.target.files,
		settings: {
			allowedFileTypes: ["image/jpeg", "image/png", "image/jpg"],
			maxFileSize: { mb: 4 },
			validator: (ctx) => {
				if (ctx.file.type !== "image/jpeg") {
					return { code: "invalid-file-type", message: "File type not allowed" };
				}

				return null;
			},
		},
	});

	console.info(result);
};

function AppFour() {
	return (
		<form>
			<div>
				<label htmlFor="file">Upload Image</label>
				<input onChange={onUpload} type="file" name="file" id="file" />
			</div>
		</form>
	);
}

export { AppFour };
