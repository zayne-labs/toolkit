import {
	copyToClipboard,
	type AllowedClipboardItems,
	type CopyToClipboardOptions,
} from "@zayne-labs/toolkit-core";
import { useCallback, useRef, useState } from "react";
import { useCallbackRef } from "./useCallbackRef";
import { useToggle } from "./useToggle";

const useCopyToClipboard = (options: CopyToClipboardOptions & { timeout?: number } = {}) => {
	const { mimeType, onCopied, onError, onSuccess, timeout = 1500 } = options;

	const [value, setValue] = useState<AllowedClipboardItems>("");

	const [hasCopied, toggleHasCopied] = useToggle(false);
	const timeoutRef = useRef<number | null>(null);

	const savedOnError = useCallbackRef(onError);
	const savedOnSuccess = useCallbackRef(onSuccess);
	const savedOnCopied = useCallbackRef(onCopied);

	const handleHasCopied = useCallback(() => {
		toggleHasCopied(true);

		timeoutRef.current && clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(() => {
			toggleHasCopied(false);
		}, timeout) as never;
	}, [toggleHasCopied, timeout]);

	const handleCopy = useCallback(
		(valueToCopy: AllowedClipboardItems) => {
			setValue(valueToCopy);

			void copyToClipboard(valueToCopy, {
				mimeType,
				onCopied: () => {
					savedOnCopied?.();
					handleHasCopied();
				},
				onError: savedOnError,
				onSuccess: savedOnSuccess,
			});
		},
		[handleHasCopied, mimeType, savedOnCopied, savedOnError, savedOnSuccess]
	);

	return { handleCopy, hasCopied, setValue, value };
};

export { useCopyToClipboard };
