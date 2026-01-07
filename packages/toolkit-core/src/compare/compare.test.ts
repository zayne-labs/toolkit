/* eslint-disable unicorn/no-useless-undefined -- Allow */
import { describe, expect, it } from "vitest";
import { createComparisonFn, deepCompare, shallowCompare } from "./compare";

describe("compare", () => {
	describe("shallowCompare", () => {
		it("should return true for same primitive values", () => {
			expect(shallowCompare(1, 1)).toBe(true);
			expect(shallowCompare("a", "a")).toBe(true);
			expect(shallowCompare(true, true)).toBe(true);
			expect(shallowCompare(null, null)).toBe(true);
			expect(shallowCompare(undefined, undefined)).toBe(true);
		});

		it("should return false for different primitive values", () => {
			expect(shallowCompare(1, 2)).toBe(false);
			expect(shallowCompare("a", "b")).toBe(false);
			expect(shallowCompare(true, false)).toBe(false);
			expect(shallowCompare(null, undefined)).toBe(false);
		});

		it("should return true for same object references", () => {
			const obj = { a: 1 };
			expect(shallowCompare(obj, obj)).toBe(true);
		});

		it("should return true for shallowly equal objects", () => {
			expect(shallowCompare({ a: 1 }, { a: 1 })).toBe(true);
			expect(shallowCompare({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
		});

		it("should return false for deeply equal but reference-different nested objects", () => {
			// shallowCompare uses Object.is for values, so { c: 2 } !== { c: 2 } (different refs)
			expect(shallowCompare({ a: { c: 2 } }, { a: { c: 2 } })).toBe(false);
		});

		it("should return true for shallowly equal arrays", () => {
			expect(shallowCompare([1, 2], [1, 2])).toBe(true);
		});

		it("should return false for deep nested arrays", () => {
			expect(shallowCompare([[1]], [[1]])).toBe(false);
		});

		it("should compare Dates by value", () => {
			const d1 = new Date(1000);
			const d2 = new Date(1000);
			const d3 = new Date(2000);
			expect(shallowCompare(d1, d2)).toBe(true);
			expect(shallowCompare(d1, d3)).toBe(false);
		});

		it("should compare RegExps by value", () => {
			expect(shallowCompare(/abc/u, /abc/u)).toBe(true);
			expect(shallowCompare(/abc/u, /abc/g)).toBe(false);
		});
	});

	describe("deepCompare", () => {
		it("should handle complex nested objects", () => {
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

		it("should detect differences in nested objects", () => {
			expect(deepCompare({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
		});

		it("should handle nested arrays", () => {
			expect(deepCompare([[1, 2], [3]], [[1, 2], [3]])).toBe(true);
			expect(deepCompare([[1, 2], [3]], [[1, 2], [4]])).toBe(false);
		});

		it("should handle deeply nested Maps", () => {
			const mapA = new Map([["a", { b: 1 }]]);
			const mapB = new Map([["a", { b: 1 }]]);
			const mapC = new Map([["a", { b: 2 }]]);

			expect(deepCompare(mapA, mapB)).toBe(true);
			expect(deepCompare(mapA, mapC)).toBe(false);
		});

		it("should handle deeply nested Sets", () => {
			const setA = new Set([{ a: 1 }]);
			const setB = new Set([{ a: 1 }]);
			const setC = new Set([{ a: 2 }]);

			expect(deepCompare(setA, setB)).toBe(true);
			expect(deepCompare(setA, setC)).toBe(false);
		});

		it("should return false for different types", () => {
			expect(deepCompare({ a: 1 }, [1])).toBe(false);
			expect(deepCompare(null, {})).toBe(false);
		});

		it("should handle sparse arrays", () => {
			const arr1 = [1, , 3]; // eslint-disable-line no-sparse-arrays -- Allow
			const arr2 = [1, , 3]; // eslint-disable-line no-sparse-arrays -- Allow
			const arr3 = [1, undefined, 3];

			expect(deepCompare(arr1, arr2)).toBe(true);
			// sparse slots are usually treated as undefined in iteration or index access
			expect(deepCompare(arr1, arr3)).toBe(true);
		});

		it("should not return false positives due to stale cache (shared state bug)", () => {
			const objA = { val: 1 };
			const objB = { val: 1 };

			// 1. First comparison: Equal
			expect(deepCompare(objA, objB)).toBe(true);

			// 2. Mutate objB
			objB.val = 2;

			// 3. Second comparison: Should be False
			expect(deepCompare(objA, objB)).toBe(false);
		});
	});

	describe("custom depth limits", () => {
		const compareDepth2 = createComparisonFn({ maxDepth: 2 });

		it("should respect maxDepth option", () => {
			const objA = { a: { b: { c: 1 } } };
			const objB = { a: { b: { c: 1 } } };

			// Depth 1: a vs a (shallow -> struct compare).
			// Depth 2: b vs b (shallow -> struct compare).
			// Depth 3: c vs c (shallow -> value check).
			// Wait, maxDepth 2 means:
			// Level 1: Expand 'a'? Yes (1 <= 2).
			// Level 2: Expand 'b'? Yes (2 <= 2).
			// Level 3: Expand 'c'? No (3 > 2). Fallback to Object.is({c:1}, {c:1}).
			// Refs differ -> False.

			// Correct behavior:
			// compare({b:{c:1}}, {b:{c:1}}, depth=2)
			// Struct check keys "b". Next level depth=3.
			// compare({c:1}, {c:1}, depth=3). 3 > 2. return Object.is(). -> False.
			expect(compareDepth2(objA, objB)).toBe(false);
		});

		it("should pass if within depth limit", () => {
			const objA = { a: { b: 1 } };
			const objB = { a: { b: 1 } };
			// Depth 1: a vs a.
			// Depth 2: b vs b.
			// Depth 3 (value): 1 vs 1. 3 > 2? Yes. Object.is(1, 1) -> True.
			expect(compareDepth2(objA, objB)).toBe(true);
		});

		it("should allow overriding options at call site", () => {
			const objA = { a: { b: 1 } };
			const objB = { a: { b: 1 } };

			// Default is Infinity
			expect(deepCompare(objA, objB)).toBe(true);

			// Override maxDepth to 1 -> shallow compare of 'a'.
			// 'a' references a different object, so it should be false.
			expect(deepCompare(objA, objB, { maxDepth: 1 })).toBe(false);
		});

		it("should propagate options to deeply nested comparisons", () => {
			const objA = { a: { b: { c: 1 } } };
			const objB = { a: { b: { c: 1 } } };

			// Depth 1: a
			// Depth 2: b
			// Depth 3: c (check value 1 vs 1)

			// With maxDepth: 2, we stop at 'b' and check equality by reference.
			// { c: 1 } !== { c: 1 } (ref) -> FALSE
			expect(shallowCompare(objA, objB, { maxDepth: 2 })).toBe(false);

			// With maxDepth: 3, we go into 'c' and check values.
			// 1 === 1 -> TRUE
			expect(shallowCompare(objA, objB, { maxDepth: 3 })).toBe(true);
		});
	});

	describe("edge cases", () => {
		it("should return false for prototype mismatches", () => {
			class Foo {
				a = 1;
			}
			const plain = { a: 1 };
			const instance = new Foo();
			expect(deepCompare(plain, instance)).toBe(false);
		});

		it("should handle circular references", () => {
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

		it("should handle key ordering equality", () => {
			const objA = { a: 1, b: 2 };
			// eslint-disable-next-line perfectionist/sort-objects -- Allow
			const objB = { b: 2, a: 1 };
			expect(deepCompare(objA, objB)).toBe(true);
		});

		it("should return false for objects with extra keys", () => {
			const objA = { a: 1 };
			const objB = { a: 1, b: undefined };
			expect(deepCompare(objA, objB)).toBe(false);
		});
	});
});
