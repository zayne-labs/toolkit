import { onClickOutside, toArray } from "@zayne-labs/toolkit-core";
import { useEffect, useRef } from "react";
import { useCallbackRef } from "./useCallbackRef";

type UseClickOutsideOptions<TElement extends HTMLElement> = {
	enabled?: boolean;
	onClick: (event: MouseEvent | TouchEvent) => void;
	ref?: Array<React.RefObject<TElement>> | React.RefObject<TElement>;
};

const useClickOutside = <TElement extends HTMLElement>(options: UseClickOutsideOptions<TElement>) => {
	const innerRef = useRef<TElement>(null);

	const { enabled = true, onClick, ref: refOrRefArray = innerRef } = options;

	const savedOnClick = useCallbackRef(onClick);

	useEffect(() => {
		if (!enabled) return;

		const elementArray = toArray(refOrRefArray).map((ref) => ref.current);

		const cleanup = onClickOutside(elementArray, savedOnClick);

		return () => cleanup();
	}, [enabled, refOrRefArray, savedOnClick]);

	return {
		ref: innerRef,
	};
};

export { useClickOutside };
