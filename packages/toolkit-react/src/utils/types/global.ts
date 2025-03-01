export type ForwardedRefType<TComponent extends HTMLElement | React.ElementType> =
	TComponent extends React.ElementType
		? React.ForwardedRef<React.Ref<TComponent>>
		: React.ForwardedRef<TComponent>;

export type InferProps<TComponent extends HTMLElement | React.ElementType> =
	TComponent extends React.ElementType
		? React.ComponentPropsWithRef<TComponent>
		: React.HTMLAttributes<TComponent>;

export type StateSetter<TSetter = unknown> = React.Dispatch<React.SetStateAction<TSetter>>;

export type MyCustomCss<TExtra extends Record<string, string> = NonNullable<unknown>> = React.CSSProperties
	& Record<`--${string}`, string>
	& TExtra; // Allows Ts support for inline css variables

/**
 * @description Represents a set of props that can be used to render a component conditionally based on a discriminated union type.
 * This type allows for the use of either a render prop or children prop, but not both at the same time.
 * If both are provided, a TypeScript error will be thrown.
 * @template TMessage A message to display when the render prop is not used and the children prop is instead used.
 */
export type DiscriminatedRenderProps<
	TRenderPropType,
	TMessage extends
		string = "Hey, Sorry but since you're currently using the children prop, the render prop is therefore redundant",
> =
	| {
			children: TRenderPropType;
			render?: TMessage;
	  }
	| {
			children?: TMessage;
			render: TRenderPropType;
	  };
