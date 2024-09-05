import type { AnyFunction } from "@/type-helpers";
import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Returns a stable function that always points to the latest version of the callback function.
 * @param callbackFn - The function to reference
 * @returns a stable function that always points to the latest version of the callback function
 */

const useCallbackRef = <TCallback extends AnyFunction>(callbackFn: TCallback | undefined) => {
	const callbackRef = useRef(callbackFn);

	useLayoutEffect(() => {
		// == Doing this instead updating it during render cuz according to Dan Abramov, render should be pure
		callbackRef.current = callbackFn;
	}, [callbackFn]);

	const savedCallback = useCallback(
		(...params: Parameters<TCallback>) => callbackRef.current?.(...params) as unknown,
		[]
	);

	return savedCallback as TCallback;
};

export { useCallbackRef };
