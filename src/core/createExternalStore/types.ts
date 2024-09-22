import type { Unravel } from "@/type-helpers";
import type { StateSetter } from "../createStore";

export type StorageOptions<TState> = {
	equalityFn?: (nextState: Partial<TState>, previousState: Partial<TState>) => boolean;
	logger?: (error: unknown) => void;
	parser?: (value: unknown) => TState;
	shouldSyncAcrossTabs?: boolean;
	storageArea?: "localStorage" | "sessionStorage";
	stringifier?: (object: TState | null) => string;
};

export type SetState<TState> = Unravel<{
	(newState: Partial<TState> | StateSetter<TState, Partial<TState> | null>, shouldReplace?: false): void;
	// eslint-disable-next-line perfectionist/sort-union-types
	(newState: TState | StateSetter<TState, TState | null>, shouldReplace: true): void;
}>;
