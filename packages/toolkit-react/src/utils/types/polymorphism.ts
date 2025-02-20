import type { Prettify } from "@zayne-labs/toolkit-type-helpers";

export type AsProp<TElement extends React.ElementType> = { as?: TElement };

// == Get the rest of the primitive props by omitting the result of TProps from the ones gotten from React.ComponentPropsWithRef
type InferRestOfProps<TElement extends React.ElementType, TProps> = Omit<
	React.ComponentPropsWithRef<TElement>,
	keyof TProps
>;

// prettier-ignore
// == Merge the AsProp and the TProps, or omit the AsProp if the user passed their own
type MergedPropsWithAs<TElement extends React.ElementType, TProps> = Omit<AsProp<TElement>, keyof TProps> & TProps;

// == Polymorphic props helper
export type PolymorphicProps<
	TElement extends React.ElementType,
	// eslint-disable-next-line ts-eslint/no-explicit-any -- Any is needed so one can pass any prop type without type errors
	TProps extends Record<keyof any, any>,
> = InferRestOfProps<TElement, TProps> & Prettify<MergedPropsWithAs<TElement, TProps>>;
