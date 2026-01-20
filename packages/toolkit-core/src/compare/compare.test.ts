import { expect, test } from "vitest";
import { createComparisonFn, deepCompare, shallowCompare } from "./compare";

test("shallowCompare - shallowly equal objects", () => {
	expect(shallowCompare({ a: 1 }, { a: 1 })).toBe(true);
	expect(shallowCompare({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
});

test("shallowCompare - deeply equal but reference-different nested objects", () => {
	// shallowCompare uses Object.is for values, so { c: 2 } !== { c: 2 } (different refs)
	expect(shallowCompare({ a: { c: 2 } }, { a: { c: 2 } })).toBe(false);
});

test("deepCompare - handle complex nested objects", () => {
	const objA = {
		a: 1,
		b: { c: 2, d: [3, 4] },
		e: new Set([5, 6]),
		f: new Map([["key", "value"]]),
	};
	const objB = {
		a: 1,
		b: { c: 2, d: [3, 4] },
		e: new Set([5, 6]),
		f: new Map([["key", "value"]]),
	};

	expect(deepCompare(objA, objB)).toBe(true);
});

test("deepCompare - detect differences in nested objects", () => {
	expect(deepCompare({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
});

test("deepCompare - handle nested arrays", () => {
	expect(deepCompare([[1, 2], [3]], [[1, 2], [3]])).toBe(true);
	expect(deepCompare([[1, 2], [3]], [[1, 2], [4]])).toBe(false);
});

test("deepCompare - handle deeply nested Maps", () => {
	const mapA = new Map([["a", { b: 1 }]]);
	const mapB = new Map([["a", { b: 1 }]]);
	const mapC = new Map([["a", { b: 2 }]]);

	expect(deepCompare(mapA, mapB)).toBe(true);
	expect(deepCompare(mapA, mapC)).toBe(false);
});

test("deepCompare - handle deeply nested Sets", () => {
	const setA = new Set([{ a: 1 }]);
	const setB = new Set([{ a: 1 }]);
	const setC = new Set([{ a: 2 }]);

	expect(deepCompare(setA, setB)).toBe(true);
	expect(deepCompare(setA, setC)).toBe(false);
});

test("deepCompare - handle sparse arrays", () => {
	const arr1 = [1, , 3]; // eslint-disable-line no-sparse-arrays -- Allow
	const arr2 = [1, , 3]; // eslint-disable-line no-sparse-arrays -- Allow
	const arr3 = [1, undefined, 3];

	expect(deepCompare(arr1, arr2)).toBe(true);
	// sparse slots are usually treated as undefined in iteration or index access
	expect(deepCompare(arr1, arr3)).toBe(true);
});

test("deepCompare - do not return false positives due to stale cache (shared state bug)", () => {
	const objA = { val: 1 };
	const objB = { val: 1 };

	// 1. First comparison: Equal
	expect(deepCompare(objA, objB)).toBe(true);

	// 2. Mutate objB
	objB.val = 2;

	// 3. Second comparison: Should be False
	expect(deepCompare(objA, objB)).toBe(false);
});

test("custom depth limits - respect and propagate maxDepth option", () => {
	const objA = { a: { b: { c: 1 } } };
	const objB = { a: { b: { c: 1 } } };

	// 1. Overriding at call site
	expect(deepCompare(objA, objB, { maxDepth: 1 })).toBe(false); // Fails at 'a'
	expect(deepCompare(objA, objB, { maxDepth: 3 })).toBe(true); // Passes at 'c'

	// 2. Pre-configured function
	const compareDepth2 = createComparisonFn({ maxDepth: 2 });
	expect(compareDepth2(objA, objB)).toBe(false); // Fails at 'b'

	const objC = { a: { b: 1 } };
	const objD = { a: { b: 1 } };
	expect(compareDepth2(objC, objD)).toBe(true); // Passes at 'b'
});

test("edge cases - return false for prototype mismatches", () => {
	class Foo {
		a = 1;
	}
	const plain = { a: 1 };
	const instance = new Foo();
	expect(deepCompare(plain, instance)).toBe(false);
});

test("edge cases - handle circular references", () => {
	const objA: Record<string, unknown> = { a: 1 };
	objA.self = objA;
	const objB: Record<string, unknown> = { a: 1 };
	objB.self = objB;

	expect(deepCompare(objA, objB)).toBe(true);

	const objC: Record<string, unknown> = { a: 1 };
	// eslint-disable-next-line unicorn/no-immediate-mutation -- Allow
	objC.self = { a: 1 };
	expect(deepCompare(objA, objC)).toBe(false);
});

test("edge cases - handle key ordering equality", () => {
	const objA = { a: 1, b: 2 };
	// eslint-disable-next-line perfectionist/sort-objects -- Allow
	const objB = { b: 2, a: 1 };
	expect(deepCompare(objA, objB)).toBe(true);
});

test("edge cases - return false for objects with extra keys", () => {
	const objA = { a: 1 };
	const objB = { a: 1, b: undefined };
	expect(deepCompare(objA, objB)).toBe(false);
});
