import { isBoolean, isFunction, isObject } from "@zayne-labs/toolkit-type-helpers";
import { createBatchManager } from "../createBatchManager";
import { initializeStorePlugins } from "./plugins";
import type { CreateStoreOptions, Listener, StoreApi, StoreStateInitializer } from "./types";

// TODO - Implement a way to properties to the storeApi, taking inspo from callapi
const createStore = <TState>(
	storeStateInitializer: StoreStateInitializer<TState>,
	storeOptions: CreateStoreOptions<TState> = {}
): StoreApi<TState> => {
	const { equalityFn = Object.is, shouldNotifySync: globalShouldNotifySync = false } = storeOptions;

	let currentState: TState;

	const listeners = new Set<Listener<TState>>();

	const getState = () => currentState;

	const getInitialState = () => initialState;

	const getListeners = () => listeners;

	const notifyListeners: Listener<TState> = (state, prevState) => {
		for (const listener of listeners) {
			listener(state, prevState);
		}
	};

	type InternalStoreApi = StoreApi<TState>;

	const batchManager = createBatchManager<TState>({ initialState: getInitialState });

	const setState: InternalStoreApi["setState"] = (stateUpdate, setStateOptions = {}) => {
		const {
			onNotifySync,
			onNotifyViaBatch,
			shouldNotifySync = globalShouldNotifySync,
			shouldReplace = isBoolean(setStateOptions) ? setStateOptions : false,
		} = setStateOptions;

		const previousState = currentState;

		const nextState = isFunction(stateUpdate) ? stateUpdate(previousState) : stateUpdate;

		if (equalityFn(nextState, previousState)) return;

		currentState =
			!shouldReplace && isObject(previousState) && isObject(nextState) ?
				{ ...previousState, ...nextState }
			:	(nextState as TState);

		batchManager.actions.schedule({
			context: { previousState, shouldNotifySync },
			onNotifySync: (prevState) => {
				onNotifySync?.(prevState);
				notifyListeners(currentState, prevState);
			},
			onNotifyViaBatch: (previousStateSnapshot) => {
				if (equalityFn(currentState, previousStateSnapshot)) return;

				onNotifyViaBatch?.(previousStateSnapshot);
				notifyListeners(currentState, previousStateSnapshot);
			},
		});
	};

	const subscribe: InternalStoreApi["subscribe"] = (onStoreChange, subscribeOptions = {}) => {
		const { fireListenerImmediately = false } = subscribeOptions;

		if (fireListenerImmediately) {
			const state = resolvedApi.getState();

			onStoreChange(state, state);
		}

		listeners.add(onStoreChange);

		return () => listeners.delete(onStoreChange);
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(resolvedApi.getState());

			onStoreChange(slice, slice);
		}

		const unsubscribe = resolvedApi.subscribe(
			(state, prevState) => {
				const previousSlice = selector(prevState);
				const slice = selector(state);

				if (sliceEqualityFn(slice as never, previousSlice as never)) return;

				onStoreChange(slice, previousSlice);
			},
			{ fireListenerImmediately: false }
		);

		return unsubscribe;
	};

	const resetState = () => {
		resolvedApi.setState(resolvedApi.getInitialState(), { shouldNotifySync: true, shouldReplace: true });
	};

	const storeApi: InternalStoreApi = {
		getInitialState,
		getListeners,
		getState,
		resetState,
		setState,
		subscribe,
	};

	const resolvedApi = initializeStorePlugins({ plugins: storeOptions.plugins, storeApi });

	const initialState = (currentState = storeStateInitializer(
		resolvedApi.setState,
		resolvedApi.getState,
		resolvedApi
	));

	return resolvedApi;
};

export { createStore };
