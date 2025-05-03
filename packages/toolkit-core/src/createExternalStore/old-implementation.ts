import type { Listener } from "@/createStore";
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

	const safeParser = (value: string | null) => {
		try {
			return parser(value) as TState;
		} catch (error) {
			logger(error);
			return null as never;
		}
	};

	const initialState = rawStorageValue ? safeParser(rawStorageValue) : getInitialStorageValue();

	const listeners = new Set<Listener<TState>>();

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

		const currentState = mergeCurrentStateWithNextState(nextState, shouldReplace);

		const partializedState = partialize(currentState);

		const newValue = serializer(partializedState);

		const oldValue = rawStorageValue;

		selectedStorage.setItem(key, newValue);

		setAndDispatchStorageEvent({
			key,
			newValue,
			oldValue,
			storageArea: selectedStorage,
			syncStateAcrossTabs,
		});

		if (!syncStateAcrossTabs) {
			currentStorageState = currentState;
			rawStorageValue = newValue;
			listeners.forEach((onStoreChange) => onStoreChange(currentState, previousState));
		}
	};

	const internalSubscribe = (
		onStoreChange: Parameters<InternalStoreApi["subscribe"]>[0],
		subscribeOptions: Parameters<InternalStoreApi["subscribe"]>[1] = {}
	) => {
		const { fireListenerImmediately = false } = subscribeOptions;

		if (fireListenerImmediately) {
			const state = getState();

			onStoreChange(state, state);
		}

		listeners.add(onStoreChange);

		return () => listeners.delete(onStoreChange);
	};

	const subscribe: InternalStoreApi["subscribe"] = (onStoreChange) => {
		if (!syncStateAcrossTabs) {
			return internalSubscribe(onStoreChange);
		}

		let unsubscribe: (() => void) | undefined;

		const handleStorageChange = (event: StorageEvent) => {
			if (event.key !== key || event.storageArea !== selectedStorage) return;

			currentStorageState = mergeCurrentStateWithNextState(safeParser(event.newValue));
			rawStorageValue = event.newValue;

			unsubscribe = internalSubscribe(onStoreChange, { fireListenerImmediately: true });
		};

		// eslint-disable-next-line unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window
		const cleanup = on("storage", window, handleStorageChange);

		return () => {
			cleanup();
			unsubscribe?.();
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
		selectedStorage.removeItem(key);

		setAndDispatchStorageEvent({ key, storageArea: selectedStorage, syncStateAcrossTabs });
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
