import { shallowCompare } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useRef } from "react";
import { useCallbackRef } from "./useCallbackRef";

export const useShallowCompSelector = <TState, TResult>(selector: SelectorFn<TState, TResult>) => {
	const prevStateRef = useRef<TResult>(undefined as never);

	const shallowSelector = useCallbackRef((state: TState) => {
		const nextState = selector(state);

		if (shallowCompare(prevStateRef.current, nextState)) {
			return prevStateRef.current;
		}

		return (prevStateRef.current = nextState);
	});

	return shallowSelector;
};

export const useShallowCompValue = <TValue>(value: TValue) => {
	const prevValueRef = useRef<TValue>(value);

	if (shallowCompare(prevValueRef.current, value)) {
		return prevValueRef.current;
	}

	return (prevValueRef.current = value);
};
