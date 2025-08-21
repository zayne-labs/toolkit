import type { StoreApi } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useCallback, useDebugValue, useSyncExternalStore } from "react";

const identity = <TState>(value: TState) => value;

const useStore = <TState, TSlice = TState>(
	store: StoreApi<TState>,
	selector: SelectorFn<TState, TSlice> = identity as never
) => {
	const slice = useSyncExternalStore(
		store.subscribe,
		useCallback(() => selector(store.getState()), [store, selector]),
		useCallback(() => selector(store.getInitialState()), [store, selector])
	);

	useDebugValue(slice);

	return slice;
};

export { useStore };
