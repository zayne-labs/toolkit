import { type AnyFunction, isArray } from "@zayne-labs/toolkit-type-helpers";

export const toArray = <TValue>(value: TValue | TValue[]): TValue[] => (isArray(value) ? value : [value]);

export const mergeFunctions = <TFunction extends AnyFunction<void>>(
	...fns: Array<TFunction | undefined>
) => {
	const mergedFunction = (...params: Parameters<TFunction>) => fns.forEach((fn) => fn?.(...params));

	return mergedFunction;
};
