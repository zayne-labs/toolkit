import { isArray, isIterable, isObject, isSet } from "@zayne-labs/toolkit-type-helpers";
import {
	compareEntries,
	compareIterables,
	comparePlainObjects,
	hasIterableEntries,
	type EqualityFn,
} from "./utils";

type CreateComparisonFnOptions = {
	equalityFn?: EqualityFn;
};

export const createComparisonFn = (options: CreateComparisonFnOptions = {}) => {
	const { equalityFn = Object.is } = options;

	const compareFn: EqualityFn = <TValue>(valueA: TValue, valueB: TValue) => {
		if (Object.is(valueA, valueB)) {
			return true;
		}

		if (!isObject(valueA) || !isObject(valueB)) {
			return false;
		}

		if (Object.getPrototypeOf(valueA) !== Object.getPrototypeOf(valueB)) {
			return false;
		}

		if (valueA instanceof Date && valueB instanceof Date) {
			return valueA.getTime() === valueB.getTime();
		}

		if (valueA instanceof RegExp && valueB instanceof RegExp) {
			return valueA.source === valueB.source && valueA.flags === valueB.flags;
		}

		if ((isArray(valueA) && isArray(valueB)) || (isSet(valueA) && isSet(valueB))) {
			return compareIterables(valueA, valueB, equalityFn);
		}

		if (isIterable(valueA) && isIterable(valueB)) {
			return hasIterableEntries(valueA) && hasIterableEntries(valueB) ?
					compareEntries(valueA, valueB, equalityFn)
				:	compareIterables(valueA, valueB, equalityFn);
		}

		// Assume plain objects
		return comparePlainObjects(
			valueA as Record<string, unknown>,
			valueB as Record<string, unknown>,
			equalityFn
		);
	};

	return compareFn;
};

/**
 * @description Performs a shallow comparison of two values.
 * - **Primitives**: Compared via `Object.is`.
 * - **Objects/Arrays/Maps/Sets**: Keys/Indices are compared structurally, but their *values* are compared via reference equality (`Object.is`).
 * - **Dates/RegExps**: Compared by value (time/source).
 *
 * @example
 * shallowCompare({ a: 1 }, { a: 1 }) // true
 * shallowCompare({ a: {} }, { a: {} }) // false (nested objects are different references)
 * shallowCompare([1, 2], [1, 2]) // true
 */
export const shallowCompare = createComparisonFn();

/**
 * @description Performs a deep comparison of two values.
 * Recursively compares nested structures to ensure value equality at every depth.
 *
 * **Features:**
 * - **Fast-Paths**: Optimized for Arrays and Plain Objects to avoid extra allocations.
 * - **Supported Types**: Primitives, Arrays, Plain Objects, Maps, Sets, Dates, RegExps.
 * - **Iterables**: Supports generic iterables (sequential comparison).
 *
 * @example
 * deepCompare({ a: { b: 1 } }, { a: { b: 1 } }) // true
 * deepCompare([new Set([1])], [new Set([1])]) // true
 */
export const deepCompare = createComparisonFn({ equalityFn: (a, b) => deepCompare(a, b) });
