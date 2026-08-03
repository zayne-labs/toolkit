import { isBrowser } from "../constants";
import type { ScrollLockElementResolver, ScrollLockShard } from "./types";

type RefLike<TValue> = {
	current: TValue | null | undefined;
};

const isRefLike = <TValue>(value: unknown): value is RefLike<TValue> =>
	typeof value === "object" && value !== null && "current" in value;

export const resolveElement = (
	element: RefLike<HTMLElement> | ScrollLockElementResolver | undefined
): HTMLElement | null => {
	if (!isBrowser()) return null;

	if (typeof element === "function") return element() ?? null;

	if (isRefLike<HTMLElement>(element)) return element.current ?? null;

	return element ?? null;
};

export const resolveShards = (
	shards: ScrollLockShard[] | (() => ScrollLockShard[] | null | undefined) | undefined
) => {
	const resolvedShards = typeof shards === "function" ? shards() : shards;

	return (resolvedShards ?? [])
		.map((shard) => resolveElement(shard))
		.filter((element) => element !== null);
};

export const containsOrEquals = (parent: HTMLElement, child: EventTarget | null) => {
	if (!(child instanceof Node)) return false;

	let currentNode: Node | null = child;

	while (currentNode) {
		if (parent === currentNode || parent.contains(currentNode)) return true;

		const rootNode = currentNode.getRootNode();
		currentNode =
			typeof ShadowRoot !== "undefined" && rootNode instanceof ShadowRoot ? rootNode.host : null;
	}

	return false;
};

export const getEventPath = (event: Event) =>
	typeof event.composedPath === "function" ? event.composedPath() : [event.target].filter(Boolean);

export const eventPathContains = (parent: HTMLElement, event: Event) =>
	getEventPath(event).some((target) => containsOrEquals(parent, target));

export const getEventTarget = (event: Event) => getEventPath(event)[0] ?? event.target;

export const getNearestHTMLElement = (target: EventTarget | null) => {
	let currentNode = target instanceof Node ? target : null;

	while (currentNode) {
		if (currentNode instanceof HTMLElement) return currentNode;

		currentNode =
			typeof ShadowRoot !== "undefined" && currentNode instanceof ShadowRoot ?
				currentNode.host
			:	currentNode.parentNode;
	}

	return null;
};

let passiveSupported: boolean | undefined;
const nonPassiveOptions = { passive: false } satisfies AddEventListenerOptions;

export const getNonPassiveOptions = () => {
	if (passiveSupported === undefined && isBrowser()) {
		try {
			const options = Object.defineProperty({}, "passive", {
				get() {
					passiveSupported = true;
					return true;
				},
			});

			globalThis.addEventListener("test", null as never, options);
			globalThis.removeEventListener("test", null as never, options);
		} catch {
			passiveSupported = false;
		}
	}

	return passiveSupported ? nonPassiveOptions : false;
};
