type DispatchOptions = StorageEventInit & {
	key: string;
	storageArea: Storage;
	syncStateAcrossTabs: boolean;
};
/* eslint-disable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */

export const setAndDispatchStorageEvent = (dispatchOptions: DispatchOptions) => {
	const { syncStateAcrossTabs, url = window.location.href, ...restOfOptions } = dispatchOptions;

	if (!syncStateAcrossTabs) return;

	// == This manual event dispatch is necessary to ensure the storage event is triggered on the current window/tab, not just on other windows
	window.dispatchEvent(new StorageEvent("storage", { url, ...restOfOptions }));
};

/* eslint-enable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */
