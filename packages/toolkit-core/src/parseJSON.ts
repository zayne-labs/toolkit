/* eslint-disable unicorn/filename-case -- leave as is */
import { isString } from "@zayne-labs/toolkit-type-helpers";

type ParseJSON = {
	<TResult>(value: string): TResult;
	<TResult>(value: string | null | undefined): TResult | null;
	<TResult>(value: string | null | undefined, fallbackValue: TResult): TResult;
};

const parseJSON: ParseJSON = <TResult>(value: unknown, fallbackValue = null) => {
	if (!isString(value)) {
		return fallbackValue;
	}

	try {
		return JSON.parse(value) as TResult;
	} catch (error) {
		console.error(error);

		return fallbackValue;
	}
};

export { parseJSON };
