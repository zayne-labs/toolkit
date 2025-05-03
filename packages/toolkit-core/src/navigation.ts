import { defineEnum, isArray, isIterable, isString } from "@zayne-labs/toolkit-type-helpers";

type KeyValuePair = [string, string];

export type URLSearchParamsInit =
	| string
	| KeyValuePair[]
	| Record<string, string | string[]>
	| URLSearchParams;

export const createSearchParams = (paramsInit: URLSearchParamsInit = ""): URLSearchParams => {
	if (isString(paramsInit) || isIterable(paramsInit)) {
		return new URLSearchParams(paramsInit);
	}

	const keyValuePair: KeyValuePair[] = [];

	for (const [key, value] of Object.entries(paramsInit)) {
		if (isArray(value)) {
			keyValuePair.push(...value.map((v) => defineEnum([key, v])));

			continue;
		}

		keyValuePair.push(defineEnum([key, value]));
	}

	return new URLSearchParams(keyValuePair);
};

export type PartialURLInfo = {
	hash?: string;
	pathname?: string;
	search?: URLSearchParamsInit;
	searchString?: string;
	state?: unknown;
};

export type URLInfoObject = {
	hash: string;
	pathname: string;
	search: URLSearchParams;
	searchString: string;
	state?: unknown;
};

export type FormUrlResult<TUrl extends string | PartialURLInfo | URL> = {
	urlObject: TUrl extends PartialURLInfo ? URLInfoObject : null;

	urlString: string;
};

const questionMark = "?";
const hashMark = "#";

export const formatUrl = <TUrl extends string | PartialURLInfo>(url: TUrl): FormUrlResult<TUrl> => {
	if (isString(url)) {
		return { urlObject: null, urlString: url } as never;
	}

	const search = createSearchParams(url.search);

	const urlObject = {
		...url,
		hash: url.hash ?? "",
		pathname: url.pathname ?? "/",
		search,
		searchString: search.toString(),
	} satisfies URLInfoObject;

	const formattedSearch = urlObject.searchString.startsWith(questionMark)
		? urlObject.searchString
		: `${questionMark}${urlObject.searchString}`;

	const formattedHash = urlObject.hash.startsWith(hashMark)
		? urlObject.hash
		: `${hashMark}${urlObject.hash}`;

	const urlString = `${urlObject.pathname}${formattedSearch}${formattedHash}`;

	return { urlObject, urlString } as never;
};

/* eslint-disable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */

export const pushState = (url: string | PartialURLInfo, options?: { state?: PartialURLInfo["state"] }) => {
	const { urlObject, urlString } = formatUrl(url);

	const { state = urlObject?.state } = options ?? {};

	window.history.pushState(state, "", urlString);
};

export const replaceState = (
	url: string | PartialURLInfo,
	options?: { state?: PartialURLInfo["state"] }
) => {
	const { urlObject, urlString } = formatUrl(url);

	const { state = urlObject?.state } = options ?? {};

	window.history.replaceState(state, "", urlString);
};

export const hardNavigate = (url: string | Partial<PartialURLInfo> | URL, type?: "assign" | "replace") => {
	const { urlString } = formatUrl(url);

	window.location[type ?? "assign"](urlString);
};

/* eslint-enable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */
