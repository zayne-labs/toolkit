import type { ExtractUnion, InferredUnionVariant, Writeable, WriteableLevel } from "./type-utils";

type DefineEnumOptions = {
	inferredUnionVariant?: InferredUnionVariant;
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
	TComputedWriteableLevel extends WriteableLevel = [TOptions["writeableLevel"]] extends [WriteableLevel] ?
		TOptions["writeableLevel"]
	:	DefaultDefineEnumOptions["writeableLevel"],
	TComputedInferredUnionVariant extends InferredUnionVariant = [
		TOptions["inferredUnionVariant"],
	] extends [InferredUnionVariant] ?
		TOptions["inferredUnionVariant"]
	:	DefaultDefineEnumOptions["inferredUnionVariant"],
>(
	value: TValue,
	_options?: TOptions
) => {
	return value as Enum<Writeable<TValue, TComputedWriteableLevel>, TComputedInferredUnionVariant>;
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
