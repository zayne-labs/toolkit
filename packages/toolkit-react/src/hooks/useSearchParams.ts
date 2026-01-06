import {
	createSearchParams,
	type LocationStoreOptions,
	type URLSearchParamsInit,
} from "@zayne-labs/toolkit-core";
import { isFunction } from "@zayne-labs/toolkit-type-helpers";
import { useLocationState } from "./useLocationState";

type UseSearchParamsOptions<TSearchParams extends URLSearchParamsInit> = Omit<
	LocationStoreOptions,
	"defaultValues"
> & {
	action?: "push" | "replace";
	defaultValues?: TSearchParams;
};

export const useSearchParams = <TSearchParams extends URLSearchParamsInit>(
	options?: UseSearchParamsOptions<TSearchParams>
) => {
	const { action = "push", defaultValues, ...restOfOptions } = options ?? {};

	const [searchParams, actions] = useLocationState((state) => state.search, {
		...restOfOptions,
		defaultValues: { search: defaultValues },
	});

	const setSearchParams = (
		newQueryParams: TSearchParams | ((prev: URLSearchParams) => TSearchParams)
	) => {
		const params = isFunction(newQueryParams) ? newQueryParams(searchParams) : newQueryParams;

		const nextSearchParams = createSearchParams(params);

		actions[action]({ search: nextSearchParams });
	};

	return [searchParams, setSearchParams, actions.triggerPopstateEvent] as [
		searchParams: typeof searchParams,
		setSearchParams: typeof setSearchParams,
		triggerPopstateEvent: typeof actions.triggerPopstateEvent,
	];
};

export const useSearchParamsObject = <
	TSearchParams extends Extract<URLSearchParamsInit, Record<string, string | string[]>>,
>(
	options?: UseSearchParamsOptions<TSearchParams>
) => {
	const [searchParams, setSearchParams, triggerPopstateEvent] = useSearchParams(options);

	const searchParamsObject = Object.fromEntries(searchParams) as TSearchParams;

	const setSearchParamsObject = (
		newQueryParams: TSearchParams | ((prev: TSearchParams) => TSearchParams)
	) => {
		const params = isFunction(newQueryParams) ? newQueryParams(searchParamsObject) : newQueryParams;

		setSearchParams(params);
	};

	return [searchParamsObject, setSearchParamsObject, triggerPopstateEvent] as [
		searchParamsObject: typeof searchParamsObject,
		setSearchParamsObject: typeof setSearchParamsObject,
		triggerPopstateEvent: typeof triggerPopstateEvent,
	];
};
