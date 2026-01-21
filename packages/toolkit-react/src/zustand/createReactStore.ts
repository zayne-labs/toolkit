import { createStore, type StateInitializer, type StoreApi } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useStore } from "../hooks";
import type { UseBoundStore } from "./types";

type CreateReactStore = {
	<TState>(initializer: StateInitializer<TState>): UseBoundStore<StoreApi<TState>>;
	<TState>(): (initializer: StateInitializer<TState>) => UseBoundStore<StoreApi<TState>>;
};

const createReactStoreImpl = <TState>(createState: StateInitializer<TState>) => {
	const store = createStore(createState);

	const useBoundStore = (selector?: SelectorFn<TState, unknown>) => useStore(store, selector);

	Object.assign(useBoundStore, store);

	return useBoundStore;
};

export const createReactStore = (<TState>(stateInitializer: StateInitializer<TState> | undefined) =>
	stateInitializer ? createReactStoreImpl(stateInitializer) : createReactStoreImpl) as CreateReactStore;
