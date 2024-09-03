import type { CallbackFn } from "@/type-helpers";
import { useCallback, useLayoutEffect, useRef } from "react";

function useCallbackRef<TParams, TResult>(
	callbackFn: CallbackFn<TParams, TResult>
): (...params: TParams[]) => TResult;

function useCallbackRef<TParams, TResult>(
	callbackFn: CallbackFn<TParams, TResult> | undefined
): (...params: TParams[]) => TResult | undefined;

/**
 * Returns a stable function that always points to the latest version of the callback function.
 * @param callbackFn - The function to reference
 * @returns a stable function that always points to the latest version of the callback function
 */
function useCallbackRef<TParams, TResult>(callbackFn: CallbackFn<TParams, TResult> | undefined) {
	const callbackRef = useRef(callbackFn);

	useLayoutEffect(() => {
		// == Doing this instead updating it during render cuz according to Dan Abramov, render should be pure
		callbackRef.current = callbackFn;
	}, [callbackFn]);

	const savedCallback = useCallback((...params: TParams[]) => callbackRef.current?.(...params), []);

	return savedCallback;
}

export { useCallbackRef };
