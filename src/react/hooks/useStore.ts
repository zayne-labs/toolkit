import type { StoreApi } from "@/core/createStore";
import type { SelectorFn } from "@/type-helpers";
import { useDebugValue, useSyncExternalStore } from "react";

const useStore = <TState, TSlice>(store: StoreApi<TState>, selector: SelectorFn<TState, TSlice>) => {
	const slice = useSyncExternalStore(
		store.subscribe,
		() => selector(store.getState()),
		() => selector(store.getInitialState())
	);

	useDebugValue(slice);

	return slice;
};

export { useStore };
