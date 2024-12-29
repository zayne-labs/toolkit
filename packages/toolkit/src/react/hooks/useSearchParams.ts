import type { LocationStoreOptions } from "@/core";
import { type URLSearchParamsInit, createSearchParams } from "@/core/navigation";
import { isFunction } from "@/type-helpers";
import { useLocation } from "./useLocation";

type UseSearchParamsOptions = {
	action?: "push" | "replace";
	locationOptions?: LocationStoreOptions;
};

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

		if (Object.is(searchParams.toString(), nextSearchParams.toString())) return;

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

	return [searchParamsObject, setSearchParamsObject] as const;
};
