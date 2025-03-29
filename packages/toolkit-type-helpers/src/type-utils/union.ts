import type { Prettify } from "./common";
import type { Writeable } from "./writeable";

/**
 * Type utility that takes two types and allows only the properties of the first type. The properties of the second will be disallowed (typed as `never` by default or a custom message).
 *
 * @template TFirstType The first type. Properties of this type will be required.
 * @template TSecondType The second type. Properties of this type will be disallowed.
 * @template TErrorMessages An object of custom messages to display on the properties of the second type that are disallowed.
 */
type AllowOnlyFirst<
	TFirstType,
	TSecondType,
	TErrorMessages extends Record<string, unknown> = never,
> = Prettify<
	TFirstType & {
		[Key in keyof Omit<TSecondType, keyof TFirstType>]?: Key extends keyof TErrorMessages
			? TErrorMessages[Key]
			: never;
	}
>;

/**
 * Merges all types in an array of types into one type.
 *
 * @template TArrayOfTypes Array of types to merge
 * @template TAccumulator Accumulator for the resulting merged type
 */
type MergeTypes<
	TArrayOfTypes extends unknown[],
	TAccumulator = NonNullable<unknown>,
> = TArrayOfTypes extends [infer TFirstType, ...infer TRest]
	? MergeTypes<TRest, TAccumulator & TFirstType>
	: TAccumulator;

/**
 * Type utility that extracts discriminated properties from a union of types.
 * Takes an array of types and returns a union of types where each type has unique properties.
 *
 * @template TArrayOfTypes Array of types to process
 * @template TErrorMessages An object of custom messages to display on the properties that are disallowed.
 * @template TAccumulator Accumulator for the resulting union
 * @template TMergedProperties Merged properties from all types
 */

export type UnionDiscriminator<
	TArrayOfTypes extends unknown[],
	TErrorMessages extends Record<string, unknown> = never,
	TAccumulator = never,
	TMergedProperties = MergeTypes<TArrayOfTypes>,
> = TArrayOfTypes extends [infer TFirstType, ...infer TRest]
	? UnionDiscriminator<
			TRest,
			TErrorMessages,
			// eslint-disable-next-line perfectionist/sort-union-types -- Let TAccumulator be first
			TAccumulator | AllowOnlyFirst<TFirstType, TMergedProperties, TErrorMessages>,
			TMergedProperties
		>
	: TAccumulator;

export type ExtractUnion<TObject, TVariant extends "keys" | "values" = "values"> = TObject extends
	| Array<infer TUnion>
	| ReadonlyArray<infer TUnion>
	| Set<infer TUnion>
	? TUnion
	: TObject extends Record<infer TKeys, infer TValues>
		? TVariant extends "keys"
			? TKeys
			: Prettify<Writeable<TValues, "deep">>
		: never;
