"use client";

import { isFunction } from "@zayne-labs/toolkit-type-helpers";
import { useCallback, useMemo, useState } from "react";
import type { StateSetter } from "@/utils";
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
	defaultProp?: TValue | (() => TValue);
	isControlled?: boolean;
	onChange?: StateSetter<TValue>;
	prop?: TValue;
};

/**
 * @description React hook to manage state that can be either controlled or uncontrolled.
 * - When `options.prop` is provided, the hook operates in controlled mode.
 *   In this mode, `value` always equals `options.prop` and `setState` will
 *   invoke `options.onChange(next)` without mutating internal state.
 * - When `options.prop` is not provided, the hook operates in uncontrolled
 *   mode, initializing internal state from `options.defaultProp` and updating
 *   it via `setState`.
 *
 * @param options - Configuration options for the hook.
 * @param options.prop - Controlled value. If defined, the state is controlled.
 * @param options.defaultProp - Initial value for the uncontrolled state. Can be a
 * function for lazy initialization or a direct value.
 * @param options.onChange - Callback fired when a new value is requested. In
 * controlled mode, this is invoked instead of updating internal state. In
 * uncontrolled mode, it is called after the internal state updates.
 * @returns A tuple `[state, setState]`  just like React.useState.
 *
 * @example
 * // Uncontrolled usage
 * const [state, setState] = useControllableState({ defaultProp: 0 });
 *
 * @example
 * // Controlled usage
 * const [state, setState] = useControllableState({
 *   prop: props.value,
 *   onChange: props.onChange,
 * });
 */
export const useControllableState = <TProp>(options: UseControllableStateOptions<TProp>) => {
	const { defaultProp, onChange, prop } = options;

	const isControlled = options.isControlled ?? prop !== undefined;

	const stableOnchange = useCallbackRef(onChange);

	const [unControlledState, setUncontrolledState] = useState(defaultProp as TProp);

	const state = (isControlled ? prop : unControlledState) as TProp;

	const setState: StateSetter<TProp> = useCallback(
		(newValue) => {
			const nextValue = isFunction(newValue) ? newValue(state) : newValue;

			if (isControlled) {
				stableOnchange?.(nextValue);
			} else {
				setUncontrolledState(nextValue);
				stableOnchange?.(nextValue);
			}
		},
		[state, isControlled, stableOnchange]
	);

	return [state, setState] as [state: typeof state, setState: typeof setState];
};
