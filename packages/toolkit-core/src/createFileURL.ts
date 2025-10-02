/* eslint-disable unicorn/filename-case -- ignore */
import { isBlob } from "@zayne-labs/toolkit-type-helpers";
import type { FileMeta } from "./fileValidation/types";
import { createPromiseWithResolvers } from "./promise";

type PreviewOptionsForObjectURL = {
	onError?: (ctx: { error: TypeError | null }) => void;
	onSuccess?: (ctx: { result: string }) => void;
};

type PreviewOptionsForBase64URL<TVariant extends "async" | "sync" = "sync"> =
	TVariant extends "sync" ?
		{
			onError?: (ctx: { error: DOMException | TypeError | null }) => void;
			onSuccess: (ctx: { result: string }) => void;
		}
	:	{
			onError?: (ctx: { error: DOMException | TypeError | null }) => void;
			onSuccess?: (ctx: { result: string }) => void;
		};

type PreviewTypeUnion = "base64URL" | "objectURL";

export type PreviewOptions<
	TPreviewType extends PreviewTypeUnion,
	TVariant extends "async" | "sync" = "sync",
> = {
	base64URL: PreviewOptionsForBase64URL<TVariant>;
	objectURL: PreviewOptionsForObjectURL;
}[TPreviewType] & { previewType?: TPreviewType };

type AllowedFileTypes = Blob | File | FileMeta;

type GetFileUrlResult<
	TFile extends AllowedFileTypes,
	TPreviewType extends PreviewTypeUnion,
	TVariant extends "async" | "sync" = "sync",
> =
	AllowedFileTypes extends TFile ? never
	: PreviewTypeUnion extends TPreviewType ? string | undefined
	: TPreviewType extends "objectURL" ? string | undefined
	: TPreviewType extends "base64URL" ?
		TVariant extends "async" ?
			string | undefined
		:	null
	:	never;

const handleCreateBase64URL = async (
	file: Blob,
	options?: PreviewOptionsForBase64URL<"async">
): Promise<string | undefined> => {
	const { promise, reject, resolve } = createPromiseWithResolvers<string | undefined>();

	const reader = new FileReader();

	reader.addEventListener("load", () => {
		if (!reader.result) return;

		resolve(reader.result as string);

		options?.onSuccess?.({ result: reader.result as string });
	});

	reader.addEventListener("error", () => {
		reject(reader.error);

		options?.onError?.({ error: reader.error });
	});

	reader.readAsDataURL(file);

	return promise;
};

const handleCreateObjectURL = (file: Blob, options?: PreviewOptionsForObjectURL) => {
	let result: string | undefined;

	try {
		result = URL.createObjectURL(file);

		options?.onSuccess?.({ result });
	} catch (error) {
		options?.onError?.({ error: error as DOMException | TypeError });
	}

	return result;
};

export const createFileURL = <const TFile extends AllowedFileTypes, TPreviewType extends PreviewTypeUnion>(
	file: TFile,
	options?: PreviewOptions<TPreviewType>
): GetFileUrlResult<TFile, TPreviewType> => {
	const { previewType = "objectURL", ...restOptions } = options ?? {};

	type ResultType = GetFileUrlResult<TFile, TPreviewType>;

	if (!isBlob(file)) {
		return file.url as ResultType;
	}

	switch (previewType) {
		case "base64URL": {
			void handleCreateBase64URL(file, restOptions);

			return null as ResultType;
		}

		case "objectURL": {
			const result = handleCreateObjectURL(file, restOptions);

			return result as ResultType;
		}

		default: {
			previewType satisfies never;

			throw new Error("Invalid preview type");
		}
	}
};

export const createFileURLAsync = async <
	const TFile extends AllowedFileTypes,
	TPreviewType extends PreviewTypeUnion,
>(
	file: TFile,
	options?: PreviewOptions<TPreviewType, "async">
): Promise<GetFileUrlResult<TFile, TPreviewType, "async">> => {
	const { previewType = "objectURL", ...restOptions } = options ?? {};

	type ResultType = GetFileUrlResult<TFile, TPreviewType, "async">;

	if (!isBlob(file)) {
		return file.url as ResultType;
	}

	switch (previewType) {
		case "base64URL": {
			const result = await handleCreateBase64URL(file, restOptions);

			return result as ResultType;
		}

		case "objectURL": {
			const result = handleCreateObjectURL(file, restOptions);

			return result as ResultType;
		}

		default: {
			previewType satisfies never;

			throw new Error("Invalid preview type");
		}
	}
};
