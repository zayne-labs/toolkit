import { createScrollObserver, type ScrollObserverOptions } from "@zayne-labs/toolkit-core";
import { type RefCallback, useMemo, useState } from "react";
import { useCallbackRef } from "./useCallbackRef";

const useScrollObserver = <TElement extends HTMLElement>(options: ScrollObserverOptions = {}) => {
	const { onIntersection, root, rootMargin = "10px 0px 0px 0px", threshold } = options;

	const [isScrolled, setIsScrolled] = useState(false);

	const savedOnIntersection = useCallbackRef(onIntersection);

	const { handleObservation } = useMemo(() => {
		return createScrollObserver({
			onIntersection: (entry, observer) => {
				const newIsScrolledState = !entry.isIntersecting;

				setIsScrolled(newIsScrolledState);

				// eslint-disable-next-line no-param-reassign -- Mutation is fine here
				(entry.target as HTMLElement).dataset.scrolled = String(newIsScrolledState);

				savedOnIntersection(entry, observer);
			},
			root,
			rootMargin,
			threshold,
		});
	}, [root, rootMargin, savedOnIntersection, threshold]);

	const observedElementRef: RefCallback<TElement> = useCallbackRef((element) => {
		const cleanupFn = handleObservation(element);

		// == React 18 may not call the cleanup function so we need to call it manually on element unmount
		if (!element) {
			cleanupFn?.();
			return;
		}

		return cleanupFn;
	});

	return { isScrolled, observedElementRef };
};

export { useScrollObserver };
