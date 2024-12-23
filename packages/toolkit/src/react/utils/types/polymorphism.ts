export type AsProp<TElement extends React.ElementType> = { as?: TElement };

// == Return the prop object if it already contains the "as" prop, else merge it with the "as" prop
type PropsWithOptionalAs<TElement extends React.ElementType, TProps> = "as" extends keyof TProps
	? TProps
	: AsProp<TElement> & TProps;

// == Get all other primitive element props by Omitting the result of MergedProps from React.ComponentPropsWithRef
type InferOtherProps<TElement extends React.ElementType, TProps> = Omit<
	React.ComponentPropsWithRef<TElement>,
	keyof PropsWithOptionalAs<TElement, TProps>
>;

// == Polymorphic props helper
export type PolymorphicProps<
	TElement extends React.ElementType,
	TProps extends Record<string, unknown> = AsProp<TElement>,
> = InferOtherProps<TElement, TProps> & PropsWithOptionalAs<TElement, TProps>;
