import type { UnmaskType } from "@zayne-labs/toolkit-type-helpers";

export type StoreStateSetter<TState, TResult = TState> = UnmaskType<(prevState: TState) => TResult>;

// eslint-disable-next-line perfectionist/sort-union-types -- I want TState to be first in the union
type StateUpdate<TState> = TState | StoreStateSetter<TState, TState>;

type PartialStateUpdate<TState> = Partial<TState> | StoreStateSetter<TState, Partial<TState>>;

type SetStateOptions = UnmaskType<{
	shouldNotifyImmediately?: boolean;
}>;

export type SetState<TState> = UnmaskType<{
	(stateUpdate: PartialStateUpdate<TState>, options?: SetStateOptions & { shouldReplace?: false }): void;
	(stateUpdate: StateUpdate<TState>, options?: SetStateOptions & { shouldReplace: true }): void;
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

export type StoreApi<in out TState> = {
	getInitialState: () => TState;
	getState: () => TState;
	resetState: () => void;
	setState: SetState<TState>;
	subscribe: {
		// prettier-ignore
		(onStoreChange: Listener<TState>, subscribeOptions?: Pick< SubscribeOptions<TState>,"fireListenerImmediately">): () => void;

		withSelector: <TSlice = TState>(
			selector: SelectorFn<TState, TSlice>,
			onStoreChange: Listener<TSlice>,
			options?: SubscribeOptions<TSlice>
		) => () => void;
	};
};

export type StateInitializer<TState, TResult = TState> = (
	set: StoreApi<TState>["setState"],
	get: StoreApi<TState>["getState"],
	api: StoreApi<TState>
) => TResult;

export type ExtractState<TStoreApi> = TStoreApi extends { getState: () => infer TState } ? TState : never;
