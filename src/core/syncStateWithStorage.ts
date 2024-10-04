import { isArray, isObject } from "@/type-helpers";
import { pickKeys } from "./pickKeys";

type SyncStorageParams =
	| [key: string, state: Record<string, unknown>, keysToSelect: string[]]
	| [key: string, state: Record<string, unknown> | unknown[]]
	| [key: string, state: string];

type SyncStateWithStorage = {
	<TKey extends string, TCompositeState extends Record<string, unknown> | unknown[]>(
		...params: [key: TKey, state: TCompositeState]
	): void;

	<TKey extends string, TObject extends Record<string, unknown>, TPickArray extends Array<keyof TObject>>(
		...params: [key: TKey, state: TObject, keysToSelect: TPickArray]
	): void;

	<TKey extends string, TStringState extends string>(...params: [key: TKey, state: TStringState]): void;
};

const syncStateWithStorage: SyncStateWithStorage = (...params: SyncStorageParams): void => {
	const [storageKey, state, keysToOmit] = params;

	switch (true) {
		case isObject(state) && keysToOmit !== undefined: {
			const stateSlice = pickKeys(state, keysToOmit);

			localStorage.setItem(storageKey, JSON.stringify(stateSlice));
			break;
		}

		case isObject(state) || isArray(state): {
			localStorage.setItem(storageKey, JSON.stringify(state));
			break;
		}

		default: {
			localStorage.setItem(storageKey, state);
		}
	}
};

export { syncStateWithStorage };
