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

export const checkHasVerticalScrollBar = () => {
	const element = document.documentElement;

	let hasVerticalScrollBar = element.scrollTop > 0;

	// == In case scrollTop is zero, set it to 1 and check again to be certain of the scrollbar absence, before restoring the original scrollTop
	if (!hasVerticalScrollBar) {
		element.scrollTop = 1;
		hasVerticalScrollBar = element.scrollTop > 0;
		element.scrollTop = 0;
	}

	return hasVerticalScrollBar;
};

export const lockScroll = (options: LockScrollOptions) => {
	const { lock } = options;

	const hasVerticalScrollBar = checkHasVerticalScrollBar();

	if (!hasVerticalScrollBar) return;

	if (!lock) {
		document.body.style.setProperty("--overflow-y", null);
		document.body.style.setProperty("--scrollbar-padding", null);
		return;
	}

	const scrollbarWidth = getScrollbarWidth();

	document.body.style.setProperty("--overflow-y", "hidden");

	document.body.style.setProperty("--scrollbar-padding", `${scrollbarWidth}px`);
};
