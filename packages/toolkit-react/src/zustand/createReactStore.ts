import {
	createStore,
	type CreateStoreOptions,
	type StoreApi,
	type StorePlugin,
	type StoreStateInitializer,
} from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useStore } from "../hooks";
import type { UseBoundStore } from "./types";

type CreateReactStore = {
	<TState>(
		initializer: StoreStateInitializer<TState>,
		storeOptions?: CreateStoreOptions<TState, Array<StorePlugin<TState>>>
	): UseBoundStore<StoreApi<TState>>;
	<TState>(): <const TPlugins extends Array<StorePlugin<TState>> = Array<StorePlugin<TState>>>(
		initializer: StoreStateInitializer<TState>,
		storeOptions: CreateStoreOptions<TState, TPlugins>
	) => UseBoundStore<ReturnType<typeof createStore<TState, TPlugins>>>;
};

const createReactStoreImpl = (createState: StoreStateInitializer<unknown>) => {
	const store = createStore(createState);

	const useBoundStore = (selector?: SelectorFn<unknown, unknown>) => useStore(store, selector);

	Object.assign(useBoundStore, store);

	return useBoundStore;
};

export const createReactStore = ((stateInitializer: StoreStateInitializer<unknown> | undefined) =>
	stateInitializer ? createReactStoreImpl(stateInitializer) : createReactStoreImpl) as CreateReactStore;
