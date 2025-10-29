import type { StoreApi } from "@zayne-labs/toolkit-core";

type Get<T, K, F> = K extends keyof T ? T[K] : F;
type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

export type Mutate<S, Ms> =
	number extends Ms["length" & keyof Ms] ? S
	: Ms extends [] ? S
	: Ms extends [[infer IgnoredMi, infer IgnoredMa], ...infer Mrs] ? Mutate<never, Mrs>
	: never;

export type UseBoundStore<S extends ReadonlyStoreApi<unknown>> = S & {
	(): ExtractState<S>;
	<U>(selector: (state: ExtractState<S>) => U): U;
};

export type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getInitialState" | "getState" | "subscribe">;

// eslint-disable-next-line ts-eslint/no-empty-object-type, ts-eslint/no-unused-vars -- Ignore
export interface StoreMutators<S, A> {}

export type StoreMutatorIdentifier = keyof StoreMutators<unknown, unknown>;

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
