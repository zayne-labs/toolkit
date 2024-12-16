import { type SetStorageState, type StorageOptions, createExternalStorageStore } from "@/core";
import { type SelectorFn, isString } from "@/type-helpers";
import { useConstant } from "./useConstant";
import { useStore } from "./useStore";

type UseStorageStateOptions<TValue, TSlice = TValue> = StorageOptions<TValue> & {
	select?: SelectorFn<TValue, TSlice>;
};

type StorageStoreApi<TValue> = ReturnType<typeof createExternalStorageStore<TValue>>;

type ParamsOne<TValue, TSlice> = [
	key: string,
	initialValue?: TValue,
	options?: Omit<UseStorageStateOptions<TValue, TSlice>, "initialValue" | "key">,
];

type ParamsTwo<TValue, TSlice> = [options: UseStorageStateOptions<TValue, TSlice>];

type UseStorageStateParams<TValue, TSlice> = ParamsOne<TValue, TSlice> | ParamsTwo<TValue, TSlice>;

// TODO: Add createImpl that returns a hook for react later
const useStorageState = <TValue, TSlice = TValue>(...params: UseStorageStateParams<TValue, TSlice>) => {
	const [keyOrOptions, $initialValue, options] = params;

	const _key = isString(keyOrOptions) ? keyOrOptions : keyOrOptions.key;
	const _initialValue = isString(keyOrOptions) ? $initialValue : keyOrOptions.initialValue;

	const {
		initialValue = _initialValue,
		key = _key,
		select = (value: TValue) => value,
		...restOfOptions
	} = isString(keyOrOptions)
		? ((options as UseStorageStateOptions<TValue, TSlice> | undefined) ?? {})
		: keyOrOptions;

	const externalStore = useConstant(() =>
		createExternalStorageStore({ initialValue, key, ...restOfOptions })
	);

	const stateInStorage = useStore(externalStore as never, select as never);

	return [stateInStorage, externalStore.setState, externalStore] as [
		state: TValue,
		setState: SetStorageState<TValue>,
		storeApi: StorageStoreApi<TValue>,
	];
};

export { useStorageState };
