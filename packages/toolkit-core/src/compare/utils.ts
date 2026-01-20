import { isMap, type UnmaskType } from "@zayne-labs/toolkit-type-helpers";

/*
 * Inspired by https://github.com/pmndrs/zustand/blob/main/src/vanilla/shallow.ts
 */

type RecordWithEntries = {
	entries: () => Iterable<[unknown, unknown]>;
};

export type CompareFn = UnmaskType<
	(valueA: unknown, valueB: unknown, options?: CompareFnOptions) => boolean
>;

export type CompareFnOptions = {
	/**
	 * Custom equality function to use when the limit is reached.
	 * @default Object.is
	 */
	equalityFn?: CompareFn;
	/**
	 * The maximum depth to recurse.
	 * @default 1
	 */
	maxDepth?: number;
};

export const hasIterableEntries = (
	value: Iterable<unknown>
): value is Iterable<unknown> & RecordWithEntries => {
	// == HACK: avoid checking entries type
	return "entries" in value;
};

export const compareEntries = (
	valueA: RecordWithEntries,
	valueB: RecordWithEntries,
	equalityFn: CompareFn
) => {
	const mapA = isMap(valueA) ? valueA : new Map(valueA.entries());
	const mapB = isMap(valueB) ? valueB : new Map(valueB.entries());

	if (mapA.size !== mapB.size) {
		return false;
	}

	for (const [keyInA, valueInA] of mapA) {
		if (!mapB.has(keyInA) || !equalityFn(valueInA, mapB.get(keyInA))) {
			return false;
		}
	}

	return true;
};

// == Ordered iterables
export const compareIterables = (
	valueA: Iterable<unknown>,
	valueB: Iterable<unknown>,
	equalityFn: CompareFn
) => {
	const iteratorA = valueA[Symbol.iterator]();
	const iteratorB = valueB[Symbol.iterator]();

	let nextA = iteratorA.next();
	let nextB = iteratorB.next();

	while (!nextA.done && !nextB.done) {
		if (!equalityFn(nextA.value, nextB.value)) {
			return false;
		}
		nextA = iteratorA.next();
		nextB = iteratorB.next();
	}

	return Boolean(nextA.done) && Boolean(nextB.done);
};

export const comparePlainObjects = (
	objA: Record<string, unknown>,
	objB: Record<string, unknown>,
	equalityFn: CompareFn = Object.is
) => {
	const keysOfA = Object.keys(objA);

	if (keysOfA.length !== Object.keys(objB).length) {
		return false;
	}

	for (const keyInA of keysOfA) {
		if (!Object.hasOwn(objB, keyInA) || !equalityFn(objA[keyInA], objB[keyInA])) {
			return false;
		}
	}

	return true;
};

export const hasReferentialCycle = (
	valueA: object,
	valueB: object,
	visited: WeakMap<object, WeakSet<object>>
) => {
	const comparedWithA = visited.get(valueA);

	if (comparedWithA?.has(valueB)) {
		return true;
	}

	if (!comparedWithA) {
		visited.set(valueA, new WeakSet([valueB]));
		return false;
	}

	comparedWithA.add(valueB);
	return false;
};
