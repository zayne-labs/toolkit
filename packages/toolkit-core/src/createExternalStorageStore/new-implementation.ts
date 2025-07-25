import { isFunction, isObject } from "@zayne-labs/toolkit-type-helpers";
import { createStore } from "@/createStore";
import { on } from "@/on";
import { parseJSON } from "@/parseJSON";
import type { StorageOptions, StorageStoreApi } from "./types";
import { dispatchStorageEvent, getStorage, safeParser } from "./utils";

const createExternalStorageStore = <TState>(
	options: StorageOptions<TState> = {} as never
): StorageStoreApi<TState> => {
	const {
		equalityFn = Object.is,
		initialValue = null as never,
		key,
		logger = console.info,
		parser = parseJSON<TState> as never,
		partialize,
		serializer = JSON.stringify,
		storageArea = "localStorage",
		syncStateAcrossTabs = true,
	} = options;

	const selectedStorage = getStorage(storageArea);

	let rawStorageValue = selectedStorage?.getItem(key);

	const internalSafeParser = (value: Parameters<typeof safeParser>[0]) =>
		safeParser(value, parser, logger);

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

	const initialStoreState =
		rawStorageValue ? internalSafeParser(rawStorageValue) : getInitialStorageValue();

	const internalStoreApi = createStore(() => initialStoreState);

	type InternalStoreApi = StorageStoreApi<TState>;

	const setState: InternalStoreApi["setState"] = (newState, shouldReplace) => {
		const previousState = internalStoreApi.getState();

		const nextState = isFunction(newState) ? newState(previousState) : newState;

		if (equalityFn(nextState, previousState)) return;

		const currentState =
			!shouldReplace && isObject(previousState) && isObject(nextState) ?
				{ ...previousState, ...nextState }
			:	(nextState as TState);

		const possiblyPartializedState = partialize?.(currentState) ?? currentState;

		const newValue = serializer(possiblyPartializedState);

		const oldValue = rawStorageValue;

		selectedStorage?.setItem(key, newValue);

		dispatchStorageEvent({
			key,
			newValue,
			oldValue,
			storageArea: selectedStorage,
		});

		// == If we're not syncing state across tabs, we set the internal store state at this point
		if (!syncStateAcrossTabs) {
			internalStoreApi.setState(currentState);
			rawStorageValue = newValue;
		}
	};

	const subscribe: InternalStoreApi["subscribe"] = (onStoreChange) => {
		// == If we're not syncing state across tabs, we just directly subscribe to the internal store
		if (!syncStateAcrossTabs) {
			return internalStoreApi.subscribe(onStoreChange);
		}

		// == Otherwise, we subscribe to the internal store from within the storage event handler
		let unsubscribe: (() => void) | undefined;

		const handleStorageChange = (event: StorageEvent) => {
			// Return early if event is not for our key/storage
			if (event.key !== key || event.storageArea !== selectedStorage) return;

			internalStoreApi.setState(internalSafeParser(event.newValue));
			rawStorageValue = event.newValue;

			unsubscribe = internalStoreApi.subscribe(onStoreChange, { fireListenerImmediately: true });
		};

		const cleanup = on("storage", globalThis, handleStorageChange);

		return () => {
			cleanup();
			unsubscribe?.();
		};
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(internalStoreApi.getState());

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
		selectedStorage?.removeItem(key);

		dispatchStorageEvent({ key, storageArea: selectedStorage });
	};

	const resetState = internalStoreApi.resetState;
	const getInitialState = internalStoreApi.getInitialState;
	const getState = internalStoreApi.getState;

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
