import { createStore, type StoreApi } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useStore } from "../hooks";
import type { Get, Mutate, StoreMutatorIdentifier, UseBoundStore } from "./types";

export type StateCreator<
	T,
	Mis extends Array<[StoreMutatorIdentifier, unknown]> = [],
	Mos extends Array<[StoreMutatorIdentifier, unknown]> = [],
	U = T,
> = { $$storeMutators?: Mos } & ((
	setState: Get<Mutate<StoreApi<T>, Mis>, "setState", never>,
	getState: Get<Mutate<StoreApi<T>, Mis>, "getState", never>,
	store: Mutate<StoreApi<T>, Mis>
) => U);

type CreateReactStore = {
	<T, Mos extends Array<[StoreMutatorIdentifier, unknown]> = []>(
		initializer: StateCreator<T, [], Mos>
	): UseBoundStore<Mutate<StoreApi<T>, Mos>>;
	<T>(): <Mos extends Array<[StoreMutatorIdentifier, unknown]> = []>(
		initializer: StateCreator<T, [], Mos>
	) => UseBoundStore<Mutate<StoreApi<T>, Mos>>;
};

const createReactStoreImpl = <TState>(createState: StateCreator<TState>) => {
	const store = createStore(createState);

	const useBoundStore = (selector?: SelectorFn<TState, unknown>) => useStore(store, selector);

	Object.assign(useBoundStore, store);

	return useBoundStore;
};

export const createReactStore = (<TState>(stateInitializer: StateCreator<TState> | undefined) =>
	stateInitializer ? createReactStoreImpl(stateInitializer) : createReactStoreImpl) as CreateReactStore;
