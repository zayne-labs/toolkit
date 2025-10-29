import { createStore, type StoreApi } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import type { StoreMutatorIdentifier } from "zustand";
import { useStore } from "../../hooks";
import type { Mutate, StateCreator, UseBoundStore } from "../types";

type CreateStoreWithSubscribe = {
	<T, Mos extends Array<[StoreMutatorIdentifier, unknown]> = []>(
		initializer: StateCreator<T, [], Mos>
	): Mutate<StoreApi<T>, Mos>;

	<T>(): <Mos extends Array<[StoreMutatorIdentifier, unknown]> = []>(
		initializer: StateCreator<T, [], Mos>
	) => Mutate<StoreApi<T>, Mos>;
};

export const createVanillaStore = (<TState>(stateInitializer: StateCreator<TState> | undefined) =>
	stateInitializer ? createStore(stateInitializer) : createStore) as CreateStoreWithSubscribe;

type CreateWithSubscribe = {
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
	stateInitializer ?
		createReactStoreImpl(stateInitializer)
	:	createReactStoreImpl) as CreateWithSubscribe;
