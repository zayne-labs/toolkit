// == The intersection with "{}" or "unknown" or "NonNullable<unknown>" is necessary to make it work as expected based on quirks in the TS compiler
export type Prettify<TObject> = { [Key in keyof TObject]: TObject[Key] } & NonNullable<unknown>;

// == Using this Immediately Indexed Mapped type helper to help show computed type of anything passed to it instead of just the type name
export type UnmaskType<TType> = { _: TType }["_"];

export type PrettyOmit<TObject, Key extends keyof TObject> = Prettify<Omit<TObject, Key>>;

export type PrettyPick<TObject, Key extends keyof TObject> = Prettify<Pick<TObject, Key>>;

export type CallbackFn<in TParams, out TResult = void> = (...params: TParams[]) => TResult;

export type SelectorFn<in TStore, out TResult> = (state: TStore) => TResult;

export type Writeable<TObject, TType extends "deep" | "shallow" = "shallow"> = {
	-readonly [key in keyof TObject]: TType extends "shallow"
		? TObject[key]
		: TType extends "deep"
			? TObject[key] extends object
				? Writeable<TObject[key], TType>
				: TObject[key]
			: never;
};

export type NonEmptyArray<TArrayItem> = [TArrayItem, ...TArrayItem[]];

export type AnyObject = Record<string, unknown>;

/* eslint-disable @typescript-eslint/no-explicit-any */
// == `Any` is required here so that one can pass custom function type without type errors
export type AnyFunction = UnmaskType<(...args: any[]) => any>;

export type AnyAsyncFunction = UnmaskType<(...args: any[]) => Promise<any>>;

/**
 *  == These types allows for adding arbitrary literal types, while still provided autocomplete for defaults.
 *  == Usually intersection with "{}" or "NonNullable<unknown>" would make it work fine, but the "ignore" property with never type will help make it appear at the bottom of intellisense list and errors because of never .
 * @see [typescript issue](https://github.com/microsoft/TypeScript/issues/29729#issuecomment-471566609)
 */
export type AnyString = string & { _ignore?: never };

export type AnyNumber = number & { _ignore?: never };

// eslint-disable-next-line perfectionist/sort-union-types
export type LiteralUnion<TUnion extends TBase, TBase = string> = TUnion | (TBase & { _ignore?: never });
