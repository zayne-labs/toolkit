import { createStore } from "@/createStore";
import { on } from "@/on";
import { parseJSON } from "@/parseJSON";
import { isFunction, isObject } from "@zayne-labs/toolkit-type-helpers";
import type { StorageOptions, StorageStoreApi } from "./types";
import { setAndDispatchStorageEvent } from "./utils";

const createExternalStorageStore = <TState>(
	options: StorageOptions<TState> = {} as never
): StorageStoreApi<TState> => {
	const {
		equalityFn = Object.is,
		initialValue = null as never,
		key,
		logger = console.info,
		parser = parseJSON<TState>,
		partialize,
		serializer = JSON.stringify,
		storageArea = "localStorage",
		syncStateAcrossTabs = true,
	} = options;

	const selectedStorage = window[storageArea];

	let rawStorageValue = selectedStorage.getItem(key);

	const safeParser = (value: string) => {
		try {
			return parser(value);
		} catch (error) {
			logger(error);
			return null as never;
		}
	};

	const getInitialStorageValue = () => {
		if (!rawStorageValue) {
			return initialValue;
		}

		try {
			const initialStorageValue = parser(rawStorageValue);

			return initialStorageValue;
		} catch (error) {
			logger(error);
			return initialValue;
		}
	};

	const initialStoreState = rawStorageValue ? safeParser(rawStorageValue) : getInitialStorageValue();

	const store = createStore<TState>(() => initialStoreState);

	type InternalStoreApi = StorageStoreApi<TState>;

	const setState: InternalStoreApi["setState"] = (newState, shouldReplace) => {
		const previousState = store.getState();

		const nextState = isFunction(newState) ? newState(previousState) : newState;

		if (equalityFn(nextState, previousState)) return;

		store.setState(nextState, shouldReplace as never);

		const state =
			!shouldReplace && isObject(previousState) && isObject(nextState)
				? { ...previousState, ...nextState }
				: (nextState as TState);

		const possiblyPartializedState = partialize?.(state) ?? state;

		const newValue = serializer(possiblyPartializedState);

		const oldValue = rawStorageValue;

		rawStorageValue = newValue;

		setAndDispatchStorageEvent({
			eventFn: () => selectedStorage.setItem(key, newValue),
			key,
			newValue,
			oldValue,
			storageArea: selectedStorage,
		});
	};

	const subscribe: InternalStoreApi["subscribe"] = (onStoreChange) => {
		let unsubscribe: (() => void) | undefined;

		const handleStorageChange = (event: StorageEvent) => {
			if (event.key !== key || event.storageArea !== selectedStorage) return;

			if (syncStateAcrossTabs) {
				event.newValue && store.setState(safeParser(event.newValue));
				rawStorageValue = event.newValue;
			}

			unsubscribe = store.subscribe(onStoreChange, { fireListenerImmediately: true });
		};

		// eslint-disable-next-line unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window
		const storageEventCleanup = on("storage", window, handleStorageChange);

		return () => {
			storageEventCleanup();
			unsubscribe?.();
		};
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(store.getState());

			onStoreChange(slice, slice);
		}

		const handleStoreChange: Parameters<InternalStoreApi["subscribe"]>[0] = (state, prevState) => {
			const previousSlice = selector(prevState);
			const slice = selector(state);

			if (sliceEqualityFn(slice as never, previousSlice as never)) return;

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

	const resetState = store.resetState;
	const getInitialState = store.getInitialState;
	const getState = store.getState;

	return {
		getInitialState,
		getState,
		removeState,
		resetState,
		setState,
		subscribe,
	};
};

export { createExternalStorageStore };
