import type { UnmaskType } from "@/type-helpers";

export type StoreStateSetter<TState, TResult = TState> = UnmaskType<(prevState: TState) => TResult>;

type SetState<TState> = UnmaskType<{
	(newState: Partial<TState> | StoreStateSetter<TState, Partial<TState>>, shouldReplace?: false): void;
	// eslint-disable-next-line perfectionist/sort-union-types -- I want TState to be first in the union
	(newState: TState | StoreStateSetter<TState>, shouldReplace: true): void;
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
