import type { CreateStoreOptions, SetState, SetStateOptions, StoreApi } from "../createStore";

export type StorageOptions<TState> = CreateStoreOptions<TState> & {
	/**
	 * The default value of the state.
	 */
	defaultValue?: TState;
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
	parser?: (value: string) => TState;
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

export type StorageSetStateOptions<TState> = SetStateOptions<TState> & {
	storageAction?: "remove-item" | "set-item";
};

export type StorageStoreApi<TState> = Omit<StoreApi<TState>, "setState"> & {
	removeState: () => void;
	setState: SetState<TState, StorageSetStateOptions<TState>>;
};
