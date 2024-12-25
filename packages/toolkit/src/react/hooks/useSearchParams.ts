import { type UnmaskType, isArray, isFunction, isPlainObject } from "@/type-helpers";
import { useLocation } from "./useLocation";

type KeyValuePair = [string, string];

export type URLSearchParamsInit =
	| string
	| KeyValuePair[]
	| Record<string, string | string[]>
	| URLSearchParams;

export const createSearchParams = (paramsInit: URLSearchParamsInit = ""): URLSearchParams => {
	if (!isPlainObject(paramsInit, { returnTrueIfNotArray: true })) {
		return new URLSearchParams(paramsInit);
	}

	const arrayOfKeyValuePairs: KeyValuePair[] = [];

	for (const [key, value] of Object.entries(paramsInit)) {
		if (isArray(value)) {
			arrayOfKeyValuePairs.push(...(value.map((v) => [key, v]) as KeyValuePair[]));

			continue;
		}

		arrayOfKeyValuePairs.push([key, value] as KeyValuePair);
	}

	return new URLSearchParams(arrayOfKeyValuePairs);
};

type UseSearchParamsOptions = {
	action?: "push" | "replace";
};

const useSearchParams = <TSearchParams extends URLSearchParamsInit>(options?: UseSearchParamsOptions) => {
	const { action = "push" } = options ?? {};

	const [search, setSearch] = useLocation((state) => state.search);

	const searchParams = new URLSearchParams(search);

	type QueryParams = UnmaskType<TSearchParams | ((prev: URLSearchParams) => TSearchParams)>;

	const setSearchParams = (newQueryParams: QueryParams) => {
		const params = isFunction(newQueryParams) ? newQueryParams(searchParams) : newQueryParams;

		const nextSearchParams = createSearchParams(params);

		setSearch[action](`?${nextSearchParams.toString()}`);
	};

	setSearchParams.triggerPopstate = setSearch.triggerPopstate;

	return [searchParams, setSearchParams] as const;
};

export { useSearchParams };
