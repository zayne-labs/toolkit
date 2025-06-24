import {
	createExternalStorageStore,
	type StorageOptions,
	type StorageStoreApi,
} from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useConstant } from "./useConstant";
import { useStore } from "./useStore";

type UseStorageResult<TState, TSlice = TState> = [state: TSlice, actions: StorageStoreApi<TState>];

/**
 * @description Creates a custom hook that returns a storage state and actions to modify it. You can use this if you need shared options.
 * @note You must use this if you want to be able to prevent syncing state across tabs.
 */
export const createUseStorageState = <TState>(baseOptions: StorageOptions<TState>) => {
	const externalStore = createExternalStorageStore(baseOptions);

	type UseBoundStorageState = StorageStoreApi<TState>
		& (<TSlice = TState>(selector?: SelectorFn<TState, TSlice>) => UseStorageResult<TState, TSlice>);

	const useStorageState = <TSlice = TState>(
		selector?: SelectorFn<TState, TSlice>
	): UseStorageResult<TState, TSlice> => {
		const stateInStorage = useStore(externalStore, selector);

		return [stateInStorage, externalStore];
	};

	Object.assign(useStorageState, externalStore);

	return useStorageState as UseBoundStorageState;
};

type UseStorageStateOptions<TValue> = Omit<StorageOptions<TValue>, "initialValue" | "key">;

export const useStorageState = <TValue, TSlice = TValue>(
	key: string,
	initialValue?: TValue,
	options?: UseStorageStateOptions<TValue> & { select?: SelectorFn<TValue, TSlice> }
): UseStorageResult<TValue, TSlice> => {
	const { select, ...restOfOptions } = options ?? {};

	const externalStore = useConstant(() => {
		return createExternalStorageStore({ initialValue, key, ...restOfOptions });
	});

	const stateInStorage = useStore(externalStore as never, select as never);

	return [stateInStorage as never, externalStore];
};
