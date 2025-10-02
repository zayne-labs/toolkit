import type { StoreApi } from "@zayne-labs/toolkit-core";

export type StoreMutatorIdentifier = never;

type Get<T, K, F> = K extends keyof T ? T[K] : F;

export type Mutate<S, Ms> =
	number extends Ms["length" & keyof Ms] ? S
	: Ms extends [] ? S
	: Ms extends [[infer IgnoredMi, infer IgnoredMa], ...infer Mrs] ? Mutate<never, Mrs>
	: never;

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

type ExtractState<S> =
	S extends (
		{
			getState: () => infer T;
		}
	) ?
		T
	:	never;

export type UseBoundStore<S extends ReadonlyStoreApi<unknown>> = S & {
	(): ExtractState<S>;
	<U>(selector: (state: ExtractState<S>) => U): U;
};

export type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getInitialState" | "getState" | "subscribe">;
