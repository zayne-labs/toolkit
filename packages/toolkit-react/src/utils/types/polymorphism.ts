import type { AnyObject } from "@zayne-labs/toolkit-type-helpers";
import type { InferProps, InferPropsStrict } from "./common";

export type AsProp<TElement extends React.ElementType> = { as?: TElement };

// prettier-ignore
// == Merge the AsProp and the TProps, or omit the AsProp if the user passed their own
type MergedGivenPropsWithAs<TElement extends React.ElementType, TProps> = Omit<AsProp<TElement>, keyof TProps> & TProps

// == Polymorphic props helper
export type PolymorphicProps<
	TElement extends React.ElementType,
	TProps extends AnyObject = NonNullable<unknown>,
> = MergedGivenPropsWithAs<TElement, TProps> & Omit<InferProps<TElement>, keyof TProps>;

export type PolymorphicPropsStrict<
	TElement extends React.ElementType,
	TProps extends AnyObject = NonNullable<unknown>,
> = MergedGivenPropsWithAs<TElement, TProps> & Omit<InferPropsStrict<TElement>, keyof TProps>;
