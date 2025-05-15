import type { Prettify, Writeable } from "./type-utils";

export const defineEnum = <const TValue>(value: TValue) => {
	return value as Prettify<Writeable<TValue>>;
};

export const defineEnumDeep = <const TValue>(value: TValue) => {
	return value as Prettify<Writeable<TValue, "deep">>;
};
