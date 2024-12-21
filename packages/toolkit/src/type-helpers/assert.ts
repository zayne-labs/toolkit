import { isString } from "./guard";

class AssertionError extends Error {
	override name = "AssertionError";

	constructor(message?: string) {
		const prefix = "Assertion failed";

		super(message ? `${prefix}: ${message}` : message);
	}
}

export const assertDefined = <TValue>(value: TValue) => {
	if (value == null) {
		throw new AssertionError(`The value passed is "${value as null | undefined}!"`);
	}

	return value;
};

export const assertENV = (variable: string | undefined, message?: string) => {
	if (variable === undefined) {
		throw new AssertionError(message);
	}

	return variable;
};

type AssertOptions = {
	message: string;
};

type AssertFn = {
	(condition: boolean, messageOrOptions?: string | AssertOptions): asserts condition;

	<TValue>(
		value: TValue,
		messageOrOptions?: string | AssertOptions
	): asserts value is NonNullable<TValue>;
};

export const assert: AssertFn = (input: unknown, messageOrOptions?: string | AssertOptions) => {
	if (input === false || input == null) {
		const message = isString(messageOrOptions) ? messageOrOptions : messageOrOptions?.message;

		throw new AssertionError(message);
	}
};
