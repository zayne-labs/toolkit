import type { StorageOptions } from "./types";

export type DispatchOptions = StorageEventInit & {
	key: string;
	storageArea: Storage | undefined;
	storeId: string;
};

export const getStorage = <TValue>(
	storageArea: StorageOptions<TValue>["storageArea"]
): Storage | undefined => {
	const selectedStorage = globalThis[storageArea ?? `localStorage`];

	return selectedStorage;
};

export const dispatchStorageEvent = (dispatchOptions: DispatchOptions) => {
	const { url = globalThis.location.href, ...restOfOptions } = dispatchOptions;

	const storageDetails = { url, ...restOfOptions };

	globalThis.dispatchEvent(new CustomEvent("storage-store-change", { detail: storageDetails }));

	// == Manual StorageEvent dispatch is unnecessary and dangerous for same-tab sync because it lacks storeId tracking.
	// == Same-tab sync is already handled by the CustomEvent above. Native StorageEvent is for other tabs.
	// globalThis.dispatchEvent(new StorageEvent("storage", storageDetails));
};

export const safeParser = <TState>(options: {
	fallbackValue: TState;
	logger: NonNullable<StorageOptions<TState>["logger"]>;
	parser: NonNullable<NoInfer<StorageOptions<TState>["parser"]>>;
	value: string | null | undefined;
}): TState => {
	const { fallbackValue, logger, parser, value } = options;

	try {
		if (value == null) {
			return fallbackValue;
		}

		return parser(value);
	} catch (error) {
		logger(error);
		return fallbackValue;
	}
};
