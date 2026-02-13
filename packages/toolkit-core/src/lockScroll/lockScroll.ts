import { isBrowser } from "../constants";
import { getScrollbarWidth, hasVerticalScrollBar } from "./utils";

type LockScrollOptions = {
	lock: boolean;
	targetElement?: () => HTMLElement;
};

export const lockScroll = (options: LockScrollOptions) => {
	const { lock, targetElement } = options;

	if (!isBrowser() || !hasVerticalScrollBar()) return;

	const elementToLock = targetElement?.() ?? document.body;

	const lockFn = () => {
		const computedStyle = globalThis.getComputedStyle(elementToLock);

		const scrollbarWidth = getScrollbarWidth();
		const existingPaddingRight = Number.parseFloat(computedStyle.paddingRight) || 0;
		const updatedPaddingRight = existingPaddingRight + scrollbarWidth;

		elementToLock.style.overflow = "hidden";
		elementToLock.style.paddingRight = `${updatedPaddingRight}px`;
		elementToLock.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
	};

	const unlockFn = () => {
		elementToLock.style.removeProperty("overflow");
		elementToLock.style.removeProperty("padding-right");
		elementToLock.style.removeProperty("--scrollbar-width");
	};

	lock ? lockFn() : unlockFn();
};
