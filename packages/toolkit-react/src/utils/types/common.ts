import type { UnionDiscriminator } from "@zayne-labs/toolkit-type-helpers";

export type ForwardedRefType<TComponent extends HTMLElement | React.ElementType> =
	TComponent extends React.ElementType ? React.ForwardedRef<React.Ref<TComponent>>
	:	React.ForwardedRef<TComponent>;

export type InferProps<TComponent extends HTMLElement | React.ElementType> =
	TComponent extends React.ElementType ? React.ComponentPropsWithRef<TComponent>
	:	React.HTMLAttributes<TComponent>;

export type StateSetter<TSetter = unknown> = React.Dispatch<React.SetStateAction<TSetter>>;

export type CssWithCustomProperties<TExtra extends Record<string, string> = NonNullable<unknown>> =
	React.CSSProperties & Record<`--${string}`, string> & TExtra; // Allows Ts support for inline css variables

export type DefaultRenderErrorMessages = {
	children: "Hey, Sorry but the children prop is redundant since you're currently using the render prop to do the same thing";
	renderItem: "Hey, Sorry but the renderItem prop is redundant since you're currently using the children prop to do the same thing";
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
> = UnionDiscriminator<[{ children: TRenderPropType }, { renderItem: TRenderPropType }], TErrorMessages>;
