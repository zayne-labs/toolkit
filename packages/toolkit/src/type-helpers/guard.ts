import type { AnyAsyncFunction, AnyFunction, AnyObject } from "./types";

export const isString = (value: unknown) => typeof value === "string";

export const isArray = <TArray>(value: unknown): value is TArray[] => Array.isArray(value);

export const isFormData = (value: unknown) => value instanceof FormData;

export const isObject = <TObject extends AnyObject>(value: unknown): value is TObject => {
	return typeof value === "object" && value !== null && !isArray(value);
};

// eslint-disable-next-line ts-eslint/no-unsafe-function-type
export const isPlainObject = (value: unknown, Class?: Function) => {
	if (!isObject(value)) {
		return false;
	}

	if (Class && value instanceof Class) {
		return true;
	}

	const prototype = Object.getPrototypeOf(value) as unknown;

	// Check if it's a plain object
	return (
		(prototype == null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) &&
		!(Symbol.toStringTag in value)
	);
};

export const isFunction = <TFunction extends AnyFunction>(value: unknown): value is TFunction => {
	return typeof value === "function";
};

export const isAsyncFunction = <TAsyncFunction extends AnyAsyncFunction>(
	value: unknown
): value is TAsyncFunction => {
	return isFunction(value) && value.constructor.name === "AsyncFunction";
};
