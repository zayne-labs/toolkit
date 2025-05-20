import type { ExtractUnion, Prettify, UnionVariant, Writeable, WriteableLevel } from "./type-utils";

type DefineEnumOptions = {
	unionVariant?: UnionVariant;
	writeableLevel?: WriteableLevel;
};

export const defineEnum = <
	const TValue extends object,
	TOptions extends DefineEnumOptions = DefineEnumOptions,
>(
	value: TValue,
	_options?: TOptions
) => {
	type UnionProp = {
		"~inferredUnion": ExtractUnion<
			TValue,
			TOptions["unionVariant"] extends UnionVariant ? TOptions["unionVariant"] : "values"
		>;
	};

	return value as Prettify<
		Writeable<
			TValue,
			TOptions["writeableLevel"] extends WriteableLevel ? TOptions["writeableLevel"] : "shallow"
		>
	>
		& UnionProp;
};

type DefineEnumDeepOptions = Pick<DefineEnumOptions, "unionVariant">;

export const defineEnumDeep = <
	const TValue extends object,
	TOptions extends DefineEnumDeepOptions = DefineEnumDeepOptions,
>(
	value: TValue,
	_options?: TOptions
) => {
	return defineEnum<TValue, TOptions & { writeableLevel: "deep" }>(value);
};
