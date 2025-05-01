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
		partialize = (state) => state,
		serializer = JSON.stringify,
		storageArea = "localStorage",
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

	let currentStorageState = initialState;

	const getState = () => currentStorageState;

	const getInitialState = () => initialState;

	const mergeCurrentStateWithNextState = (nextState: Partial<TState> | null, shouldReplace?: boolean) => {
		return !shouldReplace && isObject(currentStorageState) && isObject(nextState)
			? { ...currentStorageState, ...nextState }
			: (nextState as TState);
	};

	type InternalStoreApi = StorageStoreApi<TState>;

	const setState: InternalStoreApi["setState"] = (newState, shouldReplace) => {
		const previousState = currentStorageState;

		const nextState = isFunction(newState) ? newState(previousState) : newState;

		if (equalityFn(nextState, previousState)) return;

		currentStorageState = mergeCurrentStateWithNextState(nextState, shouldReplace);

		const partializedState = partialize(currentStorageState);

		const newValue = serializer(partializedState);

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
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key !== key || event.storageArea !== selectedStorage) return;

			const nextState = safeParser(event.newValue as string);

			const previousState = safeParser(event.oldValue as string);

			if (syncStateAcrossTabs) {
				currentStorageState = mergeCurrentStateWithNextState(nextState);
				rawStorageValue = event.newValue;
			}

			onStoreChange(nextState, previousState);
		};

		// eslint-disable-next-line unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window
		const cleanup = on("storage", window, handleStorageChange);

		return cleanup;
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(getState());

			onStoreChange(slice, slice);
		}

		const handleStoreChange: Parameters<InternalStoreApi["subscribe"]>[0] = ($state, prevState) => {
			const previousSlice = selector(prevState);
			const slice = selector($state);

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

	const resetState = () => setState(getInitialState(), true);

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
