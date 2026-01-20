import { isBoolean, isFunction, isObject } from "@zayne-labs/toolkit-type-helpers";
import { createBatchManager } from "../createBatchManager";
import type { CreateStoreOptions, Listener, StateInitializer, StoreApi } from "./types";

const createStore = <TState>(
	initializer: StateInitializer<TState>,
	options: CreateStoreOptions<TState> = {}
): StoreApi<TState> => {
	let currentState: TState;

	const listeners = new Set<Listener<TState>>();

	const getState = () => currentState;

	const getInitialState = () => initialState;

	const { equalityFn = Object.is, shouldNotifySync: globalShouldNotifySync = false } = options;

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
			const state = getState();

			onStoreChange(state, state);
		}

		listeners.add(onStoreChange);

		return () => listeners.delete(onStoreChange);
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(getState());

			onStoreChange(slice, slice);
		}

		const unsubscribe = subscribe((state, prevState) => {
			const previousSlice = selector(prevState);
			const slice = selector(state);

			if (sliceEqualityFn(slice as never, previousSlice as never)) return;

			onStoreChange(slice, previousSlice);
		});

		return unsubscribe;
	};

	const resetState = () => {
		setState(getInitialState(), { shouldNotifySync: true, shouldReplace: true });
	};

	// Initialize the batch manager reference.
	// It's assigned later because createBatchManager needs the initial state,
	// which is derived from the initializer, which might call setState,
	// which depends on batchManager.
	// We handle this circular dependency by checking if batchManager is defined in setState.

	const api: InternalStoreApi = {
		getInitialState,
		getListeners: () => listeners,
		getState,
		resetState,
		setState,
		subscribe,
	};

	const initialState = (currentState = initializer(setState, getState, api));

	return api;
};

export { createStore };
