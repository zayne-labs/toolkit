import { type UnmaskType, isArray, isFunction, isObject } from "@/type-helpers";
import { useLocation } from "./useLocation";

type KeyValuePair = [string, string];

export type URLSearchParamsInit =
	| string
	| KeyValuePair[]
	| Record<string, string | string[]>
	| URLSearchParams;

export const createSearchParams = (paramsInit: URLSearchParamsInit = ""): URLSearchParams => {
	if (!isObject(paramsInit)) {
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

	type QueryParams = UnmaskType<TSearchParams | ((prev: TSearchParams) => TSearchParams)>;

	const setSearchParams = (queryParams: QueryParams) => {
		const nextSearchParams = isFunction(queryParams)
			? queryParams(searchParams as TSearchParams)
			: queryParams;

		const params = createSearchParams(nextSearchParams);

		setSearch[action](`?${params.toString()}`);
	};

	setSearchParams.triggerPopstate = setSearch.triggerPopstate;

	return [searchParams, setSearchParams] as const;
};

export { useSearchParams };
