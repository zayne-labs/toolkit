import { deepCompare, shallowCompare, type CompareFnOptions } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useInsertionEffect, useRef } from "react";

type UseCompareSelectorOptions = {
	compareFnOptions?: CompareFnOptions;
	type?: "deep" | "shallow";
};

export const useCompareSelector = <TState, TResult>(
	selector: SelectorFn<TState, TResult> | undefined,
	options: UseCompareSelectorOptions = {}
) => {
	const { compareFnOptions, type = "shallow" } = options;

	const prevStateRef = useRef<TResult>(undefined as never);

	const compareFn = type === "shallow" ? shallowCompare : deepCompare;

	const compareSelector = (state: TState): TResult => {
		const nextState = selector?.(state);

		if (!nextState) {
			return prevStateRef.current;
		}

		if (compareFn(prevStateRef.current, nextState, compareFnOptions)) {
			return prevStateRef.current;
		}

		return (prevStateRef.current = nextState);
	};

	return compareSelector;
};

export const useCompareValue = <TValue>(value: TValue, options: UseCompareSelectorOptions = {}) => {
	const { compareFnOptions, type = "shallow" } = options;

	const prevValueRef = useRef<TValue>(value);

	const compareFn = type === "shallow" ? shallowCompare : deepCompare;

	useInsertionEffect(() => {
		if (compareFn(prevValueRef.current, value, compareFnOptions)) return;

		prevValueRef.current = value;
	});

	// eslint-disable-next-line react-hooks/refs -- Allow this for convenience
	return prevValueRef.current;
};
