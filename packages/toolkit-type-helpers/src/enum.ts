import type { ExtractUnion, UnionVariant, Writeable, WriteableLevel } from "./type-utils";

type DefineEnumOptions = {
	unionVariant?: UnionVariant;
	writeableLevel?: WriteableLevel;
};

type EnumWithInferredUnionType<TResult, TUnionVariant extends UnionVariant> = TResult & {
	$inferUnion: ExtractUnion<TResult, TUnionVariant>;
};

type DefaultDefineEnumOptions = { unionVariant: "keys"; writeableLevel: "shallow" };

export const defineEnum = <
	const TValue extends object,
	TOptions extends DefineEnumOptions = DefaultDefineEnumOptions,
	TComputedWriteableLevel extends WriteableLevel = [TOptions["writeableLevel"]] extends [WriteableLevel] ?
		TOptions["writeableLevel"]
	:	DefaultDefineEnumOptions["writeableLevel"],
	TComputedUnionVariant extends UnionVariant = [TOptions["unionVariant"]] extends [UnionVariant] ?
		TOptions["unionVariant"]
	:	DefaultDefineEnumOptions["unionVariant"],
>(
	value: TValue,
	_options?: TOptions
): EnumWithInferredUnionType<Writeable<TValue, TComputedWriteableLevel>, TComputedUnionVariant> => {
	return value as never;
};

type DefineEnumDeepOptions = Pick<DefineEnumOptions, "unionVariant">;

export const defineEnumDeep = <
	const TValue extends object,
	TOptions extends DefineEnumDeepOptions = DefineEnumDeepOptions,
>(
	value: TValue,
	_options?: TOptions
) => {
	type ModifiedOptions = TOptions & { writeableLevel: "deep" };

	return defineEnum<TValue, ModifiedOptions>(value);
};
