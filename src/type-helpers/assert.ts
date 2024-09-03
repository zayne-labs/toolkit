class AssertionError extends Error {
	override name = "AssertionError";

	constructor(message?: string) {
		const prefix = "Assertion failed";

		super(message ? `${prefix}: ${message}` : message);
	}
}

export const assertDefined = <TValue>(value: TValue) => {
	if (value == null) {
		throw new AssertionError(`The value passed is not defined!`);
	}

	return value;
};

export const assertENV = (variable: string | undefined, message?: string) => {
	if (variable === undefined) {
		throw new AssertionError(message);
	}

	return variable;
};

type AssertFn = {
	(condition: boolean, message?: string): asserts condition;
	<TValue>(value: TValue, message?: string): NonNullable<TValue>;
};

export const assert: AssertFn = (input: unknown, message?: string) => {
	if (input === false || input == null) {
		throw new AssertionError(message);
	}

	return input;
};
