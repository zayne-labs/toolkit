import type { NonEmptyArray } from "@/type-helpers";

export type PossibleNodes = string | Document | HTMLElement | MediaQueryList | Window | null;

export type ElementOrSelector = string | HTMLElement | null;

export type ElementOrSelectorArray = NonEmptyArray<ElementOrSelector>;

type Listener<
	TEvent extends keyof TNodeEventMap,
	TNode,
	TNodeEventMap,
	TType extends "add" | "remove",
> = TType extends "add"
	? (this: TNode, event: TNodeEventMap[TEvent], cleanup: () => () => void) => void
	: (this: TNode, event: TNodeEventMap[TEvent]) => void;

export type AddHtmlEvents<
	TEvent extends keyof HTMLElementEventMap = keyof HTMLElementEventMap,
	TType extends "add" | "remove" = "add",
> = [
	event: TEvent,
	element: ElementOrSelector | ElementOrSelectorArray,
	listener: Listener<TEvent, HTMLElement, HTMLElementEventMap, TType>,
	options?: boolean | AddEventListenerOptions,
];

export type AddWindowEvents<
	TEvent extends keyof WindowEventMap = keyof WindowEventMap,
	TType extends "add" | "remove" = "add",
> = [
	event: TEvent,
	element: Window,
	listener: Listener<TEvent, Window, WindowEventMap, TType>,
	options?: boolean | AddEventListenerOptions,
];

export type AddDocumentEvents<
	TEvent extends keyof DocumentEventMap = keyof DocumentEventMap,
	TType extends "add" | "remove" = "add",
> = [
	event: TEvent,
	element: Document,
	listener: Listener<TEvent, Document, DocumentEventMap, TType>,
	options?: boolean | AddEventListenerOptions,
];

export type AddMediaEvents<
	TEvent extends keyof MediaQueryListEventMap = keyof MediaQueryListEventMap,
	TType extends "add" | "remove" = "add",
> = [
	event: TEvent,
	element: MediaQueryList,
	listener: Listener<TEvent, MediaQueryList, MediaQueryListEventMap, TType>,
	options?: boolean | AddEventListenerOptions,
];

/* eslint-disable perfectionist/sort-object-types */

// eslint-disable-next-line perfectionist/sort-union-types
export type AddEventParams = AddHtmlEvents | AddMediaEvents | AddWindowEvents | AddDocumentEvents;

export type RegisterConfig = {
	event: string;
	listener: AddDocumentEvents[2] | AddHtmlEvents[2] | AddMediaEvents[2] | AddWindowEvents[2];
	// TODO: Work on finding as way to add this in future, probably by attaching the cleanup fb to the event object
	cleanup?: () => () => void;
	options?: boolean | AddEventListenerOptions;
	type: "add" | "remove";
};

export type ON = {
	<TEvent extends keyof HTMLElementEventMap>(...params: AddHtmlEvents<TEvent>): () => void;
	<TEvent extends keyof DocumentEventMap>(...params: AddDocumentEvents<TEvent>): () => void;
	<TEvent extends keyof MediaQueryListEventMap>(...params: AddMediaEvents<TEvent>): () => void;
	<TEvent extends keyof WindowEventMap>(...params: AddWindowEvents<TEvent>): () => void;
};

export type OFF = {
	<TEvent extends keyof HTMLElementEventMap>(...params: AddHtmlEvents<TEvent, "remove">): void;
	<TEvent extends keyof DocumentEventMap>(...params: AddDocumentEvents<TEvent, "remove">): void;
	<TEvent extends keyof MediaQueryListEventMap>(...params: AddMediaEvents<TEvent, "remove">): void;
	<TEvent extends keyof WindowEventMap>(...params: AddWindowEvents<TEvent, "remove">): void;
};
