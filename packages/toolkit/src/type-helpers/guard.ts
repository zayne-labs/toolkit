import type { AnyAsyncFunction, AnyFunction, AnyObject } from "./type-utils";

export const isString = (value: unknown) => typeof value === "string";

export const isArray = <TArray>(value: unknown): value is TArray[] => Array.isArray(value);

export const isFormData = (value: unknown) => value instanceof FormData;

export const isObject = (value: unknown) => {
	return typeof value === "object" && value !== null;
};

export const isPlainObject = <TObject extends AnyObject>(
	value: unknown,
	// eslint-disable-next-line ts-eslint/no-unsafe-function-type
	Class?: Function
): value is TObject => {
	if (!(typeof value === "object" && value !== null)) {
		return false;
	}

	if (Array.isArray(value)) {
		return false;
	}

	if (Class && value instanceof Class) {
		return true;
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

export const isFile = (value: unknown) => value instanceof File;
