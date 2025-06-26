import { isIterable, isObject } from "@zayne-labs/toolkit-type-helpers";

/*
 * Copied from https://github.com/pmndrs/zustand/blob/main/src/vanilla/shallow.ts
 */

type RecordWithEntries = {
	entries: () => Iterable<[unknown, unknown]>;
};

const hasIterableEntries = (value: Iterable<unknown>): value is Iterable<unknown> & RecordWithEntries => {
	// == HACK: avoid checking entries type
	return "entries" in value;
};

const compareEntries = (valueA: RecordWithEntries, valueB: RecordWithEntries) => {
	const mapA = valueA instanceof Map ? valueA : new Map(valueA.entries());
	const mapB = valueB instanceof Map ? valueB : new Map(valueB.entries());

	if (mapA.size !== mapB.size) {
		return false;
	}

	for (const [key, value] of mapA) {
		if (!Object.is(value, mapB.get(key))) {
			return false;
		}
	}

	return true;
};

// == Ordered iterables
const compareIterables = (valueA: Iterable<unknown>, valueB: Iterable<unknown>) => {
	const iteratorA = valueA[Symbol.iterator]();
	const iteratorB = valueB[Symbol.iterator]();

	let nextA = iteratorA.next();
	let nextB = iteratorB.next();

	while (!nextA.done && !nextB.done) {
		if (!Object.is(nextA.value, nextB.value)) {
			return false;
		}
		nextA = iteratorA.next();
		nextB = iteratorB.next();
	}

	return Boolean(nextA.done) && Boolean(nextB.done);
};

export const shallowCompare = <T>(valueA: T, valueB: T): boolean => {
	if (Object.is(valueA, valueB)) {
		return true;
	}

	if (!isObject(valueA) || !isObject(valueB)) {
		return false;
	}

	if (Object.getPrototypeOf(valueA) !== Object.getPrototypeOf(valueB)) {
		return false;
	}

	if (
		isIterable(valueA)
		&& isIterable(valueB)
		&& hasIterableEntries(valueA)
		&& hasIterableEntries(valueB)
	) {
		return compareEntries(valueA, valueB);
	}

	if (isIterable(valueA) && isIterable(valueB)) {
		return compareIterables(valueA, valueB);
	}

	// == Assume plain objects
	return compareEntries(
		{ entries: () => Object.entries(valueA) },
		{ entries: () => Object.entries(valueB) }
	);
};

export const shallowObjectCompare = (objA: Record<string, unknown>, objB: Record<string, unknown>) => {
	const keysOfA = Object.keys(objA);

	if (keysOfA.length !== Object.keys(objB).length) {
		return false;
	}

	for (const keyInA of keysOfA) {
		if (!Object.hasOwn(objB, keyInA)) {
			return false;
		}
		if (!Object.is(objA[keyInA], objB[keyInA])) {
			return false;
		}
	}

	return true;
};
