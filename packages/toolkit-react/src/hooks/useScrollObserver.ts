import { createScrollObserver, type ScrollObserverOptions } from "@zayne-labs/toolkit-core";
import { type RefCallback, useMemo, useState } from "react";
import { useCallbackRef } from "./useCallbackRef";

const useScrollObserver = <TElement extends HTMLElement>(options: ScrollObserverOptions = {}) => {
	const { onIntersectionChange, root, rootMargin = "10px 0px 0px 0px", threshold } = options;

	const [isScrolled, setIsScrolled] = useState(false);

	const savedOnIntersectionChange = useCallbackRef(onIntersectionChange);

	const { elementObserver, handleElementObservation } = useMemo(() => {
		return createScrollObserver({
			onIntersectionChange: (entry, observer) => {
				const newIsScrolledState = !entry.isIntersecting;

				setIsScrolled(newIsScrolledState);

				// eslint-disable-next-line no-param-reassign -- Mutation is fine here
				(entry.target as HTMLElement).dataset.scrolled = String(newIsScrolledState);

				savedOnIntersectionChange?.(entry, observer);
			},
			root,
			rootMargin,
			threshold,
		});
	}, [root, rootMargin, savedOnIntersectionChange, threshold]);

	const observedElementRef: RefCallback<TElement> = useCallbackRef((element) => {
		const cleanupFn = handleElementObservation(element);

		// == React 18 may not call the cleanup function so we need to call it manually on element unmount
		if (!element) {
			cleanupFn?.();
			return;
		}

		return cleanupFn;
	});

	return { elementObserver, isScrolled, observedElementRef };
};

export { useScrollObserver };
