type LockScrollOptions = {
	lock: boolean;
};

export const getScrollbarWidth = () => {
	// == Store the initial overflow style
	const initialOverflowValue = document.documentElement.style.overflow;

	// == Get width without scrollbar
	document.documentElement.style.overflow = "hidden";
	const widthWithoutScrollbar = document.documentElement.clientWidth;

	// == Get width with scrollbar
	document.documentElement.style.overflow = "scroll";
	const widthWithScrollbar = document.documentElement.clientWidth;

	// == Restore the original overflow
	document.documentElement.style.overflow = initialOverflowValue;

	return widthWithoutScrollbar - widthWithScrollbar;
};

export const checkHasVerticalScrollBar = (element = document.documentElement) => {
	// Check if content is actually larger than the container
	const hasScrollableContent = element.scrollHeight > element.clientHeight;

	// Get all computed overflow styles that could affect scrolling
	const computedStyle = globalThis.getComputedStyle(element);
	const bodyComputedStyle = globalThis.getComputedStyle(document.body);

	// Check if overflow is explicitly prevented
	const isOverflowHidden =
		computedStyle.overflowY === "hidden"
		|| bodyComputedStyle.overflowY === "hidden"
		|| computedStyle.overflow === "hidden"
		|| bodyComputedStyle.overflow === "hidden";

	return hasScrollableContent && !isOverflowHidden;
};

export const lockScroll = (options: LockScrollOptions) => {
	const { lock } = options;

	if (!lock) {
		document.body.style.removeProperty("--overflow-y");
		document.body.style.removeProperty("--scrollbar-padding");
		return;
	}

	const hasVerticalScrollBar = checkHasVerticalScrollBar();

	if (!hasVerticalScrollBar) return;

	const scrollbarWidth = getScrollbarWidth();

	document.body.style.setProperty("--overflow-y", "hidden");

	document.body.style.setProperty("--scrollbar-padding", `${scrollbarWidth}px`);
};
