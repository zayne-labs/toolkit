import { isArray } from "@zayne-labs/toolkit-type-helpers";

/**
 * @description Wraps a value in an array if it's not already an array.
 * @param value - The value to ensure is an array.
 * @returns An array containing the value(s).
 */
export const toArray = <TValue>(value: TValue | TValue[]): TValue[] => (isArray(value) ? value : [value]);

/**
 * @description Converts a condition to a data attribute value ("true" or undefined).
 * @param condition - The condition to evaluate.
 * @returns "true" if the condition is truthy, otherwise undefined.
 */
export const dataAttr = (condition: unknown) => (condition ? "true" : undefined) as unknown as boolean;
