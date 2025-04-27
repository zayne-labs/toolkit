import type { StoreApi } from "@/createStore";

export type StorageOptions<TState> = {
	equalityFn?: (nextState: Partial<TState>, previousState: Partial<TState>) => boolean;
	initialValue?: TState;
	key: string;
	logger?: (error: unknown) => void;
	parser?: (value: unknown) => TState;
	partialize?: (state: TState) => Partial<TState>;
	serializer?: (object: TState | null) => string;
	storageArea?: "localStorage" | "sessionStorage";
	syncStateAcrossTabs?: boolean;
};

export type StorageStoreApi<TState> = StoreApi<TState> & { removeState: () => void };
