import type { Prettify, UnmaskType } from "@zayne-labs/toolkit-type-helpers";
import type { ScheduleBatchOptions } from "@/createBatchManager";

export type StoreStateSetter<TState, TResult = TState> = UnmaskType<(prevState: TState) => TResult>;

// eslint-disable-next-line perfectionist/sort-union-types -- I want TState to be first in the union
type FullStateUpdate<TState> = TState | StoreStateSetter<TState, TState>;

type PartialStateUpdate<TState> = Partial<TState> | StoreStateSetter<TState, Partial<TState>>;

export type SetStateOptions<TState> = UnmaskType<
	Prettify<Omit<Partial<ScheduleBatchOptions<TState>>, "context"> & { shouldNotifySync?: boolean }>
>;

export type SetState<TState, TSetStateOptions = SetStateOptions<TState>> = UnmaskType<{
	(stateUpdate: PartialStateUpdate<TState>, options?: TSetStateOptions & { shouldReplace?: false }): void;
	(stateUpdate: FullStateUpdate<TState>, options?: TSetStateOptions & { shouldReplace: true }): void;
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

export interface StorePlugin {
	/**
	 *  A unique id for the plugin
	 */
	id: string;

	/**
	 * The name of the plugin.
	 */
	name: string;

	/**
	 * A function called during store initialization to configure the plugin.
	 * It receives the base `StoreApi` and can return an object containing methods to extend the existing API.
	 *
	 * @example
	 * ```ts
	 * setup: (api) => {
	 *   return {
	 *     setState: (stateUpdate, options) => {
	 *       console.log("State is being updated");
	 *       return api.setState(stateUpdate, options);
	 *     }
	 *   };
	 * }
	 * ```
	 */
	// eslint-disable-next-line ts-eslint/no-invalid-void-type -- Ignore
	setup?: (api: StoreApi<never>) => Partial<StoreApi<NoInfer<never>>> | void;
	/**
	 *  A version for the plugin
	 */
	version?: string;
}

export type CreateStoreOptions<TState> = {
	equalityFn?: EqualityFn<TState>;
	plugins?: StorePlugin[];
	shouldNotifySync?: boolean;
};

type UnsubscribeFn = () => void;

export type SubscribeFnMain<TState> = UnmaskType<
	(
		onStoreChange: Listener<TState>,
		subscribeOptions?: Pick<SubscribeOptions<TState>, "fireListenerImmediately">
	) => UnsubscribeFn
>;

type SubscribeFnWithSelector<TState> = UnmaskType<{
	withSelector: <TSlice = TState>(
		selector: SelectorFn<TState, TSlice>,
		onStoreChange: Listener<TSlice>,
		subscribeOptions?: SubscribeOptions<TSlice>
	) => UnsubscribeFn;
}>;

export type SubscribeFn<TState> = SubscribeFnMain<TState> & SubscribeFnWithSelector<TState>;

export type StoreApi<in out TState> = {
	getInitialState: () => TState;
	getListeners: () => Set<Listener<TState>>;
	getState: () => TState;
	resetState: () => void;
	setState: SetState<TState>;
	subscribe: SubscribeFn<TState>;
};

export type StoreStateInitializer<TState, TResult = TState> = (
	set: StoreApi<TState>["setState"],
	get: StoreApi<TState>["getState"],
	api: StoreApi<TState>
) => TResult;

export type StoreActionsInitializer<TState, TActions> = (
	set: StoreApi<TState>["setState"],
	get: StoreApi<TState>["getState"],
	api: StoreApi<TState>
) => TActions;

export type ExtractState<TStoreApi> = TStoreApi extends { getState: () => infer TState } ? TState : never;
