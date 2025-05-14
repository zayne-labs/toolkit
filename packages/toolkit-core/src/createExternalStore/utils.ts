export type DispatchOptions = StorageEventInit & {
	key: string;
	storageArea: Storage;
};
/* eslint-disable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */

export const dispatchStorageEvent = (dispatchOptions: DispatchOptions) => {
	const { url = window.location.href, ...restOfOptions } = dispatchOptions;

	const storageDetails = { url, ...restOfOptions };

	window.dispatchEvent(new CustomEvent("storage-store-change", { detail: storageDetails }));

	// 	// == This manual event dispatch is necessary to ensure the storage event is triggered on the current window/tab, not just on other windows
	// 	window.dispatchEvent(new StorageEvent("storage", storageDetails));
};

/* eslint-enable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */
