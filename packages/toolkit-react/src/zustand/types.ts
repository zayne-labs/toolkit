import type { StoreApi } from "@zayne-labs/toolkit-core";

export type Get<T, K, F> = K extends keyof T ? T[K] : F;
type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

export type Mutate<S, Ms> =
	number extends Ms["length" & keyof Ms] ? S
	: Ms extends [] ? S
	: Ms extends [[infer Mi, infer Ma], ...infer Mrs] ?
		// eslint-disable-next-line ts-eslint/no-redundant-type-constituents -- Ignore
		Mutate<StoreMutators<S, Ma>[Mi & StoreMutatorIdentifier], Mrs>
	:	never;

export type UseBoundStore<S extends ReadonlyStoreApi<unknown>> = S & {
	(): ExtractState<S>;
	<U>(selector: (state: ExtractState<S>) => U): U;
};

export type ReadonlyStoreApi<T> = Pick<StoreApi<T>, "getInitialState" | "getState" | "subscribe">;

// eslint-disable-next-line ts-eslint/no-empty-object-type, ts-eslint/no-unused-vars -- Ignore
export interface StoreMutators<S, A> {}

export type StoreMutatorIdentifier = keyof StoreMutators<unknown, unknown>;
