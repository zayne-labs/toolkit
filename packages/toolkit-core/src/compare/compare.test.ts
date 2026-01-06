/* eslint-disable unicorn/no-useless-undefined -- Allow */
import { describe, expect, it } from "vitest";
import { deepCompare, shallowCompare } from "./compare";

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

			// Note: Sets iteration order matters for compareIterables unless we sorted them,
			// but our implementation compares them sequentially.
			// Ideally, sets are unordered, but for deep equality in JS without sorting,
			// insertion order usually implies equality for iterables.
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
