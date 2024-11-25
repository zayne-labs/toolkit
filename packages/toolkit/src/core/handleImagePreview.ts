import { isFile } from "@/type-helpers";

export type ImagePreviewOptions = {
	file: File | undefined;
	onError?: (ctx: { error: DOMException | null }) => void;
	onSuccess?: (ctx: { result: string }) => void;
	resultType?: "base64" | "objectURL";
};

function handleImagePreview(options: {
	file: File | undefined;
	onError?: never;
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

	if (resultType === "objectURL") {
		const result = URL.createObjectURL(file);

		onSuccess?.({ result });

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

	return reader.result as string;
}

export { handleImagePreview };
