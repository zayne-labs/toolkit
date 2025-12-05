import { isBoolean, isFunction, isObject } from "@zayne-labs/toolkit-type-helpers";
import { createBatchManager } from "../createBatchManager";
import type { EqualityFn, Listener, StateInitializer, StoreApi } from "./types";

type StoreOptions<TState> = {
	equalityFn?: EqualityFn<TState>;
	shouldNotifySync?: boolean;
};

const createStore = <TState>(
	initializer: StateInitializer<TState>,
	options: StoreOptions<TState> = {}
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

	const setState: InternalStoreApi["setState"] = (stateUpdate, setStateOptions = {}) => {
		const {
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

		if (shouldNotifySync) {
			batchManager.state.status === "pending" && batchManager.actions.cancel();

			notifyListeners(currentState, previousState);

			return;
		}

		if (batchManager.state.status === "pending") return;

		batchManager.actions.start();

		batchManager.actions.setPreviousStateSnapshot(previousState);

		queueMicrotask(() => {
			batchManager.actions.end();

			if (batchManager.state.isCancelled) {
				batchManager.actions.resetCancel();
				return;
			}

			const { previousStateSnapshot } = batchManager.state;

			if (equalityFn(currentState, previousStateSnapshot)) return;

			notifyListeners(currentState, previousStateSnapshot);
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

		const unsubscribe = subscribe(
			(state, prevState) => {
				const previousSlice = selector(prevState);
				const slice = selector(state);

				if (sliceEqualityFn(slice as never, previousSlice as never)) return;

				onStoreChange(slice, previousSlice);
			},
			{ fireListenerImmediately }
		);

		return unsubscribe;
	};

	const resetState = () => {
		setState(getInitialState(), { shouldNotifySync: true, shouldReplace: true });
	};

	const api: InternalStoreApi = {
		getInitialState,
		getState,
		resetState,
		setState,
		subscribe,
	};

	const initialState = (currentState = initializer(setState, getState, api));

	const batchManager = createBatchManager<TState>({ initialState });

	return api;
};

export { createStore };
