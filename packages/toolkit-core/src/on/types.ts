import type { NonEmptyArray } from "@zayne-labs/toolkit-type-helpers";

type WindowOrGlobalThis = typeof globalThis;

export type ElementOrSelector = string | Element | HTMLElement;

export type ElementOrSelectorArray = NonEmptyArray<ElementOrSelector>;

type Listener<TEvent extends keyof TNodeEventMap, TNode, TNodeEventMap> = (
	this: TNode,
	event: TNodeEventMap[TEvent]
) => void;

type GetAddEventParams<TEvent extends keyof TNodeEventMap, TNode, TNodeEventMap> = [
	element: TNode,
	event: TEvent,
	listener: Listener<TEvent, TNode, TNodeEventMap>,
	options?: boolean | AddEventListenerOptions,
];

export type AddHtmlEvents<
	TEvent extends keyof HTMLElementEventMap = keyof HTMLElementEventMap,
	TNode extends ElementOrSelector | ElementOrSelectorArray = ElementOrSelector | ElementOrSelectorArray,
> = GetAddEventParams<TEvent, TNode, HTMLElementEventMap>;

export type AddWindowEvents<
	TEvent extends keyof WindowEventMap = keyof WindowEventMap,
	TNode extends WindowOrGlobalThis = WindowOrGlobalThis,
> = GetAddEventParams<TEvent, TNode, WindowEventMap>;

export type AddDocumentEvents<
	TEvent extends keyof DocumentEventMap = keyof DocumentEventMap,
	TNode extends Document = Document,
> = GetAddEventParams<TEvent, TNode, DocumentEventMap>;

export type AddMediaEvents<
	TEvent extends keyof MediaQueryListEventMap = keyof MediaQueryListEventMap,
	TNode extends MediaQueryList = MediaQueryList,
> = GetAddEventParams<TEvent, TNode, MediaQueryListEventMap>;

export type AddEventParams = AddDocumentEvents | AddHtmlEvents | AddMediaEvents | AddWindowEvents;

export interface RegisterConfig {
	/**
	 * The event to attach to the element
	 */
	event: string;

	/**
	 * The listener to attach to the event
	 */
	listener: AddDocumentEvents[2] | AddHtmlEvents[2] | AddMediaEvents[2] | AddWindowEvents[2];

	/**
	 * The options to attach to the event
	 */
	options?: Parameters<typeof addEventListener>[2];

	/**
	 * The scope to use for the query
	 *
	 * @default document
	 */
	queryScope?: Document | HTMLElement;

	/**
	 * The type of query to use
	 *
	 * @default "querySelectorAll"
	 */
	queryType?: "querySelector" | "querySelectorAll";

	type: "add" | "remove";
}
type CleanupFn = () => void;

export interface ON<TReturn = CleanupFn> {
	<TEvent extends keyof HTMLElementEventMap, TNode extends ElementOrSelector | ElementOrSelectorArray>(
		...params: AddHtmlEvents<TEvent, TNode>
	): TReturn;
	<TEvent extends keyof DocumentEventMap, TNode extends Document>(
		...params: AddDocumentEvents<TEvent, TNode>
	): TReturn;
	<TEvent extends keyof WindowEventMap, TNode extends WindowOrGlobalThis>(
		...params: AddWindowEvents<TEvent, TNode>
	): TReturn;
	<TEvent extends keyof MediaQueryListEventMap, TNode extends MediaQueryList>(
		...params: AddMediaEvents<TEvent, TNode>
	): TReturn;
}

export type OFF = ON<void>;
