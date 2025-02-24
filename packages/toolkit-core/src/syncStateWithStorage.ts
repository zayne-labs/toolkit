import { type ExtractUnion, isArray, isPlainObject } from "@zayne-labs/toolkit-type-helpers";
import { pickKeys } from "./pickKeys";

// prettier-ignore
type PossibleSyncStorageParams<
	TKey = string,
	TState = string | Record<string, unknown> | unknown[],
	TPickKeys = string[],
> = [
	[key: TKey, state: TState, keysToSelect: TPickKeys],
	[key: TKey, state: TState]
];

type SyncStateWithStorage = {
	<TKey extends string, TCompositeState extends Record<string, unknown> | unknown[]>(
		...params: PossibleSyncStorageParams<TKey, TCompositeState>[1]
	): void;

	<TKey extends string, TObject extends Record<string, unknown>, TPickArray extends Array<keyof TObject>>(
		...params: PossibleSyncStorageParams<TKey, TObject, TPickArray>[0]
	): void;

	<TKey extends string, TStringState extends string>(
		...params: PossibleSyncStorageParams<TKey, TStringState>[1]
	): void;
};

const syncStateWithStorage: SyncStateWithStorage = (
	...params: ExtractUnion<PossibleSyncStorageParams>
): void => {
	const [storageKey, state, keysToOmit] = params;

	switch (true) {
		case isPlainObject(state) && keysToOmit !== undefined: {
			const stateSlice = pickKeys(state, keysToOmit);

			localStorage.setItem(storageKey, JSON.stringify(stateSlice));
			break;
		}

		case isPlainObject(state) || isArray(state): {
			localStorage.setItem(storageKey, JSON.stringify(state));
			break;
		}

		default: {
			localStorage.setItem(storageKey, state);
		}
	}
};

export { syncStateWithStorage };
