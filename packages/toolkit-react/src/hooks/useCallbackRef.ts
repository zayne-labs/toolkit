import type { AnyFunction } from "@zayne-labs/toolkit-type-helpers";
import { useCallback, useInsertionEffect, useRef } from "react";

/**
 * @description
 * - Returns a stable function that always points to the latest version of the callback function.
 * - This is only is the callback passed is not null or undefined.
 */

const useCallbackRef = <TCallback = AnyFunction>(callbackFn: TCallback): TCallback => {
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

	const callbackOrSavedCallback = callbackFn ? (savedCallback as TCallback) : callbackFn;

	return callbackOrSavedCallback;
};

export { useCallbackRef };
