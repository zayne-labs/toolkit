import { isFile } from "@zayne-labs/toolkit-type-helpers";

export type ImagePreviewOptions = {
	file: File | undefined;
	onError?: (ctx: { error: DOMException | TypeError | null }) => void;
	onSuccess?: (ctx: { result: string }) => void;
	resultType?: "base64" | "objectURL";
};

function handleImagePreview(options: {
	file: File | undefined;
	onError?: (ctx: { error: DOMException | TypeError | null }) => void;
	onSuccess: (ctx: { result: string }) => void;
	resultType: "base64";
}): null;

function handleImagePreview(options: {
	file: File | undefined;
	onError?: (ctx: { error: TypeError | null }) => void;
	onSuccess?: (ctx: { result: string }) => void;
	resultType?: "objectURL";
}): string | null;

function handleImagePreview(options: ImagePreviewOptions) {
	const { file, onError, onSuccess, resultType = "objectURL" } = options;

	if (!isFile(file)) return;

	if (resultType === "objectURL") {
		let result: string | null = null;

		try {
			result = URL.createObjectURL(file);

			onSuccess?.({ result });
		} catch (error) {
			onError?.({ error: error as TypeError });
		}

		return result;
	}

	const reader = new FileReader();

	reader.addEventListener("load", () => {
		if (!reader.result) return;

		onSuccess?.({ result: reader.result as string });
	});

	reader.addEventListener("error", () => {
		onError?.({ error: reader.error });
	});

	reader.readAsDataURL(file);

	return null;
}

export { handleImagePreview };
