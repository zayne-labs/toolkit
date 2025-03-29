import type { Prettify, Writeable, WriteableVariantUnion } from "./type-utils";

export const defineEnum = <const TValue, TVariant extends WriteableVariantUnion = "deep">(
	value: TValue
) => {
	return value as Prettify<Writeable<TValue, TVariant>>;
};
