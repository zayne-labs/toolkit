import { createStore, on, parseJSON } from "@/core";
import { isFunction, isObject } from "@/type-helpers";
import type { RemoveStorageState, SetStorageState, StorageOptions } from "./types";
import { setAndDispatchStorageEvent } from "./utils";

const createExternalStorageStore = <TState>(options: StorageOptions<TState> = {} as never) => {
	const {
		equalityFn = Object.is,
		initialValue = null as never,
		key,
		logger = console.info,
		parser = parseJSON<TState>,
		partialize = (state) => state,
		storageArea = "localStorage",
		stringifier = JSON.stringify,
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

	const getInitialState = store.getInitialState;

	const getState = store.getState;

	const setState: SetStorageState<TState> = (newState, shouldReplace) => {
		const previousState = store.getState();

		const nextState = isFunction(newState) ? newState(previousState) : newState;

		if (nextState === null) {
			removeState();
			return;
		}

		if (equalityFn(nextState, previousState)) return;

		store.setState(nextState, shouldReplace as never);

		const state =
			!shouldReplace && isObject(previousState) && isObject(nextState)
				? { ...previousState, ...nextState }
				: (nextState as TState);

		const partializedState = partialize(state);

		const newValue = stringifier(partializedState);

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

	const subscribe: (typeof store)["subscribe"] = (onStoreChange) => {
		let unsubscribe: (() => void) | undefined;

		const handleStorageChange = (event: StorageEvent) => {
			if (event.key !== key || event.storageArea !== selectedStorage) return;

			if (syncStateAcrossTabs) {
				event.newValue && store.setState(safeParser(event.newValue));
				rawStorageValue = event.newValue;
			}

			unsubscribe = store.subscribe(onStoreChange, { fireListenerImmediately: true });
		};

		// eslint-disable-next-line unicorn/prefer-global-this
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

		const handleStoreChange: Parameters<typeof subscribe>[0] = (state, prevState) => {
			const previousSlice = selector(prevState);
			const slice = selector(state);

			if (sliceEqualityFn(slice as never, previousSlice as never)) return;

			onStoreChange(slice, previousSlice);
		};

		return subscribe(handleStoreChange);
	};

	const removeState: RemoveStorageState = () => {
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
