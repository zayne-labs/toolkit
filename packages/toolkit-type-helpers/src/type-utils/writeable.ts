type ArrayOrObject = Record<number | string | symbol, unknown> | unknown[];

export type WriteableLevel = "deep" | "shallow";

/**
 * Makes all properties in an object type writeable (removes readonly modifiers).
 * Supports both shallow and deep modes, and handles special cases like arrays, tuples, and unions.
 * @template TObject - The object type to make writeable
 * @template TVariant - The level of writeable transformation ("shallow" | "deep")
 */

export type Writeable<TObject, TLevel extends WriteableLevel = "shallow"> = TObject extends readonly [
	...infer TTupleItems,
]
	? [
			...{
				[Index in keyof TTupleItems]: TLevel extends "deep"
					? Writeable<TTupleItems[Index], "deep">
					: TTupleItems[Index];
			},
		]
	: TObject extends ArrayOrObject
		? {
				-readonly [Key in keyof TObject]: TLevel extends "deep"
					? Writeable<TObject[Key], "deep">
					: TObject[Key];
			}
		: TObject;
