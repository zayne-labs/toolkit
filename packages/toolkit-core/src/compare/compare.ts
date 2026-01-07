import { isArray, isIterable, isObject, isSet } from "@zayne-labs/toolkit-type-helpers";
import {
	compareEntries,
	compareIterables,
	comparePlainObjects,
	hasIterableEntries,
	hasReferentialCycle,
	type CompareFn,
	type CompareFnOptions,
} from "./utils";

export const createComparisonFn = (baseOptions?: CompareFnOptions): CompareFn => {
	type InternalSettings = {
		currentDepth?: number;
		inheritedOptions?: CompareFnOptions;
		visitedNodes?: WeakMap<object, WeakSet<object>>;
	};

	const getComparisonFn =
		(settings?: InternalSettings): CompareFn =>
		(valueA, valueB, options) => {
			const resolvedOptions = {
				equalityFn: Object.is,
				maxDepth: 1,
				...baseOptions,
				...options,
				...settings?.inheritedOptions,
			} satisfies CompareFnOptions;

			const resolvedSettings = {
				currentDepth: 1,
				visitedNodes: new WeakMap<object, WeakSet<object>>(),
				...settings,
			} satisfies InternalSettings;

			if (resolvedSettings.currentDepth > resolvedOptions.maxDepth) {
				return resolvedOptions.equalityFn(valueA, valueB);
			}

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

			if (hasReferentialCycle(valueA, valueB, resolvedSettings.visitedNodes)) {
				return true;
			}

			const nextEqualityFn = getComparisonFn({
				currentDepth: resolvedSettings.currentDepth + 1,
				inheritedOptions: resolvedOptions,
				visitedNodes: resolvedSettings.visitedNodes,
			});

			if ((isArray(valueA) && isArray(valueB)) || (isSet(valueA) && isSet(valueB))) {
				return compareIterables(valueA, valueB, nextEqualityFn);
			}

			if (isIterable(valueA) && isIterable(valueB)) {
				return hasIterableEntries(valueA) && hasIterableEntries(valueB) ?
						compareEntries(valueA, valueB, nextEqualityFn)
					:	compareIterables(valueA, valueB, nextEqualityFn);
			}

			// Assume plain objects
			return comparePlainObjects(
				valueA as Record<string, unknown>,
				valueB as Record<string, unknown>,
				nextEqualityFn
			);
		};

	return getComparisonFn();
};

/**
 * @description Performs a shallow comparison of two values.
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
 * @example
 * deepCompare({ a: { b: 1 } }, { a: { b: 1 } }) // true
 * deepCompare([new Set([1])], [new Set([1])]) // true
 */
export const deepCompare = createComparisonFn({ maxDepth: Number.POSITIVE_INFINITY });
