import { createStore, type StoreApi, type StoreStateInitializer } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useStore } from "../hooks";
import type { UseBoundStore } from "./types";

type CreateReactStore = {
	<TState>(initializer: StoreStateInitializer<TState>): UseBoundStore<StoreApi<TState>>;
	<TState>(): (initializer: StoreStateInitializer<TState>) => UseBoundStore<StoreApi<TState>>;
};

const createReactStoreImpl = <TState>(createState: StoreStateInitializer<TState>) => {
	const store = createStore(createState);

	const useBoundStore = (selector?: SelectorFn<TState, unknown>) => useStore(store, selector);

	Object.assign(useBoundStore, store);

	return useBoundStore;
};

export const createReactStore = (<TState>(stateInitializer: StoreStateInitializer<TState> | undefined) =>
	stateInitializer ? createReactStoreImpl(stateInitializer) : createReactStoreImpl) as CreateReactStore;
