/* eslint-disable unicorn/prefer-global-this */

type DispatchOptions = StorageEventInit & {
	eventFn: () => void;
	key: string;
	storageArea: Storage;
};

export const setAndDispatchStorageEvent = (dispatchOptions: DispatchOptions) => {
	const { eventFn, url = window.location.href, ...restOfOptions } = dispatchOptions;

	eventFn();

	// == This manual event dispatch is necessary to ensure the storage event is triggered on the current window/tab, not just on other windows
	window.dispatchEvent(new StorageEvent("storage", { url, ...restOfOptions }));
};
