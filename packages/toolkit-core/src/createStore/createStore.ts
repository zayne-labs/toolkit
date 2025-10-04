import { isFunction, isObject } from "@zayne-labs/toolkit-type-helpers";
import type { EqualityFn, Listener, StateInitializer, StoreApi } from "./types";
import { createBatchManager } from "./utils";

type StoreOptions<TState> = {
	equalityFn?: EqualityFn<TState>;
};

const createStore = <TState>(
	initializer: StateInitializer<TState>,
	options: StoreOptions<TState> = {}
): StoreApi<TState> => {
	let currentState: ReturnType<typeof initializer>;

	const listenerQueue = new Set<Listener<TState>>();

	const getState = () => currentState;

	const getInitialState = () => initialState;

	const { equalityFn = Object.is } = options;

	const notifyListeners: Listener<TState> = (state, prevState) => {
		for (const listener of listenerQueue) {
			listener(state, prevState);
		}
	};

	type InternalStoreApi = StoreApi<TState>;

	const batchManager = createBatchManager();

	let previousStateSnapShot: TState;

	const setState: InternalStoreApi["setState"] = (stateUpdate, setStateOptions = {}) => {
		const { shouldNotifyImmediately = false, shouldReplace = false } = setStateOptions;

		const previousState = currentState;

		const nextState = isFunction(stateUpdate) ? stateUpdate(previousState) : stateUpdate;

		if (equalityFn(nextState, previousState)) return;

		currentState =
			!shouldReplace && isObject(previousState) && isObject(nextState) && nextState !== previousState ?
				{ ...previousState, ...nextState }
			:	(nextState as TState);

		if (shouldNotifyImmediately) {
			batchManager.actions.cancelExistingAndEnd();

			notifyListeners(currentState, previousState);

			return;
		}

		if (batchManager.state.isPending) return;

		batchManager.actions.start();

		previousStateSnapShot = previousState;

		queueMicrotask(() => {
			batchManager.actions.end();

			if (batchManager.state.shouldCancelExisting) {
				batchManager.actions.resetCancelExisting();
				return;
			}

			if (equalityFn(currentState, previousStateSnapShot)) return;

			notifyListeners(currentState, previousStateSnapShot);
		});
	};

	const subscribe: InternalStoreApi["subscribe"] = (onStoreChange, subscribeOptions = {}) => {
		const { fireListenerImmediately = false } = subscribeOptions;

		if (fireListenerImmediately) {
			const state = getState();

			onStoreChange(state, state);
		}

		listenerQueue.add(onStoreChange);

		return () => listenerQueue.delete(onStoreChange);
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(getState());

			onStoreChange(slice, slice);
		}

		const unsubscribe = subscribe((state, prevState) => {
			const slice = selector(state);
			const previousSlice = selector(prevState);

			if (sliceEqualityFn(slice as never, previousSlice as never)) return;

			onStoreChange(slice, previousSlice);
		});

		return unsubscribe;
	};

	const resetState = () => {
		batchManager.actions.cancelExistingAndEnd();

		setState(getInitialState(), { shouldReplace: true });
	};

	const api: InternalStoreApi = {
		getInitialState,
		getState,
		resetState,
		setState,
		subscribe,
	};

	const initialState = (currentState = initializer(setState, getState, api));

	return api;
};

export { createStore };
