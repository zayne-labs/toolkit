import type { StoreStateSetter } from "@/createStore";
import type { UnmaskType } from "@zayne-labs/toolkit-type-helpers";

export type StorageOptions<TState> = {
	equalityFn?: (nextState: Partial<TState>, previousState: Partial<TState>) => boolean;
	initialValue?: TState;
	key: string;
	logger?: (error: unknown) => void;
	parser?: (value: unknown) => TState;
	partialize?: (state: TState) => Partial<TState>;
	storageArea?: "localStorage" | "sessionStorage";
	stringifier?: (object: TState | null) => string;
	syncStateAcrossTabs?: boolean;
};

export type SetStorageState<TState> = UnmaskType<{
	(
		newState: Partial<TState> | StoreStateSetter<TState, Partial<TState> | null>,
		shouldReplace?: false
	): void;
	// eslint-disable-next-line perfectionist/sort-union-types -- I want TState to be first in the union
	(newState: TState | StoreStateSetter<TState, TState | null>, shouldReplace: true): void;
}>;

export type RemoveStorageState = () => void;
