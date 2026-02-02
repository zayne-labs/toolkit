import type { ExtractUnion, InferredUnionVariant, Writeable, WriteableLevel } from "./type-utils";

type DefineEnumOptions = {
	inferredUnionVariant?: "none" | InferredUnionVariant;
	writeableLevel?: WriteableLevel;
};

type DefaultDefineEnumOptions = {
	inferredUnionVariant: "keys";
	writeableLevel: "shallow";
};

type Enum<TValue extends object, TInferredUnionVariant extends InferredUnionVariant> = TValue & {
	$inferUnion: ExtractUnion<TValue, TInferredUnionVariant>;
};

export const defineEnum = <
	const TValue extends object,
	TOptions extends DefineEnumOptions = DefineEnumOptions,
	TComputedWriteableLevel extends NonNullable<DefineEnumOptions["writeableLevel"]> = undefined extends (
		TOptions["writeableLevel"]
	) ?
		DefaultDefineEnumOptions["writeableLevel"]
	:	NonNullable<TOptions["writeableLevel"]>,
	TComputedInferredUnionVariant extends NonNullable<DefineEnumOptions["inferredUnionVariant"]> =
		undefined extends TOptions["inferredUnionVariant"] ? DefaultDefineEnumOptions["inferredUnionVariant"]
		:	NonNullable<TOptions["inferredUnionVariant"]>,
>(
	value: TValue,
	_options?: TOptions
) => {
	return value as TComputedInferredUnionVariant extends InferredUnionVariant ?
		Enum<Writeable<TValue, TComputedWriteableLevel>, TComputedInferredUnionVariant>
	:	Writeable<TValue, TComputedWriteableLevel>;
};

type DefineEnumDeepOptions = Pick<DefineEnumOptions, "inferredUnionVariant">;

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
