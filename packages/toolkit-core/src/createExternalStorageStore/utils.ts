import { isJsonString } from "@zayne-labs/toolkit-type-helpers";
import type { StorageOptions } from "./types";

export type DispatchOptions = StorageEventInit & {
	key: string;
	storageArea: Storage;
};
export const dispatchStorageEvent = (dispatchOptions: DispatchOptions) => {
	const { url = globalThis.location.href, ...restOfOptions } = dispatchOptions;

	const storageDetails = { url, ...restOfOptions };

	globalThis.dispatchEvent(new CustomEvent("storage-store-change", { detail: storageDetails }));

	// 	// == This manual event dispatch is necessary to ensure the storage event is triggered on the current window/tab, not just on other windows
	// 	globalThis.dispatchEvent(new StorageEvent("storage", storageDetails));
};

export const safeParser = <TState>(
	value: string | null,
	parser: StorageOptions<TState>["parser"],
	logger: StorageOptions<TState>["logger"]
): TState => {
	try {
		if (isJsonString(value)) {
			return parser?.(value) as TState;
		}

		return value as TState;
	} catch (error) {
		logger?.(error);
		return null as never;
	}
};
