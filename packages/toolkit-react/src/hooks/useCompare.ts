import { deepCompare, shallowCompare } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useInsertionEffect, useRef } from "react";
import { useCallbackRef } from "./useCallbackRef";

type UseCompareSelectorOptions = {
	type?: "deep" | "shallow";
};

export const useCompareSelector = <TState, TResult>(
	selector: SelectorFn<TState, TResult> | undefined,
	options: UseCompareSelectorOptions = {}
) => {
	const { type = "shallow" } = options;

	const prevStateRef = useRef<TResult>(undefined as never);

	const compareFn = type === "shallow" ? shallowCompare : deepCompare;

	const shallowSelector = useCallbackRef((state: TState) => {
		const nextState = selector?.(state);

		if (!nextState) {
			return prevStateRef.current;
		}

		if (compareFn(prevStateRef.current, nextState)) {
			return prevStateRef.current;
		}

		return (prevStateRef.current = nextState);
	});

	return shallowSelector;
};

export const useCompareValue = <TValue>(value: TValue, options: UseCompareSelectorOptions = {}) => {
	const { type = "shallow" } = options;

	const prevValueRef = useRef<TValue>(value);

	const compareFn = type === "shallow" ? shallowCompare : deepCompare;

	useInsertionEffect(() => {
		if (compareFn(prevValueRef.current, value)) return;

		prevValueRef.current = value;
	});

	// eslint-disable-next-line react-hooks/refs -- Allow this for convenience
	return prevValueRef.current;
};
