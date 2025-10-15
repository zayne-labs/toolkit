import { isArray } from "@zayne-labs/toolkit-type-helpers";

export const toArray = <TValue>(value: TValue | TValue[]): TValue[] => (isArray(value) ? value : [value]);

export const dataAttr = (condition: unknown) => (condition ? "true" : undefined) as unknown as boolean;

// const pipe = <TValue>(functions: Array<(value: TValue) => TValue>) => {
// 	const pipedFn = (value: TValue) =>
// 		functions.reduce((accumulatedValueResult, fn) => fn(accumulatedValueResult), value);

// 	return pipedFn;
// };

export const tw = (strings: TemplateStringsArray, ...values: Array<"Not-Allowed">) => {
	const twClassString = String.raw({ raw: strings }, ...values);

	return twClassString.trim();
};

export const css = (strings: TemplateStringsArray, ...values: Array<number | string | undefined>) => {
	const cssString = String.raw({ raw: strings }, ...values);

	return cssString.trim();
};

// export const css = (strings: TemplateStringsArray, ...values: Array<number | string | undefined>) => {
// 	let accumulatedString = "";

// 	for (const [index, string] of strings.entries()) {
// 		accumulatedString = `${accumulatedString}${string}${values[index] ?? ""}`;
// 	}

// 	return accumulatedString.trim();
// };
