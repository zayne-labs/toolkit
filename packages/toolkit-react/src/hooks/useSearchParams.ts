import {
	type LocationStoreOptions,
	type URLSearchParamsInit,
	createSearchParams,
} from "@zayne-labs/toolkit-core";
import { isFunction } from "@zayne-labs/toolkit-type-helpers";
import { useLocation } from "./useLocation";

type UseSearchParamsOptions = {
	action?: "push" | "replace";
	locationOptions?: LocationStoreOptions;
};

// FIXME: Add support for createSearchParams state for global state like you did for useStorageState
export const useSearchParams = <TSearchParams extends URLSearchParamsInit>(
	options?: UseSearchParamsOptions
) => {
	const { action = "push", locationOptions } = options ?? {};

	const [searchParams, setLocation] = useLocation((state) => state.search, locationOptions);

	const setSearchParams = (
		newQueryParams: TSearchParams | ((prev: URLSearchParams) => TSearchParams)
	) => {
		const params = isFunction(newQueryParams) ? newQueryParams(searchParams) : newQueryParams;

		const nextSearchParams = createSearchParams(params);

		setLocation[action]({ search: nextSearchParams });
	};

	setSearchParams.triggerPopstate = setLocation.triggerPopstate;

	return [searchParams, setSearchParams] as const;
};

export const useSearchParamsObject = <TSearchParams extends Record<string, string>>(
	options?: UseSearchParamsOptions
) => {
	const [searchParams, setSearchParams] = useSearchParams(options);

	const searchParamsObject = Object.fromEntries(searchParams) as TSearchParams;

	const setSearchParamsObject = (
		newQueryParams: TSearchParams | ((prev: TSearchParams) => TSearchParams)
	) => {
		const params = isFunction(newQueryParams) ? newQueryParams(searchParamsObject) : newQueryParams;

		setSearchParams(params);
	};

	setSearchParamsObject.triggerPopstate = setSearchParams.triggerPopstate;

	return [searchParamsObject, setSearchParamsObject] as const;
};
