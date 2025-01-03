import { isArray } from "@zayne-labs/toolkit-type-helpers";

const toArray = <TValue>(value: TValue | TValue[]): TValue[] => (isArray(value) ? value : [value]);

export { toArray };
