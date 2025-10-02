import { shallowCompare } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useInsertionEffect, useRef } from "react";
import { useCallbackRef } from "./useCallbackRef";

export const useShallowCompSelector = <TState, TResult>(
	selector: SelectorFn<TState, TResult> | undefined
) => {
	const prevStateRef = useRef<TResult>(undefined as never);

	const shallowSelector = useCallbackRef((state: TState) => {
		const nextState = selector?.(state);

		if (!nextState) {
			return prevStateRef.current;
		}

		if (shallowCompare(prevStateRef.current, nextState)) {
			return prevStateRef.current;
		}

		return (prevStateRef.current = nextState);
	});

	return shallowSelector;
};

export const useShallowCompValue = <TValue>(value: TValue) => {
	const prevValueRef = useRef<TValue>(value);

	useInsertionEffect(() => {
		if (shallowCompare(prevValueRef.current, value)) return;

		prevValueRef.current = value;
	});

	// eslint-disable-next-line react-hooks/refs -- Allow this for convenience
	return prevValueRef.current;
};
