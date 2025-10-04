import type { StoreApi } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useCallback, useDebugValue, useSyncExternalStore } from "react";
import { useCallbackRef } from "./useCallbackRef";

const identity = <TState>(value: TState) => value;

const useStore = <TState, TSlice = TState>(
	store: StoreApi<TState>,
	selector: SelectorFn<TState, TSlice> = identity as never
) => {
	const stableSelector = useCallbackRef(selector);

	const getState = useCallback(() => stableSelector(store.getState()), [stableSelector, store]);

	const getInitialState = useCallback(
		() => stableSelector(store.getInitialState()),
		[stableSelector, store]
	);

	const slice = useSyncExternalStore(store.subscribe, getState, getInitialState);

	useDebugValue(slice);

	return slice;
};

export { useStore };
