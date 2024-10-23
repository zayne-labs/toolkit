import { type StorageOptions, createExternalStorageStore } from "@/core/createExternalStore";
import type { SelectorFn } from "@/type-helpers";
import { useConstant } from "./useConstant";
import { useStore } from "./useStore";

const useStorageState = <TValue, TSlice = TValue>(
	key: string,
	defaultValue: TValue,
	options: StorageOptions<TValue> & { select?: SelectorFn<TValue, TSlice> } = {}
) => {
	const { select = (value: TValue) => value as never, ...restOfOptions } = options;

	const externalStore = useConstant(() => createExternalStorageStore(key, defaultValue, restOfOptions));

	const stateInStorage = useStore(externalStore as never, select);

	return [stateInStorage, externalStore.setState, externalStore.removeState] as const;
};

export { useStorageState };
