import type { AnyFunction } from "@/type-helpers";

export type ForwardedRefType<TComponent extends HTMLElement | React.ElementType> =
	TComponent extends React.ElementType
		? React.ForwardedRef<React.ElementRef<TComponent>>
		: React.ForwardedRef<TComponent>;

export type InferProps<TComponent extends HTMLElement | React.ElementType> =
	TComponent extends React.ElementType
		? React.ComponentPropsWithRef<TComponent>
		: React.HTMLAttributes<TComponent>;

export type StateSetter<TSetter = unknown> = React.Dispatch<React.SetStateAction<TSetter>>;

export type MyCustomCss<TExtra extends Record<string, string> = NonNullable<unknown>> =
	React.CSSProperties & Record<`--${string}`, string> & TExtra; // Allows Ts support for inline css variables

/**
 *  @description Using this instead of the official react one to avoid build errors
 */
// eslint-disable-next-line ts-eslint/no-invalid-void-type
export type RefCallback<TElement> = (instance: TElement | null) => (() => void) | void;

export type DiscriminatedRenderProps<
	RenderPropType extends AnyFunction,
	TMessage extends
		string = "Hey, Sorry but since you're currently using the children prop, the render prop is therefore redundant",
> =
	| {
			children: RenderPropType;
			render?: TMessage;
	  }
	| {
			children?: TMessage;
			render: RenderPropType;
	  };
