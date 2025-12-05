"use client";

import type { StateSetter } from "@/utils";
import { isFunction } from "@zayne-labs/toolkit-type-helpers";
import { useCallback, useMemo, useState } from "react";
import { useCallbackRef } from "./useCallbackRef";

type UseControllablePropOptions<TProp> = {
	prop: TProp | undefined;
	state: TProp;
};

/**
 * @description Given a prop value and state value, the useControllableProp hook is used to determine whether a component is controlled or uncontrolled, and also returns the computed value.
 */
export const useControllableProp = <TProp>(options: UseControllablePropOptions<TProp>) => {
	const { prop, state } = options;

	const isControlled = prop !== undefined;

	const value = isControlled ? prop : state;

	const result = useMemo<[isControlled: typeof isControlled, value: typeof value]>(
		() => [isControlled, value],
		[isControlled, value]
	);

	return result;
};

type UseControllableStateOptions<TValue> = {
	defaultValue?: TValue | (() => TValue);
	equalityFn?: (prevState: TValue, nextValue: TValue) => boolean;
	onChange?: (value: TValue) => void;
	value?: TValue;
};

/**
 * @description React hook to manage state that can be either controlled or uncontrolled.
 * - When `options.value` is provided, the hook operates in controlled mode.
 *   In this mode, `value` always equals `options.value` and `setValue` will
 *   invoke `options.onChange(next)` without mutating internal state.
 * - When `options.value` is not provided, the hook operates in uncontrolled
 *   mode, initializing internal state from `options.defaultValue` and updating
 *   it via `setValue`.
 * - All updates are gated by `options.equalityFn(prev, next)` which defaults
 *   to `Object.is`.
 *
 * @param options - Configuration options for the hook.
 * @param options.value - Controlled value. If defined, the state is controlled.
 * @param options.defaultValue - Initial value for the uncontrolled state. Can be a
 * function for lazy initialization or a direct value.
 * @param options.onChange - Callback fired when a new value is requested. In
 * controlled mode, this is invoked instead of updating internal state. In
 * uncontrolled mode, it is called after the internal state updates.
 * @param options.equalityFn - Predicate that decides whether to commit an
 * update given `prevState` and `nextValue`. If the values are equal, the update
 * is skipped. Defaults to `Object.is`.
 * @returns A tuple `[value, setValue]`  just like React.useState.
 *
 * @example
 * // Uncontrolled usage
 * const [value, setValue] = useControllableState({ defaultValue: 0 });
 *
 * @example
 * // Controlled usage
 * const [value, setValue] = useControllableState({
 *   value: props.value,
 *   onChange: props.onChange,
 * });
 */
export const useControllableState = <TValue>(options: UseControllableStateOptions<TValue>) => {
	const { defaultValue, equalityFn = Object.is, onChange: onChangeProp, value: valueProp } = options;

	const stableOnchangeProp = useCallbackRef(onChangeProp);
	const stableEqualityFn = useCallbackRef(equalityFn);

	const [unControlledState, setUncontrolledState] = useState(defaultValue as TValue);

	const isControlled = valueProp !== undefined;

	const currentValue = isControlled ? valueProp : unControlledState;

	const setValue: StateSetter<TValue> = useCallback(
		(newValue) => {
			const nextValue = isFunction(newValue) ? newValue(currentValue) : newValue;

			if (stableEqualityFn(currentValue, nextValue)) return;

			// == Always call onChangeProp whether the value is controlled or uncontrolled,
			// == just in case the onChangeProp is used to perform side effects
			// == without necessarily updating the controlled valueProp
			stableOnchangeProp?.(nextValue);

			if (isControlled) return;

			setUncontrolledState(nextValue);
		},
		[isControlled, stableOnchangeProp, stableEqualityFn, currentValue]
	);

	return [currentValue, setValue] as [value: typeof currentValue, setValue: typeof setValue];
};
