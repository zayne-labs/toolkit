import { isFunction, isObject } from "@zayne-labs/toolkit-type-helpers";
import type { EqualityFn, Listener, StoreApi } from "./types";

export type StateInitializer<TState, TResult = TState> = (
	set: StoreApi<TState>["setState"],
	get: StoreApi<TState>["getState"],
	api: StoreApi<TState>
) => TResult;

type StoreOptions<TState> = {
	equalityFn?: EqualityFn<TState>;
};

const createStore = <TState>(
	initializer: StateInitializer<TState>,
	options: StoreOptions<TState> = {}
) => {
	let state: ReturnType<typeof initializer>;

	const listeners = new Set<Listener<TState>>();

	const getState = () => state;

	const getInitialState = () => initialState;

	type $StoreApi = StoreApi<TState>;

	const { equalityFn = Object.is } = options;

	const setState: $StoreApi["setState"] = (newState, shouldReplace) => {
		const previousState = state;

		const nextState = isFunction(newState) ? newState(previousState) : newState;

		if (equalityFn(nextState, state)) return;

		state =
			!shouldReplace && isObject(state) && isObject(nextState)
				? { ...state, ...nextState }
				: (nextState as TState);

		listeners.forEach((onStoreChange) => onStoreChange(state, previousState));
	};

	const subscribe: $StoreApi["subscribe"] = (onStoreChange, subscribeOptions = {}) => {
		const { fireListenerImmediately = false } = subscribeOptions;

		const currentState = getState();

		if (fireListenerImmediately) {
			onStoreChange(currentState, currentState);
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

		const handleOnStoreChange: Parameters<$StoreApi["subscribe"]>[0] = ($state, prevState) => {
			const previousSlice = selector(prevState);
			const slice = selector($state);

			if (sliceEqualityFn(slice as never, previousSlice as never)) return;

			onStoreChange(slice, previousSlice);
		};

		return subscribe(handleOnStoreChange);
	};

	const api: $StoreApi = { getInitialState, getState, setState, subscribe };

	const initialState = (state = initializer(setState, getState, api));

	return api;
};

export { createStore };
