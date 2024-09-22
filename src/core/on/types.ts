import type { NonEmptyArray } from "@/type-helpers";

export type PossibleNodes = string | Document | HTMLElement | MediaQueryList | Window | null;

export type ElementOrSelector = string | HTMLElement | null;

export type ElementOrSelectorArray = NonEmptyArray<ElementOrSelector>;

type Listener<TEvent extends keyof TNodeEventMap, TNode, TNodeEventMap> = (
	this: TNode,
	event: TNodeEventMap[TEvent]
) => void;

export type AddHtmlEvents<TEvent extends keyof HTMLElementEventMap = keyof HTMLElementEventMap> = [
	event: TEvent,
	element: ElementOrSelector | ElementOrSelectorArray,
	listener: Listener<TEvent, HTMLElement, HTMLElementEventMap>,
	options?: boolean | AddEventListenerOptions,
];

export type AddWindowEvents<TEvent extends keyof WindowEventMap = keyof WindowEventMap> = [
	event: TEvent,
	element: Window,
	listener: Listener<TEvent, Window, WindowEventMap>,
	options?: boolean | AddEventListenerOptions,
];

export type AddDocumentEvents<TEvent extends keyof DocumentEventMap = keyof DocumentEventMap> = [
	event: TEvent,
	element: Document,
	listener: Listener<TEvent, Document, DocumentEventMap>,
	options?: boolean | AddEventListenerOptions,
];

export type AddMediaEvents<TEvent extends keyof MediaQueryListEventMap = keyof MediaQueryListEventMap> = [
	event: TEvent,
	element: MediaQueryList,
	listener: Listener<TEvent, MediaQueryList, MediaQueryListEventMap>,
	options?: boolean | AddEventListenerOptions,
];

// eslint-disable-next-line perfectionist/sort-union-types
export type AddEventParams = AddHtmlEvents | AddMediaEvents | AddWindowEvents | AddDocumentEvents;

/* eslint-disable @typescript-eslint/consistent-type-definitions */
export interface RegisterConfig {
	// TODO: Work on finding as way to add this in future, probably by attaching the cleanup fb to the event object
	event: string;
	listener: AddDocumentEvents[2] | AddHtmlEvents[2] | AddMediaEvents[2] | AddWindowEvents[2];
	options?: boolean | AddEventListenerOptions;
	type: "add" | "remove";
}

export interface ON {
	<TEvent extends keyof HTMLElementEventMap>(...params: AddHtmlEvents<TEvent>): () => void;
	<TEvent extends keyof DocumentEventMap>(...params: AddDocumentEvents<TEvent>): () => void;
	<TEvent extends keyof MediaQueryListEventMap>(...params: AddMediaEvents<TEvent>): () => void;
	<TEvent extends keyof WindowEventMap>(...params: AddWindowEvents<TEvent>): () => void;
}

export interface OFF {
	<TEvent extends keyof HTMLElementEventMap>(...params: AddHtmlEvents<TEvent>): void;
	<TEvent extends keyof DocumentEventMap>(...params: AddDocumentEvents<TEvent>): void;
	<TEvent extends keyof MediaQueryListEventMap>(...params: AddMediaEvents<TEvent>): void;
	<TEvent extends keyof WindowEventMap>(...params: AddWindowEvents<TEvent>): void;
}
