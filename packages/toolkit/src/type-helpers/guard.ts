import type { AnyAsyncFunction, AnyFunction, AnyObject } from "./type-utils";

export const isString = (value: unknown): value is string => typeof value === "string";

export const isBoolean = (value: unknown) => typeof value === "boolean";

export const isArray = <TArray>(value: unknown): value is TArray[] => Array.isArray(value);

export const isFormData = (value: unknown) => value instanceof FormData;

export const isObject = (value: unknown) => typeof value === "object" && value !== null;

export const isObjectAndNotArray = <TObject = Record<string, unknown>>(
	value: unknown
): value is TObject => {
	return isObject(value) && !isArray(value);
};

export const isPlainObject = <TObject extends AnyObject>(value: unknown): value is TObject => {
	if (!isObject(value)) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value) as unknown;

	// == Check if it's a plain object
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

export const isFile = (value: unknown): value is File => value instanceof File;

export const isIterable = <TIterable>(obj: object): obj is Iterable<TIterable> => Symbol.iterator in obj;
