import { shallowCompare } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useRef } from "react";

export const useShallowComparedSelector = <TState, TResult>(selector: SelectorFn<TState, TResult>) => {
	const prevStateRef = useRef<TResult>(undefined as never);

	const shallowSelector = (state: TState) => {
		const nextState = selector(state);

		if (shallowCompare(prevStateRef.current, nextState)) {
			return prevStateRef.current;
		}

		return (prevStateRef.current = nextState);
	};

	return shallowSelector;
};

export const useShallowComparedValue = <TValue>(value: TValue) => {
	const prevValueRef = useRef<TValue>(value);

	if (shallowCompare(prevValueRef.current, value)) {
		return prevValueRef.current;
	}

	return (prevValueRef.current = value);
};
