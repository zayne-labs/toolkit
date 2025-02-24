/* == The intersection with "{}" or "unknown" or "NonNullable<unknown>" is necessary to make it work as expected based on quirks in the TS compiler */
export type Prettify<TObject> = NonNullable<unknown> & { [Key in keyof TObject]: TObject[Key] };

/* == Using this Immediately Indexed Mapped type helper to help show computed type of anything passed to it instead of just the vague type name */
export type UnmaskType<TType> = { _: TType }["_"];

export type PrettyOmit<TObject, Key extends keyof TObject> = Prettify<Omit<TObject, Key>>;

export type PrettyPick<TObject, Key extends keyof TObject> = Prettify<Pick<TObject, Key>>;

export type CallbackFn<in TParams, out TResult = void> = (...params: TParams[]) => TResult;

export type SelectorFn<TStore, TResult> = (state: TStore) => TResult;

// export type ExtractUnion<TEnum extends Record<string, unknown> | unknown[]> = TEnum extends unknown[]
// 	? TEnum[number]
// 	: TEnum[keyof TEnum];

export type WriteableVariantUnion = "deep" | "shallow";

/**
 * Makes all properties in an object type writeable (removes readonly modifiers).
 * Supports both shallow and deep modes, and handles special cases like arrays, tuples, and unions.
 * @template TObject - The object type to make writeable
 * @template TVariant - The level of writeable transformation ("shallow" | "deep")
 */
export type Writeable<
	TObject,
	TVariant extends WriteableVariantUnion = "shallow",
> = TObject extends readonly [...infer TTupleItems]
	? TVariant extends "deep"
		? [
				...{
					[Key in keyof TTupleItems]: TTupleItems[Key] extends object
						? Writeable<TTupleItems[Key], TVariant>
						: TTupleItems[Key];
				},
			]
		: [...TTupleItems]
	: TObject extends ReadonlyArray<infer TArrayItem>
		? TVariant extends "deep"
			? Array<TArrayItem extends object ? Writeable<TArrayItem, TVariant> : TArrayItem>
			: TArrayItem[]
		: TObject extends object
			? {
					-readonly [Key in keyof TObject]: TVariant extends "shallow"
						? TObject[Key]
						: TVariant extends "deep"
							? TObject[Key] extends object
								? Writeable<TObject[Key], TVariant>
								: TObject[Key]
							: never;
				}
			: TObject;

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

export type NonEmptyArray<TArrayItem> = [TArrayItem, ...TArrayItem[]];

/* eslint-disable ts-eslint/no-explicit-any -- Any is needed so one can pass any prop type without type errors */
export type UnknownObject = UnmaskType<Record<string, unknown>>;

export type UnknownObjectWithAnyKey = UnmaskType<Record<keyof any, unknown>>;

export type AnyObject = UnmaskType<Record<keyof any, any>>;
/* eslint-enable ts-eslint/no-explicit-any -- Any is needed so one can pass any prop type without type errors */

/* eslint-disable ts-eslint/no-explicit-any -- `Any` is required here so that one can pass custom function type without type errors */
export type AnyFunction<TResult = any> = UnmaskType<(...args: any[]) => TResult>;

export type AnyAsyncFunction<TResult = any> = UnmaskType<(...args: any[]) => Promise<TResult>>;
/* eslint-enable ts-eslint/no-explicit-any -- `Any` is required here so that one can pass custom function type without type errors */

/**
 *  - This types allows for adding arbitrary literal types, while still provided autocomplete for defaults.
 *  - Usually intersection with "{}" or "NonNullable<unknown>" would make it work fine, but the "ignore" property with never type will help make it appear at the bottom of intellisense list and errors because of never .
 * @see [typescript issue](https://github.com/microsoft/TypeScript/issues/29729#issuecomment-471566609)
 */
export type AnyString = string & Record<never, never>;

/**
 *  - This types allows for adding arbitrary literal types, while still provided autocomplete for defaults.
 *  - Usually intersection with "{}" or "NonNullable<unknown>" would make it work fine, but the "ignore" property with never type will help make it appear at the bottom of intellisense list and errors because of never .
 * @see [typescript issue](https://github.com/microsoft/TypeScript/issues/29729#issuecomment-471566609)
 */
export type AnyNumber = number & Record<never, never>;

// eslint-disable-next-line perfectionist/sort-union-types, perfectionist/sort-intersection-types -- I want TUnion to be first in the union
export type LiteralUnion<TUnion extends TBase, TBase = string> = TUnion | (TBase & Record<never, never>);
