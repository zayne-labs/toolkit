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

export type FormUrlResult = {
	urlObject: URLInfoObject;
	urlString: string;
};

export const formatUrl = (newURL: string | PartialURLInfo): FormUrlResult => {
	if (isString(newURL)) {
		const url = new URL(newURL, globalThis.location.origin);

		const urlString = url.toString();

		const search = url.searchParams;

		const urlObject = {
			hash: url.hash,
			pathname: url.pathname,
			search,
			searchString: search.toString(),
		} satisfies URLInfoObject;

		return { urlObject, urlString } as never;
	}

	const search = createSearchParams(newURL.search);

	const urlObject = {
		...newURL,
		hash: newURL.hash ?? globalThis.location.hash,
		pathname: newURL.pathname ?? globalThis.location.pathname,
		search,
		searchString: search.toString(),
	} satisfies URLInfoObject;

	const urlConstruct = new URL(urlObject.pathname, globalThis.location.origin);

	urlConstruct.search = urlObject.searchString;
	urlConstruct.hash = urlObject.hash;

	const urlString = urlConstruct.toString();

	return { urlObject, urlString } as never;
};

export const pushState = (url: string | PartialURLInfo, options?: { state?: PartialURLInfo["state"] }) => {
	const { urlObject, urlString } = formatUrl(url);

	const { state = urlObject.state } = options ?? {};

	globalThis.history.pushState(state, "", urlString);
};

export const replaceState = (
	url: string | PartialURLInfo,
	options?: { state?: PartialURLInfo["state"] }
) => {
	const { urlObject, urlString } = formatUrl(url);

	const { state = urlObject.state } = options ?? {};

	globalThis.history.replaceState(state, "", urlString);
};

export const hardNavigate = (url: string | Partial<PartialURLInfo> | URL, type?: "assign" | "replace") => {
	const { urlString } = formatUrl(url);

	globalThis.location[type ?? "assign"](urlString);
};
