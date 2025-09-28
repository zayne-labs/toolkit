import type { AnyFunction } from "@zayne-labs/toolkit-type-helpers";
import { useCallback, useInsertionEffect, useRef } from "react";

/**
 * Returns a stable function that always points to the latest version of the callback function.
 * @param callbackFn - The function to reference
 * @returns a stable function that always points to the latest version of the callback function
 */

const useCallbackRef = <TCallback = AnyFunction>(callbackFn: TCallback | undefined) => {
	const callbackRef = useRef(callbackFn);

	useInsertionEffect(() => {
		// == Doing this instead updating it during render cuz according to Dan Abramov, render should be pure
		callbackRef.current = callbackFn;
	}, [callbackFn]);

	const savedCallback = useCallback(
		// eslint-disable-next-line ts-eslint/no-unnecessary-condition -- callbackRef.current can be null in some cases
		(...params: unknown[]) => (callbackRef.current as AnyFunction)?.(...params) as unknown,
		[]
	);

	return savedCallback as TCallback;
};

export { useCallbackRef };
