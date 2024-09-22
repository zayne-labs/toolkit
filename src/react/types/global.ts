export type ForwardedRefType<TComponent extends HTMLElement | React.ElementType> =
	TComponent extends React.ElementType
		? React.ForwardedRef<React.ElementRef<TComponent>>
		: React.ForwardedRef<TComponent>;

export type InferProps<TComponent extends HTMLElement | React.ElementType> =
	TComponent extends React.ElementType
		? React.ComponentPropsWithoutRef<TComponent>
		: React.HTMLAttributes<TComponent>;

export type StateSetter<TSetter = unknown> = React.Dispatch<React.SetStateAction<TSetter>>;

export type MyCustomCss = React.CSSProperties & Record<`--${string}`, string>; // Allows Ts support for inline css variables
