export type AsProp<TElement extends React.ElementType> = { as?: TElement };

// == Return the prop object if it already contains the "as" prop, else merge it with the "as" prop
type PropsWithOptionalAs<TElement extends React.ElementType, TProps> = "as" extends keyof TProps
	? TProps
	: AsProp<TElement> & TProps;

// == Get all other primitive element props by Omitting the result of MergedProps from React.ComponentPropsWithoutRef
type InferOtherProps<TElement extends React.ElementType, TProps> = Omit<
	React.ComponentPropsWithoutRef<TElement>,
	// == Removing children and className as well to give components control over these props
	"children" | "className" | keyof PropsWithOptionalAs<TElement, TProps>
>;

// == Polymorphic props helper
export type PolymorphicProps<
	TElement extends React.ElementType,
	TProps extends Record<string, unknown> = AsProp<TElement>,
> = InferOtherProps<TElement, TProps> & PropsWithOptionalAs<TElement, TProps>;

type RefProp<TElement extends React.ElementType> = {
	ref?: React.ComponentPropsWithRef<TElement>["ref"];
};

// == For components with the Ref Prop
export type PolymorphicPropsWithRef<
	TElement extends React.ElementType,
	TProps extends Record<string, unknown> = AsProp<TElement>,
> = PolymorphicProps<TElement, TProps> & RefProp<TElement>;
