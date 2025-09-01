import { isFunction, isObject } from "@zayne-labs/toolkit-type-helpers";
import { on } from "../on";
import { parseJSON } from "../parseJSON";
import type { StorageOptions, StorageStoreApi } from "./types";
import { type DispatchOptions, dispatchStorageEvent, getStorage, safeParser } from "./utils";

const createExternalStorageStore = <TState>(
	options: StorageOptions<TState> = {} as never
): StorageStoreApi<TState> => {
	const {
		equalityFn = Object.is,
		initialValue = null as never,
		key,
		logger = console.info,
		parser = parseJSON<TState> as never,
		partialize = (state) => state,
		serializer = JSON.stringify,
		storageArea = "localStorage",
		syncStateAcrossTabs = true,
	} = options;

	const selectedStorage = getStorage(storageArea);

	let rawStorageValue = selectedStorage?.getItem(key);

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

	const internalSafeParser = (value: Parameters<typeof safeParser>[0]) =>
		safeParser(value, parser, logger);

	const initialState = rawStorageValue ? internalSafeParser(rawStorageValue) : getInitialStorageValue();

	let currentStorageState = initialState;

	const getState = () => currentStorageState;

	const getInitialState = () => initialState;

	const mergeCurrentStateWithNextState = (nextState: Partial<TState> | null, shouldReplace?: boolean) => {
		return !shouldReplace && isObject(currentStorageState) && isObject(nextState) ?
				{ ...currentStorageState, ...nextState }
			:	(nextState as TState);
	};

	type InternalStoreApi = StorageStoreApi<TState>;

	const setState: InternalStoreApi["setState"] = (newState, shouldReplace) => {
		const previousState = currentStorageState;

		const nextState = isFunction(newState) ? newState(previousState) : newState;

		if (equalityFn(nextState, previousState)) return;

		const currentState = mergeCurrentStateWithNextState(nextState, shouldReplace);

		const partializedState = partialize(currentState);

		const newValue = serializer(partializedState);

		const oldValue = rawStorageValue;

		selectedStorage?.setItem(key, newValue);

		dispatchStorageEvent({
			key,
			newValue,
			oldValue,
			storageArea: selectedStorage,
		});
	};

	const subscribe: InternalStoreApi["subscribe"] = (onStoreChange) => {
		const handleStorageChange = (event: CustomEvent<Required<DispatchOptions>> | StorageEvent) => {
			const actualEvent = event instanceof CustomEvent ? event.detail : event;

			if (actualEvent.key !== key || actualEvent.storageArea !== selectedStorage) return;

			const previousState = internalSafeParser(actualEvent.oldValue);

			currentStorageState = internalSafeParser(actualEvent.newValue);

			rawStorageValue = actualEvent.newValue;

			onStoreChange(currentStorageState, previousState);
		};

		const storageStoreCleanup = on("storage-store-change" as never, globalThis, handleStorageChange);

		const storageCleanup = syncStateAcrossTabs ? on("storage", globalThis, handleStorageChange) : null;

		return () => {
			storageStoreCleanup();
			storageCleanup?.();
		};
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
		selectedStorage?.removeItem(key);

		dispatchStorageEvent({ key, storageArea: selectedStorage });
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
