import type { AnyAsyncFunction, AnyFunction, AnyObject } from "./type-utils";

export const isString = (value: unknown): value is string => typeof value === "string";

export const isArray = <TArray>(value: unknown): value is TArray[] => Array.isArray(value);

export const isFormData = (value: unknown): value is FormData => value instanceof FormData;

export const isObject = (value: unknown): value is object => {
	return typeof value === "object" && value !== null;
};

type IsPlainObjectOptions = {
	/**
	 * @description Will be used to check if the value is an instance of this class
	 */
	// eslint-disable-next-line ts-eslint/no-unsafe-function-type -- Generic class can only be denoted as Function
	Class?: Function;
};

export const isPlainObject = <TObject extends AnyObject>(
	value: unknown,
	options: IsPlainObjectOptions = {}
): value is TObject => {
	const { Class } = options;

	if (!isObject(value)) {
		return false;
	}

	if (isArray(value)) {
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

export const isFile = (value: unknown): value is File => value instanceof File;

export const isIterable = <TIterable>(obj: object): obj is Iterable<TIterable> => Symbol.iterator in obj;
