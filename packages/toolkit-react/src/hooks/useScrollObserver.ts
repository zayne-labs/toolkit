import { isBrowser } from "@zayne-labs/toolkit-core";
import { useState } from "react";
import type { RefCallback } from "../utils";
import { useCallbackRef } from "./useCallbackRef";
import { useConstant } from "./useConstant";

const useScrollObserver = <TElement extends HTMLElement>(options: IntersectionObserverInit = {}) => {
	const { rootMargin = "10px 0px 0px 0px", ...restOfOptions } = options;

	const [isScrolled, setIsScrolled] = useState(false);

	const elementObserver = useConstant(() => {
		if (!isBrowser()) return;

		return new IntersectionObserver(
			([entry]) => {
				if (!entry) return;
				setIsScrolled(!entry.isIntersecting);
			},
			{ rootMargin, ...restOfOptions }
		);
	});

	const observedElementRef: RefCallback<TElement> = useCallbackRef((element) => {
		const scrollWatcher = document.createElement("span");
		scrollWatcher.dataset.scrollWatcher = "";

		element?.before(scrollWatcher);

		if (!elementObserver) return;

		elementObserver.observe(scrollWatcher);

		const cleanupFn = () => {
			scrollWatcher.remove();
			elementObserver.disconnect();
		};

		// React 18 may not call the cleanup function so we need to call it manually on element unmount
		if (!element) {
			cleanupFn();
			return;
		}

		return cleanupFn;
	});

	return { isScrolled, observedElementRef };
};

export { useScrollObserver };
