import type { UnionDiscriminator } from "@zayne-labs/toolkit-type-helpers";

type ValidElementType = HTMLElement | React.ElementType;

export type ForwardedRefType<TElement extends ValidElementType> =
	TElement extends React.ElementType ? React.ForwardedRef<React.Ref<TElement>>
	:	React.ForwardedRef<TElement>;

export type InferProps<TElement extends ValidElementType> =
	TElement extends React.ElementType ? React.ComponentProps<TElement> : React.HTMLAttributes<TElement>;

type RemoveStringSignature<TObject extends object> = {
	[Key in keyof TObject as string extends Key ? never : Key]: TObject[Key];
};

export type InferPropsStrict<TElement extends ValidElementType> = RemoveStringSignature<
	InferProps<TElement>
>;

export type StateSetter<TSetter = unknown> = React.Dispatch<React.SetStateAction<TSetter>>;

export type CssWithCustomProperties<TExtra extends Record<string, string> = NonNullable<unknown>> =
	React.CSSProperties & Record<`--${string}`, string> & TExtra; // Allows Ts support for inline css variables

export type DefaultRenderItemErrorMessages = {
	children: "Hey, Sorry but the children prop is redundant since you're currently using the render prop to do the same thing";
	renderItem: "Hey, Sorry but the renderItem prop is redundant since you're currently using the children prop to do the same thing";
};

/**
 * @description Represents a set of props that can be used to render a component conditionally based on a discriminated union type.
 * This type allows for the use of either a render prop or children prop, but not both at the same time.
 * If both are provided, a TypeScript error will be thrown.
 * @template TErrorMessages An object of custom messages to display on the disallowed property.
 */
export type DiscriminatedRenderItemProps<
	TRenderItemPropType,
	TErrorMessages extends Record<
		keyof DefaultRenderItemErrorMessages,
		string
	> = DefaultRenderItemErrorMessages,
> = UnionDiscriminator<
	[{ children: TRenderItemPropType }, { renderItem: TRenderItemPropType }],
	TErrorMessages
>;

export type DefaultRenderErrorMessages = {
	children: "Hey, Sorry but the children prop is redundant since you're currently using the render prop to do the same thing";
	render: "Hey, Sorry but the render prop is redundant since you're currently using the children prop to do the same thing";
};
/**
 * @description Represents a set of props that can be used to render a component conditionally based on a discriminated union type.
 * This type allows for the use of either a render prop or children prop, but not both at the same time.
 * If both are provided, a TypeScript error will be thrown.
 * @template TErrorMessages An object of custom messages to display on the disallowed property.
 */
export type DiscriminatedRenderProps<
	TRenderPropType,
	TErrorMessages extends Record<keyof DefaultRenderErrorMessages, string> = DefaultRenderErrorMessages,
> = UnionDiscriminator<[{ children: TRenderPropType }, { render: TRenderPropType }], TErrorMessages>;
