import { createStore, type StoreApi } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useStore } from "../hooks";
import type { Mutate, StateCreator, StoreMutatorIdentifier, UseBoundStore } from "./types";

type CreateStoreWithSubscribe = {
	<T, Mos extends Array<[StoreMutatorIdentifier, unknown]> = []>(
		initializer: StateCreator<T, [], Mos>
	): Mutate<StoreApi<T>, Mos>;

	<T>(): <Mos extends Array<[StoreMutatorIdentifier, unknown]> = []>(
		initializer: StateCreator<T, [], Mos>
	) => Mutate<StoreApi<T>, Mos>;
};

export const createStoreWithSubscribe = (<TState>(stateInitializer: StateCreator<TState> | undefined) =>
	stateInitializer ? createStore(stateInitializer) : createStore) as CreateStoreWithSubscribe;

type CreateWithSubscribe = {
	<T, Mos extends Array<[StoreMutatorIdentifier, unknown]> = []>(
		initializer: StateCreator<T, [], Mos>
	): UseBoundStore<Mutate<StoreApi<T>, Mos>>;
	<T>(): <Mos extends Array<[StoreMutatorIdentifier, unknown]> = []>(
		initializer: StateCreator<T, [], Mos>
	) => UseBoundStore<Mutate<StoreApi<T>, Mos>>;
};

const createWithSubscribeImpl = <TState>(createState: StateCreator<TState>) => {
	const store = createStore(createState);

	const useBoundStore = (selector?: SelectorFn<TState, unknown>) => useStore(store, selector);

	Object.assign(useBoundStore, store);

	return useBoundStore;
};

export const createWithSubscribe = (<TState>(stateInitializer: StateCreator<TState> | undefined) =>
	stateInitializer ?
		createWithSubscribeImpl(stateInitializer)
	:	createWithSubscribeImpl) as CreateWithSubscribe;
