import { isFunction } from "@/type-helpers";
import type { StoreApi } from "../createStore";
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

	const getState = () => parser(selectedStorage.getItem(key)) ?? getInitialStorageValue();

	const getInitialState = () => defaultValue;

	const currentWindowId = generateWindowIdentity();
	!shouldSyncAcrossTabs && currentWindowId.set();

	const setState: SetState<TState> = (newState, shouldReplace) => {
		const previousState = getState();

		const nextState = isFunction(newState) ? newState(previousState) : newState;

		if (nextState === null) {
			removeState();

			return;
		}

		if (equalityFn(nextState, previousState)) return;

		const newValue = !shouldReplace
			? stringifier({ ...previousState, ...nextState })
			: stringifier(nextState);

		const oldValue = rawStorageValue;

		rawStorageValue = newValue;

		!shouldSyncAcrossTabs && currentWindowId.set();

		setAndDispatchStorageEvent({
			eventFn: () => selectedStorage.setItem(key, newValue),
			key,
			newValue,
			oldValue,
			storageArea: selectedStorage,
		});
	};

	type Subscribe = StoreApi<TState, TSlice>["subscribe"];

	const subscribe: Subscribe = (onStoreChange) => {
		const handleStorageStoreChange = (event: StorageEvent) => {
			// == Early return when `shouldSyncAcrossTabs` is set to `false` and the current window/tab is not the one that triggered the event
			if (!shouldSyncAcrossTabs && window.name !== currentWindowId.get()) return;

			if (event.key !== key || event.storageArea !== selectedStorage) return;

			onStoreChange(parser(event.oldValue as string), parser(event.newValue as string));
		};

		const removeStorageEvent = on("storage", window, handleStorageStoreChange);

		return removeStorageEvent;
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(getState()) as unknown as TState;

			onStoreChange(slice, slice);
		}

		const handleStoreChange: Parameters<Subscribe>[0] = (state, prevState) => {
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
		getInitialState,
		getState,
		removeState,
		setState,
		subscribe,
	};
};

export { createExternalStorageStore };
