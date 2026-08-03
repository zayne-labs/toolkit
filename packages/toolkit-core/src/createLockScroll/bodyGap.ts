import { isBrowser } from "../constants";
import type { ScrollLockGapMode } from "./types";

type BodyStyleSnapshot = {
	marginRight: string;
	overflow: string;
	paddingRight: string;
	position: string;
};

export type BodyGapLockOptions = {
	gapMode: ScrollLockGapMode;
	noRelative: boolean;
};

export type BodyGapLockController = {
	release: () => void;
	update: (options: BodyGapLockOptions) => void;
};

const activeLocks = new Map<symbol, BodyGapLockOptions>();
let snapshot: BodyStyleSnapshot | null = null;

export const getScrollbarGap = () => {
	if (!isBrowser()) return 0;

	return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
};

export const hasDocumentVerticalScrollbar = () => {
	if (!isBrowser()) return false;

	const root = document.documentElement;
	const body = document.body;
	const rootStyle = globalThis.getComputedStyle(root);
	const bodyStyle = globalThis.getComputedStyle(body);

	const overflowIsHidden =
		rootStyle.overflow === "hidden"
		|| rootStyle.overflowY === "hidden"
		|| bodyStyle.overflow === "hidden"
		|| bodyStyle.overflowY === "hidden";

	return root.scrollHeight > root.clientHeight && !overflowIsHidden;
};

const restoreBodySnapshot = () => {
	if (!isBrowser() || snapshot === null) return;

	const { body } = document;

	body.style.overflow = snapshot.overflow;
	body.style.paddingRight = snapshot.paddingRight;
	body.style.marginRight = snapshot.marginRight;
	body.style.position = snapshot.position;
};

const applyActiveBodyGapLock = () => {
	if (!isBrowser() || snapshot === null || activeLocks.size === 0) return;

	restoreBodySnapshot();

	const options = [...activeLocks.values()].at(-1);

	if (!options) return;

	const { gapMode, noRelative } = options;
	const { body } = document;
	const computedStyle = globalThis.getComputedStyle(body);
	const scrollbarGap = getScrollbarGap();
	const shouldCompensateScrollbarGap = scrollbarGap > 0 && hasDocumentVerticalScrollbar();

	body.style.overflow = "hidden";

	if (!noRelative && (!computedStyle.position || computedStyle.position === "static")) {
		body.style.position = "relative";
	}

	if (shouldCompensateScrollbarGap) {
		const propertyName = gapMode === "padding" ? "paddingRight" : "marginRight";
		const currentGapValue = Number.parseFloat(computedStyle[propertyName]) || 0;

		body.style[propertyName] = `${currentGapValue + scrollbarGap}px`;
	}
};

export const acquireBodyGapLock = (initialOptions: BodyGapLockOptions): BodyGapLockController => {
	const id = Symbol("bodyGapLock");
	let isReleased = false;

	if (isBrowser()) {
		if (activeLocks.size === 0) {
			const { body } = document;

			snapshot = {
				marginRight: body.style.marginRight,
				overflow: body.style.overflow,
				paddingRight: body.style.paddingRight,
				position: body.style.position,
			};
		}

		activeLocks.set(id, initialOptions);
		applyActiveBodyGapLock();
	}

	return {
		release: () => {
			if (!isBrowser() || isReleased) return;

			isReleased = true;
			activeLocks.delete(id);

			if (activeLocks.size > 0) {
				applyActiveBodyGapLock();
				return;
			}

			restoreBodySnapshot();
			snapshot = null;
		},
		update: (options) => {
			if (!isBrowser() || isReleased || !activeLocks.has(id)) return;

			activeLocks.set(id, options);
			applyActiveBodyGapLock();
		},
	};
};

export const getBodyGapLockCount = () => activeLocks.size;
