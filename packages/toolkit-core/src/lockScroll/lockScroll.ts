import { isBrowser } from "../constants";
import { getScrollbarWidth, hasVerticalScrollBar } from "./utils";

type LockScrollOptions = {
	lock: boolean;
};

type ScrollLockAPI = {
	isLocked: () => boolean;
	lock: () => void;
	unlock: () => void;
};

type ScrollLockState = {
	isLocked: boolean;
	originalOverflow: string | null;
	originalPaddingRight: string | null;
};

const createScrollLock = (): ScrollLockAPI => {
	const state: ScrollLockState = {
		isLocked: false,
		originalOverflow: null,
		originalPaddingRight: null,
	};

	const isLocked = () => state.isLocked;

	const lock = () => {
		if (!isBrowser() || state.isLocked || !hasVerticalScrollBar()) return;

		const elementToLock = document.documentElement;

		// == Store original styles
		const computedStyle = globalThis.getComputedStyle(elementToLock);

		state.originalOverflow = elementToLock.style.overflow || null;
		state.originalPaddingRight = elementToLock.style.paddingRight || null;

		const scrollbarWidth = getScrollbarWidth();
		const existingPaddingRight = Number.parseFloat(computedStyle.paddingRight) || 0;
		const updatedPaddingRight = existingPaddingRight + scrollbarWidth;

		elementToLock.style.overflow = "hidden";
		elementToLock.style.paddingRight = `${updatedPaddingRight}px`;
		elementToLock.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);

		state.isLocked = true;
	};

	const unlock = () => {
		if (!isBrowser() || !state.isLocked) return;

		const elementToLock = document.documentElement;

		// == Restore original styles
		state.originalOverflow === null ?
			elementToLock.style.removeProperty("overflow")
		:	(elementToLock.style.overflow = state.originalOverflow);

		state.originalPaddingRight === null ?
			elementToLock.style.removeProperty("padding-right")
		:	(elementToLock.style.paddingRight = state.originalPaddingRight);

		elementToLock.style.removeProperty("--scrollbar-width");

		// == Reset State
		state.isLocked = false;
		state.originalOverflow = null;
		state.originalPaddingRight = null;
	};

	return { isLocked, lock, unlock };
};

const scrollLockApi = createScrollLock();

export const lockScroll = (options: LockScrollOptions) => {
	const { lock } = options;

	lock ? scrollLockApi.lock() : scrollLockApi.unlock();
};
