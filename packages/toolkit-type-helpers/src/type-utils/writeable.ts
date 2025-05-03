export type WriteableVariantUnion = "deep" | "shallow";

/**
 * Makes all properties in an object type writeable (removes readonly modifiers).
 * Supports both shallow and deep modes, and handles special cases like arrays, tuples, and unions.
 * @template TObject - The object type to make writeable
 * @template TVariant - The level of writeable transformation ("shallow" | "deep")
 */

type ArrayOrObject = Record<number | string | symbol, unknown> | unknown[];

export type Writeable<
	TObject,
	TVariant extends WriteableVariantUnion = "shallow",
> = TObject extends readonly [...infer TTupleItems]
	? TVariant extends "deep"
		? [
				...{
					[Key in keyof TTupleItems]: TTupleItems[Key] extends ArrayOrObject
						? Writeable<TTupleItems[Key], TVariant>
						: TTupleItems[Key];
				},
			]
		: [...TTupleItems]
	: TObject extends ReadonlyArray<infer TArrayItem>
		? TVariant extends "deep"
			? Array<TArrayItem extends ArrayOrObject ? Writeable<TArrayItem, TVariant> : TArrayItem>
			: TArrayItem[]
		: TObject extends ArrayOrObject
			? {
					-readonly [Key in keyof TObject]: TVariant extends "shallow"
						? TObject[Key]
						: TVariant extends "deep"
							? TObject[Key] extends ArrayOrObject
								? Writeable<TObject[Key], TVariant>
								: TObject[Key]
							: never;
				}
			: TObject;
