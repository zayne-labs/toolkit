import { isFunction } from "@/type-helpers/guard";
import type { PrettyPick } from "@/type-helpers/types";
import type { Listener, StoreApi, SubscribeOptions } from "./types";

export type StateInitializer<TState, TSlice = TState> = (
	get: StoreApi<TState, TSlice>["getState"],
	set: StoreApi<TState, TSlice>["setState"],
	api: StoreApi<TState, TSlice>
) => TState;

type StoreOptions<TState> = PrettyPick<SubscribeOptions<TState>, "equalityFn">;

const createStore = <TState, TSlice = TState>(
	initializer: StateInitializer<TState, TSlice>,
	options: StoreOptions<TState> = {}
) => {
	let state: TState;

	const listeners = new Set<Listener<TState>>();

	const getState = () => state;

	const getInitialState = () => initialState;

	type $StoreApi = StoreApi<TState, TSlice>;

	const { equalityFn = Object.is } = options;

	const setState: $StoreApi["setState"] = (newState, shouldReplace) => {
		const previousState = state;

		const nextState = isFunction(newState) ? newState(previousState) : newState;

		if (equalityFn(nextState, state)) return;

		state = !shouldReplace ? { ...state, ...nextState } : (nextState as TState);

		listeners.forEach((onStoreChange) => onStoreChange(state, previousState));
	};

	const subscribe: $StoreApi["subscribe"] = (onStoreChange) => {
		listeners.add(onStoreChange);

		return () => listeners.delete(onStoreChange);
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(getState()) as unknown as TState;

			onStoreChange(slice, slice);
		}

		const handleOnStoreChange: Parameters<$StoreApi["subscribe"]>[0] = ($state, prevState) => {
			const previousSlice = selector(prevState) as unknown as TState;
			const slice = selector($state) as unknown as TState;

			if (sliceEqualityFn(slice, previousSlice)) return;

			onStoreChange(slice, previousSlice);
		};

		return subscribe(handleOnStoreChange);
	};

	const api: $StoreApi = { getInitialState, getState, setState, subscribe };

	const initialState = (state = initializer(getState, setState, api));

	return api;
};

export { createStore };
