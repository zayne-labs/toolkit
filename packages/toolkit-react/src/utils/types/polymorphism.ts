import type { AnyObject, Prettify } from "@zayne-labs/toolkit-type-helpers";

export type AsProp<TElement extends React.ElementType> = { as?: TElement };

// == Get the rest of the primitive props by omitting the result of TProps from the ones gotten from React.ComponentPropsWithRef
type InferRestOfProps<TElement extends React.ElementType, TProps> = Omit<
	React.ComponentPropsWithRef<TElement>,
	keyof TProps
>;

// prettier-ignore
// == Merge the AsProp and the TProps, or omit the AsProp if the user passed their own
type MergedPropsWithAs<TElement extends React.ElementType, TProps> = Prettify<Omit<AsProp<TElement>, keyof TProps> & TProps>;

// == Polymorphic props helper
export type PolymorphicProps<
	TElement extends React.ElementType,
	TProps extends AnyObject = NonNullable<unknown>,
	// eslint-disable-next-line perfectionist/sort-intersection-types -- Let first one be first
> = MergedPropsWithAs<TElement, TProps> & InferRestOfProps<TElement, TProps>;
