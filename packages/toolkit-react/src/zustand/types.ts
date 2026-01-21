import type { StoreApi } from "@zayne-labs/toolkit-core";

export type Get<T, K, F> = K extends keyof T ? T[K] : F;

type ExtractState<TStoreApi> = TStoreApi extends { getState: () => infer TState } ? TState : never;

type ReadonlyStoreApi<TState> = Pick<StoreApi<TState>, "getInitialState" | "getState" | "subscribe">;

export type UseBoundStore<TStoreApi extends ReadonlyStoreApi<unknown>> = TStoreApi & {
	(): ExtractState<TStoreApi>;
	<U>(selector: (state: ExtractState<TStoreApi>) => U): U;
};
