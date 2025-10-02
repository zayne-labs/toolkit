import { createStore, type StoreApi } from "@zayne-labs/toolkit-core";
import type { Mutate, StateCreator, StoreMutatorIdentifier, UseBoundStore } from "./types";

type Create = {
	<T, Mos extends Array<[StoreMutatorIdentifier, unknown]> = []>(
		initializer: StateCreator<T, [], Mos>
	): UseBoundStore<Mutate<StoreApi<T>, Mos>>;
	<T>(): <Mos extends Array<[StoreMutatorIdentifier, unknown]> = []>(
		initializer: StateCreator<T, [], Mos>
	) => UseBoundStore<Mutate<StoreApi<T>, Mos>>;
};

export const createReactZustandStore = (<TState>(stateInitializer: StateCreator<TState> | undefined) =>
	stateInitializer ? createStore(stateInitializer) : createStore) as Create;
