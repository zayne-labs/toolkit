import { isString, type AnyString } from "@zayne-labs/toolkit-type-helpers";

const fallBackCopy = (text: string) => {
	const tempTextArea = document.createElement("textarea");
	tempTextArea.value = text;
	document.body.append(tempTextArea);
	tempTextArea.select();
	// eslint-disable-next-line ts-eslint/no-deprecated -- It's a fallback so the deprecation is fine
	document.execCommand("copy");
	tempTextArea.remove();
};

export type CopyToClipboardOptions = {
	mimeType?: "text/plain" | AnyString;
	onCopied?: () => void;
	onError?: (error: unknown) => void;
	onSuccess?: () => void;
};

export type AllowedClipboardItems = string | Blob;

const copyToClipboard = async (
	valueToCopy: AllowedClipboardItems | Promise<AllowedClipboardItems>,
	options?: CopyToClipboardOptions
) => {
	const { mimeType = "text/plain", onCopied, onError, onSuccess } = options ?? {};

	const clipboardItem = new ClipboardItem({ [mimeType]: valueToCopy });

	try {
		if (!ClipboardItem.supports(mimeType)) {
			throw new Error(`MIME type "${mimeType}" is not supported`);
		}

		await navigator.clipboard.write([clipboardItem]);

		onSuccess?.();
		onCopied?.();
	} catch (error) {
		onError?.(error);
		console.error((error as Error | undefined)?.message ?? "Copy to clipboard failed", error);

		if (isString(valueToCopy)) {
			fallBackCopy(valueToCopy);
			onCopied?.();
		}
	}
};

export { copyToClipboard };
