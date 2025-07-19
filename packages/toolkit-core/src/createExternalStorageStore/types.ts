import type { StoreApi } from "@/createStore";

export type StorageOptions<TState> = {
	/**
	 * The function to use to compare the previous and next state.
	 * @default Object.is
	 */
	equalityFn?: (nextState: Partial<TState>, previousState: Partial<TState>) => boolean;
	/**
	 * The initial value of the state.
	 */
	initialValue?: TState;
	/**
	 * The key to use for the storage.
	 */
	key: string;
	/**
	 * The function to use to log errors.
	 * @default console.error
	 */
	logger?: (error: unknown) => void;
	/**
	 * The function to use to parse the state.
	 * @default JSON.parse
	 */
	parser?: (value: unknown) => TState;
	/**
	 * The function to use to chose which parts of the state to store.
	 */
	partialize?: (state: TState) => Partial<TState>;
	/**
	 * The function to use to serialize the state.
	 * @default JSON.stringify
	 */
	serializer?: (object: TState | null) => string;
	/**
	 * The storage area to use.
	 * @default "localStorage"
	 */
	storageArea?: "localStorage" | "sessionStorage";
	/**
	 * If true, the state will be synced across tabs.
	 * @default true
	 */
	syncStateAcrossTabs?: boolean;
};

export type StorageStoreApi<TState> = StoreApi<TState> & { removeState: () => void };
