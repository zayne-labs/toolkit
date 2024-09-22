import { isFunction } from "@/type-helpers";
import { createStore } from "../createStore";
import { on } from "../on";
import { parseJSON } from "../parseJSON";
import type { SetState, StorageOptions } from "./types";
import { generateWindowIdentity, setAndDispatchStorageEvent } from "./utils";

const createExternalStorageStore = <TState, TSlice = TState>(
	key: string,
	defaultValue: TState,
	options: StorageOptions<TState> = {}
) => {
	const {
		equalityFn = Object.is,
		logger = console.info,
		parser = parseJSON<TState>,
		shouldSyncAcrossTabs = true,
		storageArea = "localStorage",
		stringifier = JSON.stringify,
	} = options;

	const selectedStorage = window[storageArea];

	let rawStorageValue = selectedStorage.getItem(key);

	const getInitialStorageValue = () => {
		try {
			if (rawStorageValue === null) {
				return defaultValue;
			}

			const initialStorageValue = parser(rawStorageValue);

			return initialStorageValue;
		} catch (error) {
			logger(error);
			return defaultValue;
		}
	};

	const storeApi = createStore<TState, TSlice>(
		() => parser(selectedStorage.getItem(key)) ?? getInitialStorageValue()
	);

	const currentWindowId = !shouldSyncAcrossTabs ? generateWindowIdentity() : null;

	const setState: SetState<TState> = (newState, shouldReplace) => {
		const previousState = storeApi.getState();

		const nextState = isFunction(newState) ? newState(previousState) : newState;

		if (nextState === null) {
			removeState();
			return;
		}

		if (equalityFn(nextState, previousState)) return;

		storeApi.setState(nextState, shouldReplace as false);

		const newValue = stringifier(storeApi.getState());

		const oldValue = rawStorageValue;

		rawStorageValue = newValue;

		setAndDispatchStorageEvent({
			eventFn: () => {
				shouldSyncAcrossTabs && currentWindowId?.set();
				selectedStorage.setItem(key, newValue);
			},
			key,
			newValue,
			oldValue,
			storageArea: selectedStorage,
		});
	};

	const subscribe: (typeof storeApi)["subscribe"] = (onStoreChange) => {
		let unSubFromStoreApi: ReturnType<typeof subscribe>;

		const handleStorageStoreChange = (event: StorageEvent) => {
			// == Early return when `shouldSyncAcrossTabs` is set to `false` and the current window/tab is not the one that triggered the event
			if (!shouldSyncAcrossTabs && currentWindowId?.get() !== window.name) return;

			if (event.key !== key || event.storageArea !== selectedStorage) return;

			unSubFromStoreApi = storeApi.subscribe(onStoreChange);
		};

		const removeStorageEvent = on("storage", window, handleStorageStoreChange);

		return () => {
			unSubFromStoreApi();
			removeStorageEvent();
		};
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(storeApi.getState()) as unknown as TState;

			onStoreChange(slice, slice);
		}

		const handleStoreChange: Parameters<typeof subscribe>[0] = (state, prevState) => {
			const previousSlice = selector(prevState) as unknown as TState;
			const slice = selector(state) as unknown as TState;

			if (sliceEqualityFn(slice, previousSlice)) return;

			onStoreChange(slice, previousSlice);
		};

		return subscribe(handleStoreChange);
	};

	const removeState = () => {
		setAndDispatchStorageEvent({
			eventFn: () => selectedStorage.removeItem(key),
			key,
			storageArea: selectedStorage,
		});
	};

	return {
		getInitialState: storeApi.getInitialState,
		getState: storeApi.getState,
		removeState,
		setState,
		subscribe,
	};
};

export { createExternalStorageStore };
