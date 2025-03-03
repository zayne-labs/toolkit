import type { Prettify } from "./common";
import type { Writeable } from "./writeable";

type AllowOnlyFirst<TFirstType, TSecondType, TExclusionValue = never> = Prettify<
	// eslint-disable-next-line perfectionist/sort-intersection-types -- I want TFirstType to be first
	TFirstType & Partial<Record<keyof Omit<TSecondType, keyof TFirstType>, TExclusionValue>>
>;

type AllowOnlyFirstRequired<TFirstType, TSecondType, TExclusionValue = never> = Prettify<
	// eslint-disable-next-line perfectionist/sort-intersection-types -- I want TFirstType to be first
	TFirstType & Record<keyof Omit<TSecondType, keyof TFirstType>, TExclusionValue>
>;

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
 * @template TExclusionValue Value to exclude from the resulting union
 * @template TAccumulator Accumulator for the resulting union
 * @template TMergedProperties Merged properties from all types
 */

export type UnionDiscriminator<
	TArrayOfTypes extends unknown[],
	TExclusionValue = never,
	TAccumulator = never,
	TMergedProperties = MergeTypes<TArrayOfTypes>,
> = TArrayOfTypes extends [infer TFirstType, ...infer TRest]
	? UnionDiscriminator<
			TRest,
			TExclusionValue,
			// eslint-disable-next-line perfectionist/sort-union-types -- Let TAccumulator be first
			TAccumulator | AllowOnlyFirst<TFirstType, TMergedProperties, TExclusionValue>,
			TMergedProperties
		>
	: TAccumulator;

/**
 * Type utility that extracts discriminated properties from a union of types.
 * Takes an array of types and returns a union of types where each type has unique properties.
 *
 * @template TArrayOfTypes - Array of types to process
 * @template TExclusionValue - Value to exclude from the resulting union
 * @template TAccumulator - Accumulator for the resulting union
 * @template TMergedProperties - Merged properties from all types
 */
export type UnionDiscriminatorRequired<
	TArrayOfTypes extends unknown[],
	TExclusionValue = never,
	TAccumulator = never,
	TMergedProperties = MergeTypes<TArrayOfTypes>,
> = TArrayOfTypes extends [infer TFirstType, ...infer TRest]
	? UnionDiscriminatorRequired<
			TRest,
			TExclusionValue,
			// eslint-disable-next-line perfectionist/sort-union-types -- Let TAccumulator be first
			TAccumulator | AllowOnlyFirstRequired<TFirstType, TMergedProperties, TExclusionValue>,
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
