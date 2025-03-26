import type { Prettify, Writeable, WriteableVariantUnion } from "./type-utils";

export const defineEnum = <
	TVariant extends WriteableVariantUnion = "shallow",
	const TValue = NonNullable<unknown>,
>(
	value: TValue
) => {
	return value as Prettify<Writeable<TValue, TVariant>>;
};
