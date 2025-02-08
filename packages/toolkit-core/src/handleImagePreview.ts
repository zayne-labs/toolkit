import { isFile } from "@zayne-labs/toolkit-type-helpers";

export type ImagePreviewOptions = {
	file: File | undefined;
	onError?: (ctx: { error: DOMException | null }) => void;
	onSuccess?: (ctx: { result: string }) => void;
	resultType?: "base64" | "objectURL";
};

function handleImagePreview(options: {
	file: File | undefined;
	onSuccess?: (ctx: { result: string }) => void;
	resultType?: "objectURL";
}): string;

function handleImagePreview(options: {
	file: File | undefined;
	onError?: (ctx: { error: DOMException | null }) => void;
	onSuccess: (ctx: { result: string }) => void;
	resultType: "base64";
}): void;

function handleImagePreview(options: ImagePreviewOptions) {
	const { file, onError, onSuccess, resultType = "objectURL" } = options;

	if (!isFile(file)) return;

	if (resultType === "base64") {
		const reader = new FileReader();

		reader.addEventListener("load", () => {
			if (!reader.result) return;

			onSuccess?.({ result: reader.result as string });
		});

		reader.addEventListener("error", () => {
			onError?.({ error: reader.error });
		});

		reader.readAsDataURL(file);

		return;
	}

	const result = URL.createObjectURL(file);

	onSuccess?.({ result });

	return result;
}

export { handleImagePreview };
