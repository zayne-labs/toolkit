/* eslint-disable unicorn/filename-case */
/* eslint-disable perfectionist/sort-object-types */

type ParseJSON = {
	<TResult>(value: string): TResult;
	<TResult>(value: string | undefined | null): TResult | null;
	<TResult>(value: string | undefined | null, defaultValue: TResult): TResult;
};

// Implementation
const parseJSON: ParseJSON = <TResult>(value: unknown, defaultValue = null) => {
	if (typeof value !== "string") {
		console.warn("parseJSON: value to be parsed is not a string");

		return defaultValue;
	}

	try {
		return JSON.parse(value) as TResult;
	} catch (error) {
		console.error(error);

		return defaultValue;
	}
};

export { parseJSON };
