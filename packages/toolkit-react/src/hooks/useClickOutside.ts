import { onClickOutside, toArray } from "@zayne-labs/toolkit-core";
import { useEffect } from "react";
import { useCallbackRef } from "./useCallbackRef";

type UseClickOutsideOptions = {
	enabled?: boolean;
};

const useClickOutside = <TElement extends HTMLElement>(
	refOrRefArray: Array<React.RefObject<TElement>> | React.RefObject<TElement>,
	callback: (event: MouseEvent | TouchEvent) => void,
	options?: UseClickOutsideOptions
) => {
	const { enabled = true } = options ?? {};

	const savedCallback = useCallbackRef(callback);

	useEffect(() => {
		if (!enabled) return;

		const controller = new AbortController();

		const refArray = toArray(refOrRefArray).map((ref) => ref.current);

		onClickOutside(refArray, savedCallback, { signal: controller.signal });

		return () => {
			controller.abort();
		};
	}, [enabled, refOrRefArray, savedCallback]);
};

export { useClickOutside };
