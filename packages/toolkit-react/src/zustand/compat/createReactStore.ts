import type { StoreApi } from "@zayne-labs/toolkit-core";
import type { Mutate, StoreMutatorIdentifier } from "zustand";
import { createReactStore as createReactStoreOriginal } from "../createReactStore";
import type { Get, UseBoundStore } from "../types";

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

export const createReactStore = createReactStoreOriginal as CreateReactStore;
