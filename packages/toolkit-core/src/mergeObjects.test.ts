import { expect, test } from "vitest";
import { mergeObjects, mergeTwoObjects, mergeValueDefault } from "./mergeObjects";

test("mergeTwoObjects: latter primitive values overwrite former ones", () => {
	expect(mergeTwoObjects({ a: 1, b: "x" }, { a: 2 })).toEqual({ a: 2, b: "x" });
});

test("mergeTwoObjects: arrays are concatenated", () => {
	expect(mergeTwoObjects({ list: [1, 2] }, { list: [3] })).toEqual({ list: [1, 2, 3] });
});

test("mergeTwoObjects: plain objects are shallowly merged", () => {
	expect(mergeTwoObjects({ rules: { a: 1, b: 1 } }, { rules: { b: 2, c: 3 } })).toEqual({
		rules: { a: 1, b: 2, c: 3 },
	});
});

test("mergeTwoObjects: mismatched types are overwritten, not merged", () => {
	expect(mergeTwoObjects<Record<string, unknown>>({ value: { a: 1 } }, { value: false })).toEqual({
		value: false,
	});
	expect(mergeTwoObjects<Record<string, unknown>>({ value: [1] }, { value: "x" })).toEqual({
		value: "x",
	});
});

test("mergeTwoObjects: non-plain objects (RegExp, Date, class instances) are overwritten, not merged", () => {
	const regex = /latter/;

	expect(mergeTwoObjects({ value: /former/ }, { value: regex }).value).toBe(regex);
});

test("mergeTwoObjects: undefined in the latter object doesn't overwrite existing values", () => {
	expect(mergeTwoObjects<{ a?: number[] }>({ a: [1] }, { a: undefined })).toEqual({ a: [1] });
});

test("mergeTwoObjects: undefined for a new key is still set", () => {
	const result = mergeTwoObjects<{ a?: number; b?: number }>({ a: 1 }, { b: undefined });

	expect(result).toHaveProperty("b", undefined);
});

test("mergeTwoObjects: missing objects fall back to the other one", () => {
	expect(mergeTwoObjects(undefined, { a: 1 })).toEqual({ a: 1 });
	expect(mergeTwoObjects({ a: 1 }, undefined)).toEqual({ a: 1 });
	expect(mergeTwoObjects(undefined, undefined)).toEqual({});
});

test("mergeTwoObjects: does not mutate the inputs", () => {
	const former = { list: [1], rules: { a: 1 } };
	const latter = { list: [2], rules: { b: 2 } };

	mergeTwoObjects<Record<string, unknown>>(former, latter);

	expect(former).toEqual({ list: [1], rules: { a: 1 } });
	expect(latter).toEqual({ list: [2], rules: { b: 2 } });
});

test("mergeTwoObjects: custom mergeValue replaces the default, and can fall back to it", () => {
	const result = mergeTwoObjects(
		{ name: "a", tags: ["x"] },
		{ name: "b", tags: ["y"] },
		{
			mergeValue: (key, formerValue, latterValue) => {
				if (key === "name") return `${String(formerValue)}-${String(latterValue)}`;

				return mergeValueDefault(key, formerValue, latterValue);
			},
		}
	);

	expect(result).toEqual({ name: "a-b", tags: ["x", "y"] });
});

test("mergeTwoObjects with undefinedValues 'overwrite': an explicit undefined overwrites (unsets) the existing value", () => {
	const result = mergeTwoObjects<{ a?: number[]; b?: string }>(
		{ a: [1], b: "keep" },
		{ a: undefined },
		{ undefinedValues: "overwrite" }
	);

	expect(result).toEqual({ a: undefined, b: "keep" });
	expect(result).toHaveProperty("a", undefined);
});

test("mergeTwoObjects with undefinedValues 'overwrite': the undefined value is passed through a custom mergeValue", () => {
	const calls: unknown[][] = [];

	const result = mergeTwoObjects<{ a?: string }>(
		{ a: "former" },
		{ a: undefined },
		{
			mergeValue: (key, formerValue, latterValue) => {
				calls.push([key, formerValue, latterValue]);

				return latterValue ?? "fallback";
			},
			undefinedValues: "overwrite",
		}
	);

	expect(calls).toEqual([["a", "former", undefined]]);
	expect(result).toEqual({ a: "fallback" });
});

test("mergeTwoObjects with undefinedValues 'overwrite': mergeObjects forwards the option", () => {
	const result = mergeObjects<{ a?: number }>([{ a: 1 }, { a: undefined }], {
		undefinedValues: "overwrite",
	});

	expect(result).toEqual({ a: undefined });
});

test("mergeObjects: merges left to right and skips undefined entries", () => {
	const result = mergeObjects<{ entry?: string[]; flag?: boolean; rules?: Record<string, string> }>([
		{ entry: ["a"], rules: { files: "error" } },
		undefined,
		{ entry: ["b"], rules: { duplicates: "off" } },
		{ flag: true },
	]);

	expect(result).toEqual({
		entry: ["a", "b"],
		flag: true,
		rules: { duplicates: "off", files: "error" },
	});
});

test("mergeObjects: returns an empty object for an empty array", () => {
	expect(mergeObjects([])).toEqual({});
});
