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

		// == Store original styles
		const computedStyle = globalThis.getComputedStyle(document.body);

		state.originalOverflow = document.body.style.overflow || null;
		state.originalPaddingRight = document.body.style.paddingRight || null;

		const scrollbarWidth = getScrollbarWidth();
		const existingPaddingRight = Number(computedStyle.paddingRight || 0);
		const updatedPaddingRight = existingPaddingRight + scrollbarWidth;

		// == Apply scroll lock
		document.body.style.overflow = "hidden";
		document.body.style.paddingRight = `${updatedPaddingRight}px`;

		state.isLocked = true;
	};

	const unlock = () => {
		if (!isBrowser() || !state.isLocked) return;

		// == Restore original styles
		state.originalOverflow === null ?
			document.body.style.removeProperty("overflow")
		:	(document.body.style.overflow = state.originalOverflow);

		state.originalPaddingRight === null ?
			document.body.style.removeProperty("padding-right")
		:	(document.body.style.paddingRight = state.originalPaddingRight);

		// == Reset State
		state.isLocked = false;
		state.originalOverflow = null;
		state.originalPaddingRight = null;
	};

	return { isLocked, lock, unlock };
};

export const lockScroll = (options: LockScrollOptions) => {
	const { lock } = options;

	const scrollLockApi = createScrollLock();

	lock ? scrollLockApi.lock() : scrollLockApi.unlock();
};
