import { createStore } from "../createStore";
import { on } from "../on";
import type { StorageOptions, StorageSetStateOptions, StorageStoreApi } from "./types";
import { dispatchStorageEvent, getStorage, safeParser, type DispatchOptions } from "./utils";

const createExternalStorageStore = <TState>(
	options: StorageOptions<TState> = {} as never
): StorageStoreApi<TState> => {
	const {
		defaultValue = null as never,
		equalityFn = Object.is,
		key,
		logger = console.error,
		parser = JSON.parse,
		partialize = (state) => state,
		serializer = JSON.stringify,
		shouldNotifySync: globalShouldNotifySync = false,
		storageArea = "localStorage",
		syncStateAcrossTabs = true,
	} = options;

	const storeId = crypto.randomUUID();

	const selectedStorage = getStorage(storageArea);

	const getInitialValue = () => {
		try {
			const rawStorageValue = selectedStorage?.getItem(key);

			return safeParser({
				fallbackValue: defaultValue,
				logger,
				parser,
				value: rawStorageValue,
			});
		} catch (error) {
			logger(error);

			return defaultValue;
		}
	};

	const internalStore = createStore<TState>(() => getInitialValue(), {
		equalityFn,
		shouldNotifySync: globalShouldNotifySync,
	});

	const handleItemStorageAndEventDispatch = (
		state: TState,
		prevState: TState,
		storageAction: StorageSetStateOptions<TState>["storageAction"] = "set-item"
	) => {
		try {
			const newValue = serializer(partialize(state));

			const oldValue = serializer(partialize(prevState));

			switch (storageAction) {
				case "remove-item": {
					selectedStorage?.removeItem(key);
					break;
				}
				case "set-item": {
					selectedStorage?.setItem(key, newValue);
					break;
				}
				default: {
					storageAction satisfies never;
					throw new Error(`Unsupported storage action: ${storageAction}`);
				}
			}

			dispatchStorageEvent({
				key,
				newValue,
				oldValue,
				storageArea: selectedStorage,
				storeId,
			});
		} catch (error) {
			logger(error);
		}
	};

	const setState: StorageStoreApi<TState>["setState"] = (stateUpdate, setStateOptions) => {
		internalStore.setState(stateUpdate, {
			...(setStateOptions as object),
			onNotifySync: (prevState) => {
				handleItemStorageAndEventDispatch(
					internalStore.getState(),
					prevState,
					setStateOptions?.storageAction
				);
			},
			onNotifyViaBatch: (previousStateSnapshot) => {
				handleItemStorageAndEventDispatch(
					internalStore.getState(),
					previousStateSnapshot,
					setStateOptions?.storageAction
				);
			},
		});
	};

	const handleStorageChange = (event: CustomEvent<Required<DispatchOptions>> | StorageEvent) => {
		const resolvedEvent = event instanceof CustomEvent ? event.detail : event;

		const isSameStoreInstance = "storeId" in resolvedEvent && resolvedEvent.storeId === storeId;

		const shouldSkipUpdate =
			resolvedEvent.key !== key || resolvedEvent.storageArea !== selectedStorage || isSameStoreInstance;

		if (shouldSkipUpdate) return;

		const nextState = safeParser({
			fallbackValue: internalStore.getInitialState(),
			logger,
			parser,
			value: resolvedEvent.newValue,
		});

		internalStore.setState(nextState, { shouldNotifySync: true, shouldReplace: true });
	};

	let cleanupExternalListeners: (() => void) | null = null;

	const setupExternalListeners = () => {
		const storageStoreCleanup = on("storage-store-change" as never, globalThis, handleStorageChange);

		const storageCleanup = syncStateAcrossTabs ? on("storage", globalThis, handleStorageChange) : null;

		cleanupExternalListeners = () => {
			storageStoreCleanup();
			storageCleanup?.();
			cleanupExternalListeners = null;
		};
	};

	const hasNoInternalListeners = () => internalStore.getListeners().size === 0;

	const subscribe: StorageStoreApi<TState>["subscribe"] = (onStoreChange, subscribeOptions) => {
		if (hasNoInternalListeners()) {
			setupExternalListeners();
		}

		const unsubscribe = internalStore.subscribe(onStoreChange, subscribeOptions);

		return () => {
			unsubscribe();

			if (hasNoInternalListeners()) {
				cleanupExternalListeners?.();
			}
		};
	};
	subscribe.withSelector = internalStore.subscribe.withSelector;

	const removeState = () => {
		internalStore.setState(defaultValue, {
			onNotifySync: (prevState) => {
				handleItemStorageAndEventDispatch(internalStore.getState(), prevState, "remove-item");
			},
			shouldNotifySync: true,
			shouldReplace: true,
		});
	};

	const resetState = () => {
		setState(internalStore.getInitialState(), { shouldNotifySync: true, shouldReplace: true });
	};

	return {
		getInitialState: internalStore.getInitialState,
		getListeners: internalStore.getListeners,
		getState: internalStore.getState,
		removeState,
		resetState,
		setState,
		subscribe,
	};
};

export { createExternalStorageStore };
