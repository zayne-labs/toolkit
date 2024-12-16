import { type StoreApi, on, parseJSON } from "@/core";
import { isFunction, isObject } from "@/type-helpers";
import type { RemoveStorageState, SetStorageState, StorageOptions } from "./types";
import { setAndDispatchStorageEvent } from "./utils";

const createExternalStorageStore = <TState>(options: StorageOptions<TState> = {} as never) => {
	const {
		equalityFn = Object.is,
		initialValue = null,
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

	const getInitialStorageValue = () => {
		try {
			if (rawStorageValue === null) {
				return initialValue;
			}

			const initialStorageValue = parser(rawStorageValue);

			return initialStorageValue;
		} catch (error) {
			logger(error);
			return initialValue;
		}
	};

	const safeParser = (value: string) => {
		try {
			return parser(value);
		} catch (error) {
			logger(error);
			return null as never;
		}
	};

	const initialState = rawStorageValue ? safeParser(rawStorageValue) : getInitialStorageValue();

	let state: TState = initialState as never;

	const getState = () => state;

	const getInitialState = () => initialState;

	const mergeState = (nextState: Partial<TState> | null, shouldReplace?: boolean) => {
		return !shouldReplace && isObject(state) && isObject(nextState)
			? { ...state, ...nextState }
			: (nextState as TState);
	};

	const setState: SetStorageState<TState> = (newState, shouldReplace) => {
		const previousState = getState();

		const nextState = isFunction(newState) ? newState(previousState) : newState;

		if (nextState === null) {
			removeState();

			return;
		}

		if (equalityFn(nextState, previousState)) return;

		state = mergeState(nextState, shouldReplace);

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

	type Subscribe = StoreApi<TState>["subscribe"];

	const subscribe: Subscribe = (onStoreChange) => {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key !== key || event.storageArea !== selectedStorage) return;

			const currentState = safeParser(event.newValue as string);

			const previousState = safeParser(event.oldValue as string);

			if (syncStateAcrossTabs) {
				state = mergeState(currentState);
				rawStorageValue = event.newValue;
			}

			onStoreChange(currentState, previousState);
		};

		// eslint-disable-next-line unicorn/prefer-global-this
		const removeStorageEvent = on("storage", window, handleStorageChange);

		return removeStorageEvent;
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(getState());

			onStoreChange(slice, slice);
		}

		const handleStoreChange: Parameters<Subscribe>[0] = ($state, prevState) => {
			const previousSlice = selector(prevState);
			const slice = selector($state);

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
