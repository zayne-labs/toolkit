import { isFile } from "@zayne-labs/toolkit-type-helpers";
import type { FileMeta } from "./handleFileValidation";

type PreviewOptionsForObjectURL = {
	onError?: (ctx: { error: TypeError | null }) => void;
	onSuccess?: (ctx: { result: string }) => void;
};

type PreviewOptionsForBase64URL = {
	onError?: (ctx: { error: DOMException | TypeError | null }) => void;
	onSuccess: (ctx: { result: string }) => void;
};

type PreviewTypeUnion = "base64URL" | "objectURL";

export type PreviewOptions<TPreviewType extends PreviewTypeUnion> = {
	base64URL: PreviewOptionsForBase64URL;
	objectURL: PreviewOptionsForObjectURL;
}[TPreviewType];

type GetImagePreviewResult<
	TPreviewType extends PreviewTypeUnion,
	TFile extends File | FileMeta,
> = PreviewTypeUnion extends TPreviewType
	? string
	: TPreviewType extends "objectURL"
		? string
		: TPreviewType extends "base64URL"
			? TFile extends FileMeta
				? string | null
				: null
			: never;

const createImagePreview = <TFile extends File | FileMeta, TPreviewType extends PreviewTypeUnion>(
	options: PreviewOptions<TPreviewType> & { file: TFile; previewType?: TPreviewType }
): GetImagePreviewResult<TPreviewType, TFile> => {
	const { file, onError, onSuccess, previewType = "objectURL" } = options;

	if (!isFile(file)) {
		return file.url as never;
	}

	if (previewType === "objectURL") {
		let result = "";

		try {
			result = URL.createObjectURL(file);

			onSuccess?.({ result });
		} catch (error) {
			onError?.({ error: error as DOMException | TypeError });
		}

		return result as never;
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

	return null as never;
};

export { createImagePreview };
