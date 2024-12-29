import { defineEnum, isArray, isIterable, isString } from "@/type-helpers";

type KeyValuePair = [string, string];

export type URLSearchParamsInit =
	| string
	| KeyValuePair[]
	| Record<string, string | string[]>
	| URLSearchParams;

export type UrlInfo = {
	hash: string;
	pathname: string;
	search: string | URLSearchParamsInit;
	state: NonNullable<unknown> | null;
};

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

const questionMark = "?";
const hashMark = "#";

const formatUrl = (url: string | Partial<UrlInfo>) => {
	if (isString(url)) {
		return { urlObject: null, urlString: url };
	}

	const urlObject = {
		...url,
		hash: url.hash ?? "",
		pathname: url.pathname ?? "",
		search: createSearchParams(url.search).toString() || "",
	};

	const formattedSearch = urlObject.search.startsWith(questionMark)
		? urlObject.search
		: `${questionMark}${urlObject.search}`;

	const formattedHash = urlObject.hash.startsWith(hashMark)
		? urlObject.hash
		: `${hashMark}${urlObject.hash}`;

	const urlString = `${urlObject.pathname}${formattedSearch}${formattedHash}`;

	return { urlObject, urlString };
};

/* eslint-disable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */

export const pushState = (url: string | Partial<UrlInfo>, state?: UrlInfo["state"]) => {
	const { urlObject, urlString } = formatUrl(url);

	window.history.pushState(urlObject?.state ?? state, "", urlString);
};

export const replaceState = (url: string | Partial<UrlInfo>, state?: UrlInfo["state"]) => {
	const { urlObject, urlString } = formatUrl(url);

	window.history.replaceState(urlObject?.state ?? state, "", urlString);
};

// type FullUrlInfo = Location & UrlInfo;

// const hardNavigate = (url: string | Partial<UrlInfo>) => window.location.assign(formatUrl(url).urlString);

/* eslint-enable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */
