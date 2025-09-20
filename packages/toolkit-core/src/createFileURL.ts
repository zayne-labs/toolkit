/* eslint-disable unicorn/filename-case -- ignore */
import { isBlob } from "@zayne-labs/toolkit-type-helpers";
import type { FileMeta } from "./fileValidation/types";

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
}[TPreviewType] & { previewType?: TPreviewType };

type AllowedFileTypes = Blob | File | FileMeta;

type GetFileUrlResult<TPreviewType extends PreviewTypeUnion> =
	TPreviewType extends Extract<AllowedFileTypes, Blob> ?
		PreviewTypeUnion extends TPreviewType ? string | null
		: TPreviewType extends "objectURL" ? string | null
		: TPreviewType extends "base64URL" ? null
		: never
	:	string | null;

const createFileURL = <TFile extends AllowedFileTypes, TPreviewType extends PreviewTypeUnion>(
	file: TFile,
	options?: PreviewOptions<TPreviewType>
): GetFileUrlResult<TPreviewType> => {
	const { onError, onSuccess, previewType = "objectURL" } = options ?? {};

	if (!isBlob(file)) {
		return (file.url ?? null) as never;
	}

	if (previewType === "objectURL") {
		let result: string | null = null;

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

export { createFileURL };
