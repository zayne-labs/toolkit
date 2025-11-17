import type { StoreApi } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useCallback, useDebugValue, useDeferredValue, useSyncExternalStore } from "react";
import { useCallbackRef } from "./useCallbackRef";

const identity = <TState>(value: TState) => value;

const useStore = <TState, TSlice = TState>(
	store: StoreApi<TState>,
	selector: SelectorFn<TState, TSlice> = identity as never
) => {
	const stableSelector = useCallbackRef(selector);

	const stableGetState = useCallback(() => stableSelector(store.getState()), [stableSelector, store]);

	const stableGetInitialState = useCallback(
		() => stableSelector(store.getInitialState()),
		[stableSelector, store]
	);

	const slice = useSyncExternalStore(store.subscribe, stableGetState, stableGetInitialState);

	useDebugValue(slice);

	// == Using useDeferredValue to make the returned value for uSES play nicely with React's concurrent mode.
	// LINK - https://kurtextrem.de/posts/react-uses-hydration#-concurrent-usesyncexternalstore
	// TODO - Switch concurrent react stores once it's officially released - https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more#concurrent-stores
	const deferredSlice = useDeferredValue(slice);

	return deferredSlice;
};

export { useStore };
