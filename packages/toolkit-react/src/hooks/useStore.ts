import type { StoreApi } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useDebugValue, useSyncExternalStore } from "react";

const identity = <TState>(value: TState) => value;

const useStore = <TState, TSlice = TState>(
	store: StoreApi<TState>,
	selector: SelectorFn<TState, TSlice> = identity as never
) => {
	const slice = useSyncExternalStore(
		store.subscribe,
		() => selector(store.getState()),
		() => selector(store.getInitialState())
	);

	useDebugValue(slice);

	return slice;
};

export { useStore };
