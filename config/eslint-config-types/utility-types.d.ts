/**
 *  == These types allows for adding arbitrary literal types, while still provided autocomplete for defaults.
 *  == Usually intersection with "{}" or "NonNullable<unknown>" would make it work fine, but the "ignore" property with never type will help make it appear at the bottom of intellisense list and errors because of never .
 *
 * @see [typescript issue](https://github.com/microsoft/TypeScript/issues/29729#issuecomment-471566609)
 */
export type AnyString = string & { _ignore?: never };

export type LiteralUnion<TUnion extends TBase, TBase = string> = TUnion | (TBase & { _ignore?: never });
