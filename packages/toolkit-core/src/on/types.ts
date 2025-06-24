import type { NonEmptyArray } from "@zayne-labs/toolkit-type-helpers";

export type PossibleNodes = Document | Element | HTMLElement | MediaQueryList | Window | null;

export type ElementOrSelector = string | PossibleNodes;

export type ElementOrSelectorArray = NonEmptyArray<ElementOrSelector>;

type Listener<TEvent extends keyof TNodeEventMap, TNode, TNodeEventMap> = (
	this: TNode,
	event: TNodeEventMap[TEvent]
) => void;

export type AddHtmlEvents<
	TEvent extends keyof HTMLElementEventMap = keyof HTMLElementEventMap,
	TNode extends ElementOrSelector | ElementOrSelectorArray = ElementOrSelector | ElementOrSelectorArray,
> = [
	event: TEvent,
	element: TNode,
	listener: Listener<TEvent, TNode, HTMLElementEventMap>,
	options?: boolean | AddEventListenerOptions,
];

export type AddWindowEvents<
	TEvent extends keyof WindowEventMap = keyof WindowEventMap,
	TNode extends Window = Window,
> = [
	event: TEvent,
	element: TNode,
	listener: Listener<TEvent, TNode, WindowEventMap>,
	options?: boolean | AddEventListenerOptions,
];

export type AddDocumentEvents<
	TEvent extends keyof DocumentEventMap = keyof DocumentEventMap,
	TNode extends Document = Document,
> = [
	event: TEvent,
	element: TNode,
	listener: Listener<TEvent, TNode, DocumentEventMap>,
	options?: boolean | AddEventListenerOptions,
];

export type AddMediaEvents<
	TEvent extends keyof MediaQueryListEventMap = keyof MediaQueryListEventMap,
	TNode extends MediaQueryList = MediaQueryList,
> = [
	event: TEvent,
	element: TNode,
	listener: Listener<TEvent, TNode, MediaQueryListEventMap>,
	options?: boolean | AddEventListenerOptions,
];

// eslint-disable-next-line perfectionist/sort-union-types -- This order is important
export type AddEventParams = AddHtmlEvents | AddMediaEvents | AddWindowEvents | AddDocumentEvents;

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

export interface ON {
	<TEvent extends keyof HTMLElementEventMap, TNode extends ElementOrSelector | ElementOrSelectorArray>(
		...params: AddHtmlEvents<TEvent, TNode>
	): CleanupFn;
	<TEvent extends keyof DocumentEventMap, TNode extends Document>(
		...params: AddDocumentEvents<TEvent, TNode>
	): CleanupFn;
	<TEvent extends keyof MediaQueryListEventMap, TNode extends MediaQueryList>(
		...params: AddMediaEvents<TEvent, TNode>
	): CleanupFn;
	<TEvent extends keyof WindowEventMap, TNode extends Window>(
		...params: AddWindowEvents<TEvent, TNode>
	): CleanupFn;
}

export interface OFF {
	<TEvent extends keyof HTMLElementEventMap, TNode extends ElementOrSelector | ElementOrSelectorArray>(
		...params: AddHtmlEvents<TEvent, TNode>
	): void;
	<TEvent extends keyof DocumentEventMap, TNode extends Document>(
		...params: AddDocumentEvents<TEvent, TNode>
	): void;
	<TEvent extends keyof MediaQueryListEventMap, TNode extends MediaQueryList>(
		...params: AddMediaEvents<TEvent, TNode>
	): void;
	<TEvent extends keyof WindowEventMap, TNode extends Window>(
		...params: AddWindowEvents<TEvent, TNode>
	): void;
}
