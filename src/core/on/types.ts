import type { NonEmptyArray } from "@/type-helpers";

export type ElementOrSelectorSingle<TOptional = never> =
	| Document
	| HTMLElement
	| MediaQueryList
	| string
	| TOptional
	| Window;

export type ElementOrSelectorArray<TOptional = never> = NonEmptyArray<ElementOrSelectorSingle<TOptional>>;

export type ElementOrSelectorSingleOrArray<TOptional = never> =
	| ElementOrSelectorArray<TOptional>
	| ElementOrSelectorSingle<TOptional>;

type Listener<TEvent extends keyof TNodeEventMap, TNode, TNodeEventMap> = (
	this: TNode,
	event: TNodeEventMap[TEvent],
	cleanup: () => () => void
) => void;

export type AddHtmlEvents<TEvent extends keyof HTMLElementEventMap = keyof HTMLElementEventMap> = [
	event: TEvent,
	element: ElementOrSelectorSingleOrArray<null>,
	listener: Listener<TEvent, HTMLElement, HTMLElementEventMap>,
	options?: AddEventListenerOptions | boolean,
];

export type AddWindowEvents<TEvent extends keyof WindowEventMap = keyof WindowEventMap> = [
	event: TEvent,
	element: Window,
	listener: Listener<TEvent, Window, WindowEventMap>,
	options?: AddEventListenerOptions | boolean,
];

export type AddDocumentEvents<TEvent extends keyof DocumentEventMap = keyof DocumentEventMap> = [
	event: TEvent,
	element: Document,
	listener: Listener<TEvent, Document, DocumentEventMap>,
	options?: AddEventListenerOptions | boolean,
];

export type AddMediaEvents<TEvent extends keyof MediaQueryListEventMap = keyof MediaQueryListEventMap> = [
	event: TEvent,
	element: MediaQueryList,
	listener: Listener<TEvent, MediaQueryList, MediaQueryListEventMap>,
	options?: AddEventListenerOptions | boolean,
];

export type AddEventParams = AddDocumentEvents | AddHtmlEvents | AddMediaEvents | AddWindowEvents;

export type ON = {
	<TEvent extends keyof DocumentEventMap>(...params: AddDocumentEvents<TEvent>): () => void;
	<TEvent extends keyof HTMLElementEventMap>(...params: AddHtmlEvents<TEvent>): () => void;
	<TEvent extends keyof MediaQueryListEventMap>(...params: AddMediaEvents<TEvent>): () => void;
	<TEvent extends keyof WindowEventMap>(...params: AddWindowEvents<TEvent>): () => void;
};

export type RegisterConfig = {
	event: string;
	listener: AddHtmlEvents[2] | AddWindowEvents[2];
	options?: AddEventListenerOptions | boolean;
	type: "add" | "remove";
};
