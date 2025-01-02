/*
 * Copied from https://github.com/pmndrs/zustand/blob/main/src/vanilla/shallow.ts
 */

import { isIterable, isObject } from "@zayne-labs/toolkit-type-helpers";

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

export const shallow = <T>(valueA: T, valueB: T): boolean => {
	if (Object.is(valueA, valueB)) {
		return true;
	}

	if (!isObject(valueA) || !isObject(valueB)) {
		return false;
	}

	if (!isIterable(valueA) || !isIterable(valueB)) {
		return compareEntries(
			{ entries: () => Object.entries(valueA) },
			{ entries: () => Object.entries(valueB) }
		);
	}

	if (hasIterableEntries(valueA) && hasIterableEntries(valueB)) {
		return compareEntries(valueA, valueB);
	}

	return compareIterables(valueA, valueB);
};
