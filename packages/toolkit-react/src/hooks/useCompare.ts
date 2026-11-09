import { deepCompare, shallowCompare, type CompareFnOptions } from "@zayne-labs/toolkit-core";
import type { SelectorFn } from "@zayne-labs/toolkit-type-helpers";
import { useRef } from "react";

type UseCompareSelectorOptions = {
	compareFnOptions?: CompareFnOptions;
	type?: "deep" | "shallow";
};

export const useCompareSelector = <
	TState = never,
	TResult = unknown,
	TSelector extends SelectorFn<TState, TResult> | undefined = undefined,
>(
	selector: TSelector,
	options: UseCompareSelectorOptions = {}
): TSelector => {
	const { compareFnOptions, type = "shallow" } = options;

	const prevStateRef = useRef<TResult>(undefined as never);

	if (!selector) {
		return selector as never;
	}

	const compareFn = type === "shallow" ? shallowCompare : deepCompare;

	const compareSelector = (state: TState): TResult => {
		const nextState = selector(state);

		if (!nextState) {
			return prevStateRef.current;
		}

		if (compareFn(prevStateRef.current, nextState, compareFnOptions)) {
			return prevStateRef.current;
		}

		return (prevStateRef.current = nextState);
	};

	return compareSelector as never;
};

/**
 * @description Returns the same reference until `value` actually changes (by shallow or deep compare).
 * Useful for objects or arrays used in dependency arrays.
 */
export const useCompareValue = <TValue>(value: TValue, options: UseCompareSelectorOptions = {}) => {
	const { compareFnOptions, type = "shallow" } = options;

	const stableValueRef = useRef(value);

	const compareFn = type === "shallow" ? shallowCompare : deepCompare;

	// == Compare during render so changes show up immediately, not one render late
	// eslint-disable-next-line react/refs -- Safe: the ref only ever holds a value equal to the latest one
	if (!compareFn(stableValueRef.current, value, compareFnOptions)) {
		// eslint-disable-next-line react/refs -- Safe, see above
		stableValueRef.current = value;
	}

	// eslint-disable-next-line react/refs -- Safe, see above
	return stableValueRef.current;
};
