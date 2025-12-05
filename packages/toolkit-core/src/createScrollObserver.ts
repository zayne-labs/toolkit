import { isBrowser } from "./constants";

export type ScrollObserverOptions = IntersectionObserverInit & {
	onIntersectionChange?: (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void;
};

export const createScrollObserver = <TElement extends HTMLElement>(
	options: ScrollObserverOptions = {}
) => {
	const { rootMargin = "10px 0px 0px 0px", ...restOfOptions } = options;

	const elementObserver =
		isBrowser() ?
			new IntersectionObserver(
				(entries, observer) => {
					for (const entry of entries) {
						options.onIntersectionChange?.(entry, observer);
					}
				},
				{ rootMargin, ...restOfOptions }
			)
		:	null;

	const handleElementObservation = (element: TElement | null) => {
		const scrollWatcher = document.createElement("span");
		scrollWatcher.dataset.scrollWatcher = "";

		element?.before(scrollWatcher);

		if (!elementObserver) return;

		elementObserver.observe(scrollWatcher);

		const cleanupFn = () => {
			scrollWatcher.remove();
			elementObserver.disconnect();
		};

		return cleanupFn;
	};

	return { elementObserver, handleElementObservation };
};
