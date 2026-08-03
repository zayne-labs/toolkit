import { containsOrEquals, getEventTarget, getNearestHTMLElement } from "./dom";
import type { ScrollLockAxis } from "./types";

type ScrollVariables = [position: number, scrollSize: number, clientSize: number];

const alwaysContainsScroll = (node: Element) => node.tagName === "TEXTAREA";

const elementCanBeScrolled = (node: Element, overflow: "overflowX" | "overflowY") => {
	const styles = globalThis.getComputedStyle(node);

	return (
		styles[overflow] !== "hidden"
		&& !(
			styles.overflowY === styles.overflowX
			&& !alwaysContainsScroll(node)
			&& styles[overflow] === "visible"
		)
	);
};

const getVerticalScrollVariables = ({
	clientHeight,
	scrollHeight,
	scrollTop,
}: HTMLElement): ScrollVariables => [scrollTop, scrollHeight, clientHeight];

const getHorizontalScrollVariables = ({
	clientWidth,
	scrollLeft,
	scrollWidth,
}: HTMLElement): ScrollVariables => [scrollLeft, scrollWidth, clientWidth];

export const getScrollVariables = (axis: ScrollLockAxis, node: HTMLElement) =>
	axis === "v" ? getVerticalScrollVariables(node) : getHorizontalScrollVariables(node);

export const elementCouldBeScrolled = (axis: ScrollLockAxis, node: HTMLElement) =>
	axis === "v" ? elementCanBeScrolled(node, "overflowY") : elementCanBeScrolled(node, "overflowX");

const resolveShadowHost = (node: Node): Node =>
	typeof ShadowRoot !== "undefined" && node instanceof ShadowRoot ? node.host : node;

const hasScrollableArea = (axis: ScrollLockAxis, node: Node) => {
	if (!(node instanceof HTMLElement) || !elementCouldBeScrolled(axis, node)) return false;

	const [, scrollSize, clientSize] = getScrollVariables(axis, node);

	return scrollSize > clientSize;
};

export const locationCouldBeScrolled = (axis: ScrollLockAxis, node: HTMLElement) => {
	const ownerDocument = node.ownerDocument;
	let current: Node | null = node;

	while (current && current !== ownerDocument.body) {
		const currentElement = resolveShadowHost(current);

		if (hasScrollableArea(axis, currentElement)) return true;

		current = currentElement.parentNode;
	}

	return false;
};

const getDirectionFactor = (axis: ScrollLockAxis, direction: string | null) =>
	axis === "h" && direction === "rtl" ? -1 : 1;

export const shouldCancelScroll = (
	axis: ScrollLockAxis,
	lockElement: HTMLElement,
	event: Event,
	sourceDelta: number,
	noOverscroll = true
) => {
	const directionFactor = getDirectionFactor(axis, globalThis.getComputedStyle(lockElement).direction);
	const delta = directionFactor * sourceDelta;
	let target = getNearestHTMLElement(getEventTarget(event));
	const targetInLock = target ? containsOrEquals(lockElement, target) : false;
	const isDeltaPositive = delta > 0;

	let availableScroll = 0;
	let availableScrollTop = 0;

	while (target) {
		const [position, scrollSize, clientSize] = getScrollVariables(axis, target);
		const elementScroll = scrollSize - clientSize - directionFactor * position;

		if ((position || elementScroll) && elementCouldBeScrolled(axis, target)) {
			availableScroll += elementScroll;
			availableScrollTop += position;
		}

		const parent = target.parentNode;
		target = (
			parent?.nodeType === Node.DOCUMENT_FRAGMENT_NODE ?
				(parent as ShadowRoot).host
			:	parent) as HTMLElement | null;

		const shouldKeepWalking =
			(!targetInLock && target !== document.body)
			|| (targetInLock && target !== null && containsOrEquals(lockElement, target));

		if (!shouldKeepWalking) break;
	}

	if (
		isDeltaPositive
		&& ((noOverscroll && Math.abs(availableScroll) < 1) || (!noOverscroll && delta > availableScroll))
	) {
		return true;
	}

	return (
		!isDeltaPositive
		&& ((noOverscroll && Math.abs(availableScrollTop) < 1)
			|| (!noOverscroll && -delta > availableScrollTop))
	);
};
