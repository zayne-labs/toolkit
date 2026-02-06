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

export const hasVerticalScrollBar = (element = document.documentElement) => {
	// == Check if content is actually larger than the container
	const hasScrollableContent = element.scrollHeight > element.clientHeight;

	// == Get all computed overflow styles that could affect scrolling
	const elementComputedStyle = globalThis.getComputedStyle(element);
	const bodyComputedStyle = globalThis.getComputedStyle(document.body);

	// == Check if overflow is explicitly prevented
	const isOverflowHidden =
		elementComputedStyle.overflowY === "hidden"
		|| bodyComputedStyle.overflowY === "hidden"
		|| elementComputedStyle.overflow === "hidden"
		|| bodyComputedStyle.overflow === "hidden";

	return hasScrollableContent && !isOverflowHidden;
};
