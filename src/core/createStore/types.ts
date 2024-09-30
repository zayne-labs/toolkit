import type { UnmaskType } from "@/type-helpers";

// == Using Immediately Indexed Mapped Type instead the direct type so that the full signature would be unveiled to the consumer on hover as opposed to the just the vague type name
export type StateSetter<TState, TResult = TState> = UnmaskType<(prevState: TState) => TResult>;

type SetState<TState> = UnmaskType<{
	(newState: Partial<TState> | StateSetter<TState, Partial<TState>>, shouldReplace?: false): void;
	// eslint-disable-next-line perfectionist/sort-union-types
	(newState: TState | StateSetter<TState>, shouldReplace: true): void;
}>;

export type Listener<TState> = UnmaskType<(state: TState, prevState: TState) => void>;

type SelectorFn<in TStore, out TResult> = UnmaskType<(state: TStore) => TResult>;

export type SubscribeOptions<TState> = {
	equalityFn?: (nextState: Partial<TState>, previousState: TState) => boolean;
	fireListenerImmediately?: boolean;
};

export type StoreApi<in out TState, TSlice = TState> = {
	getInitialState: () => TState;
	getState: () => TState;
	setState: SetState<TState>;
	subscribe: {
		(onStoreChange: Listener<TState>): () => void;

		withSelector: (
			selector: SelectorFn<TState, TSlice>,
			onStoreChange: Listener<TState>,
			options?: SubscribeOptions<TState>
		) => () => void;
	};
};
