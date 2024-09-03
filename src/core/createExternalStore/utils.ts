export const generateWindowIdentity = () => {
	window.name = crypto.randomUUID();
	localStorage.setItem("currentTab", window.name);

	const currentTabId = {
		get: () => localStorage.getItem("currentTab"),
		set: () => {
			if (currentTabId.get() === window.name) return;

			localStorage.setItem("currentTab", window.name);
		},
	};

	return currentTabId;
};

type DispatchOptions = {
	eventFn: () => void;
	key: string;
	storageArea: Storage;
} & StorageEventInit;

export const setAndDispatchStorageEvent = (dispatchOptions: DispatchOptions) => {
	const { eventFn, url = window.location.href, ...restOfOptions } = dispatchOptions;

	eventFn();

	// == This manual event dispatch is necessary to ensure the storage event is triggered on the current window/tab, not just on other windows
	window.dispatchEvent(new StorageEvent("storage", { url, ...restOfOptions }));
};
