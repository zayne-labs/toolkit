import { useStore } from "@/hooks";
import { type StoreApi, createStore } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import type { Mutate, StoreMutatorIdentifier, UseBoundStore } from "zustand";

type Get<T, K, F> = K extends keyof T ? T[K] : F;

type StateCreator<
	T,
	Mis extends Array<[StoreMutatorIdentifier, unknown]> = [],
	Mos extends Array<[StoreMutatorIdentifier, unknown]> = [],
	U = T,
> = { $$storeMutators?: Mos } & ((
	setState: Get<Mutate<StoreApi<T>, Mis>, "setState", never>,
	getState: Get<Mutate<StoreApi<T>, Mis>, "getState", never>,
	store: Mutate<StoreApi<T>, Mis>
) => U);

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
	stateInitializer
		? createWithSubscribeImpl(stateInitializer)
		: createWithSubscribeImpl) as CreateWithSubscribe;
