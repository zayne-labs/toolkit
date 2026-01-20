import type { Prettify, UnmaskType } from "@zayne-labs/toolkit-type-helpers";
import type { ScheduleBatchOptions } from "@/createBatchManager";

export type StoreStateSetter<TState, TResult = TState> = UnmaskType<(prevState: TState) => TResult>;

// eslint-disable-next-line perfectionist/sort-union-types -- I want TState to be first in the union
type FullStateUpdate<TState> = TState | StoreStateSetter<TState, TState>;

type PartialStateUpdate<TState> = Partial<TState> | StoreStateSetter<TState, Partial<TState>>;

type SetStateOptions<TState> = UnmaskType<
	Prettify<Partial<Omit<ScheduleBatchOptions<TState>, "context">> & { shouldNotifySync?: boolean }>
>;

export type SetState<TState> = UnmaskType<{
	(
		stateUpdate: PartialStateUpdate<TState>,
		options?: SetStateOptions<TState> & { shouldReplace?: false }
	): void;
	(
		stateUpdate: FullStateUpdate<TState>,
		options?: SetStateOptions<TState> & { shouldReplace: true }
	): void;
}>;

export type Listener<TState> = UnmaskType<(state: TState, prevState: TState) => void>;

type SelectorFn<TStore, TResult> = UnmaskType<(state: TStore) => TResult>;

export type EqualityFn<TState> = UnmaskType<
	(nextState: Partial<TState>, previousState: TState) => boolean
>;

export type SubscribeOptions<TState> = {
	equalityFn?: EqualityFn<TState>;
	fireListenerImmediately?: boolean;
};

export type CreateStoreOptions<TState> = {
	equalityFn?: EqualityFn<TState>;
	shouldNotifySync?: boolean;
};

type Subscribe<TState> = {
	(
		onStoreChange: Listener<TState>,
		subscribeOptions?: Pick<SubscribeOptions<TState>, "fireListenerImmediately">
	): () => void;
	withSelector: <TSlice = TState>(
		selector: SelectorFn<TState, TSlice>,
		onStoreChange: Listener<TSlice>,
		options?: SubscribeOptions<TSlice>
	) => () => void;
};

export type StoreApi<in out TState> = {
	getInitialState: () => TState;
	getListeners: () => Set<Listener<TState>>;
	getState: () => TState;
	resetState: () => void;
	setState: SetState<TState>;
	subscribe: Subscribe<TState>;
};

export type StateInitializer<TState, TResult = TState> = (
	set: StoreApi<TState>["setState"],
	get: StoreApi<TState>["getState"],
	api: StoreApi<TState>
) => TResult;

export type ExtractState<TStoreApi> = TStoreApi extends { getState: () => infer TState } ? TState : never;
