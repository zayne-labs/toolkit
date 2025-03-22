import type { Prettify, Writeable, WriteableVariantUnion } from "./type-utils";

export const defineEnum = <const TValue, TVariant extends WriteableVariantUnion = "shallow">(
	value: TValue
) => {
	type Enum<$TValue> = Prettify<Writeable<$TValue, TVariant>>;

	return value as Enum<TValue>;
};
