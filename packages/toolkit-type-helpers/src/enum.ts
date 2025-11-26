import type { ExtractUnion, UnionVariant, Writeable, WriteableLevel } from "./type-utils";

type DefineEnumOptions = {
	unionVariant?: UnionVariant;
	writeableLevel?: WriteableLevel;
};

type DefaultDefineEnumOptions = {
	unionVariant: "keys";
	writeableLevel: "shallow";
};

export const defineEnum = <
	const TValue extends object,
	TOptions extends DefineEnumOptions = DefineEnumOptions,
	TComputedWriteableLevel extends WriteableLevel = [TOptions["writeableLevel"]] extends [WriteableLevel] ?
		TOptions["writeableLevel"]
	:	DefaultDefineEnumOptions["writeableLevel"],
	TComputedUnionVariant extends UnionVariant = [TOptions["unionVariant"]] extends [UnionVariant] ?
		TOptions["unionVariant"]
	:	DefaultDefineEnumOptions["unionVariant"],
>(
	value: TValue,
	_options?: TOptions
) => {
	return value as Writeable<TValue, TComputedWriteableLevel> & {
		$inferUnion: ExtractUnion<TValue, TComputedUnionVariant>;
	};
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
