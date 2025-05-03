import {
	type LocationStoreOptions,
	type URLSearchParamsInit,
	createSearchParams,
} from "@zayne-labs/toolkit-core";
import { isFunction } from "@zayne-labs/toolkit-type-helpers";
import { useLocationState } from "./useLocationState";

type UseSearchParamsOptions = LocationStoreOptions & {
	action?: "push" | "replace";
};

export const useSearchParams = <TSearchParams extends URLSearchParamsInit>(
	options?: UseSearchParamsOptions
) => {
	const { action = "push", ...restOfOptions } = options ?? {};

	const [searchParams, actions] = useLocationState((state) => state.search, restOfOptions);

	const setSearchParams = (
		newQueryParams: TSearchParams | ((prev: URLSearchParams) => TSearchParams)
	) => {
		const params = isFunction(newQueryParams) ? newQueryParams(searchParams) : newQueryParams;

		const nextSearchParams = createSearchParams(params);

		actions[action]({ search: nextSearchParams });
	};

	setSearchParams.triggerPopstateEvent = actions.triggerPopstateEvent;

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

	setSearchParamsObject.triggerPopstateEvent = setSearchParams.triggerPopstateEvent;

	return [searchParamsObject, setSearchParamsObject] as const;
};
