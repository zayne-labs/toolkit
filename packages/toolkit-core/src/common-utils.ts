import { isArray } from "@zayne-labs/toolkit-type-helpers";

export const toArray = <TValue>(value: TValue | TValue[]): TValue[] => (isArray(value) ? value : [value]);

export const dataAttr = (condition: unknown) => (condition ? "true" : undefined) as unknown as boolean;

// const pipe = <TValue>(functions: Array<(value: TValue) => TValue>) => {
// 	const pipedFn = (value: TValue) =>
// 		functions.reduce((accumulatedValueResult, fn) => fn(accumulatedValueResult), value);

// 	return pipedFn;
// };

export const tw = (strings: TemplateStringsArray, ...values: Array<"Not-Allowed">) => {
	const twClassString = strings.reduce(
		(accumulatedString, string, index) => `${accumulatedString}${string}${values[index] ?? ""}`,
		""
	);

	return twClassString.trim();
};

export const css = (strings: TemplateStringsArray, ...values: Array<number | string | undefined>) => {
	const cssString = strings.reduce(
		(accumulatedString, string, index) => `${accumulatedString}${string}${values[index] ?? ""}`,
		""
	);

	return cssString.trim();
};
