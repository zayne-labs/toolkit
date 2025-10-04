import { isFunction, isObject } from "@zayne-labs/toolkit-type-helpers";
import type { EqualityFn, Listener, StateInitializer, StoreApi } from "./types";

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

	type InternalStoreApi = StoreApi<TState>;

	const { equalityFn = Object.is } = options;

	const setState: InternalStoreApi["setState"] = (stateUpdate, shouldReplace) => {
		const previousState = currentState;

		const nextState = isFunction(stateUpdate) ? stateUpdate(previousState) : stateUpdate;

		if (equalityFn(nextState, previousState)) return;

		currentState =
			!shouldReplace && isObject(previousState) && isObject(nextState) ?
				{ ...previousState, ...nextState }
			:	(nextState as TState);

		for (const listener of listenerQueue) {
			listener(currentState, previousState);
		}
	};

	let batchQueue = new Set<Parameters<InternalStoreApi["setState"]["batched"]>>([]);

	let isBatchAlreadyScheduled = false;

	setState.batched = (...params) => {
		batchQueue.add(params);

		if (isBatchAlreadyScheduled) return;

		isBatchAlreadyScheduled = true;

		queueMicrotask(() => {
			isBatchAlreadyScheduled = false;

			const batchedStateUpdates = batchQueue;

			batchQueue = new Set([]);

			setState((prevState) => {
				let accumulatedState = prevState;

				for (const [stateUpdate] of batchedStateUpdates) {
					const nextState = isFunction(stateUpdate) ? stateUpdate(accumulatedState) : stateUpdate;

					accumulatedState = { ...accumulatedState, ...nextState };
				}

				return accumulatedState;
			});
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

	const resetBatchQueue = () => {
		isBatchAlreadyScheduled = false;
		batchQueue.clear();
	};

	const resetState = () => {
		resetBatchQueue();

		setState(getInitialState(), true);
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
