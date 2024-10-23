import type { UnmaskType } from "@/type-helpers";

export type StateSetter<TState, TResult = TState> = UnmaskType<(prevState: TState) => TResult>;

type SetState<TState> = UnmaskType<{
	(newState: Partial<TState> | StateSetter<TState, Partial<TState>>, shouldReplace?: false): void;
	// eslint-disable-next-line perfectionist/sort-union-types
	(newState: TState | StateSetter<TState>, shouldReplace: true): void;
}>;

export type Listener<TState> = UnmaskType<(state: TState, prevState: TState) => void>;

type SelectorFn<TStore, TResult> = UnmaskType<(state: TStore) => TResult>;

export type SubscribeOptions<TState> = {
	equalityFn?: (nextState: Partial<TState>, previousState: TState) => boolean;
	fireListenerImmediately?: boolean;
};

export type StoreApi<in out TState> = {
	getInitialState: () => TState;
	getState: () => TState;
	setState: SetState<TState>;
	subscribe: {
		(onStoreChange: Listener<TState>): () => void;

		withSelector: <TSlice = TState>(
			selector: SelectorFn<TState, TSlice>,
			onStoreChange: Listener<TSlice>,
			options?: SubscribeOptions<TSlice>
		) => () => void;
	};
};
