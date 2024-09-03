// == Using Immediately Indexed Mapped Type instead the direct type so that the full signature would be unveiled to the consumer on hover as opposed to the just the vague type name
type UpdateStateFn<TState, TResult = Partial<TState>> = {
	_: (prevState: TState) => TResult;
}["_"];

type SetState<TState> = {
	_: {
		(newState: Partial<TState> | UpdateStateFn<TState>, shouldReplace?: false): void;
		(newState: TState | UpdateStateFn<TState, TState>, shouldReplace: true): void;
	};
}["_"];

export type Listener<TState> = { _: (state: TState, prevState: TState) => void }["_"];

type SelectorFn<in TStore, out TResult> = { _: (state: TStore) => TResult }["_"];

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
