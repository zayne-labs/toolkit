/* eslint-disable unicorn/filename-case -- leave as is */
type ParseJSON = {
	<TResult>(value: string): TResult;
	<TResult>(value: string | null | undefined): TResult | null;
	<TResult>(value: string | null | undefined, defaultValue: TResult): TResult;
};

// Implementation
const parseJSON: ParseJSON = <TResult>(value: unknown, defaultValue = null) => {
	if (typeof value !== "string") {
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
