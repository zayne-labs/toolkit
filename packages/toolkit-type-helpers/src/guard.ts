import type {
	AnyAsyncFunction,
	AnyFunction,
	UnknownObject,
	UnknownObjectWithAnyKey,
} from "./type-utils/common";

export const isString = (value: unknown) => typeof value === "string";

export const isNumber = (value: unknown) => typeof value === "number";

export const isSymbol = (value: unknown) => typeof value === "symbol";

export const isBoolean = (value: unknown) => typeof value === "boolean";

export const isArray = <TArray>(value: unknown): value is TArray[] => Array.isArray(value);

export const isFormData = (value: unknown) => value instanceof FormData;

export const isObject = (value: unknown) => typeof value === "object" && value !== null;

export const isObjectAndNotArray = <TObject = UnknownObject>(value: unknown): value is TObject => {
	return isObject(value) && !isArray(value);
};

export const hasObjectPrototype = (value: unknown) => {
	return Object.prototype.toString.call(value) === "[object Object]";
};

/**
 * @description Copied from TanStack Query's isPlainObject
 * @see https://github.com/TanStack/query/blob/main/packages/query-core/src/utils.ts#L321
 */
export const isPlainObject = <TPlainObject extends UnknownObjectWithAnyKey = UnknownObject>(
	value: unknown
): value is TPlainObject => {
	if (!hasObjectPrototype(value)) {
		return false;
	}

	// If has no constructor
	const constructor = (value as object | undefined)?.constructor;
	if (constructor === undefined) {
		return true;
	}

	// If has modified prototype
	const prototype = constructor.prototype as object;
	if (!hasObjectPrototype(prototype)) {
		return false;
	}

	// If constructor does not have an Object-specific method
	if (!Object.hasOwn(prototype, "isPrototypeOf")) {
		return false;
	}

	// Handles Objects created by Object.create(<arbitrary prototype>)
	if (Object.getPrototypeOf(value) !== Object.prototype) {
		return false;
	}

	// It's probably a plain object at this point
	return true;
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
