"use client";

import { isFunction } from "@zayne-labs/toolkit-type-helpers";
import { useMemo, useState } from "react";
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
	defaultValue?: TValue | (() => TValue) | undefined;
	onChange?: ((value: TValue) => void) | undefined;
	shouldUpdate?: ((prevState: TValue, nextValue: TValue) => boolean) | undefined;
	value?: TValue | undefined;
};

const defaultShouldUpdate = <TValue>(prevState: TValue, nextValue: TValue) => prevState !== nextValue;

/**
 * @description React hook to manage state that can be either controlled or uncontrolled.
 *
 * Behavior:
 * - When `options.value` is provided, the hook operates in controlled mode.
 *   In this mode, `value` always equals `options.value` and `setValue` will
 *   invoke `options.onChange(next)` without mutating internal state.
 * - When `options.value` is not provided, the hook operates in uncontrolled
 *   mode, initializing internal state from `options.defaultValue` and updating
 *   it via `setValue`.
 * - All updates are gated by `options.shouldUpdate(prev, next)` which defaults
 *   to a strict inequality check (`prev !== next`).
 *
 * @param options - Configuration options for the hook.
 * @param options.value - Controlled value. If defined, the state is controlled.
 * @param options.defaultValue - Initial value for the uncontrolled state. Can be a
 * function for lazy initialization or a direct value.
 * @param options.onChange - Callback fired when a new value is requested. In
 * controlled mode, this is invoked instead of updating internal state. In
 * uncontrolled mode, it is called after the internal state updates.
 * @param options.shouldUpdate - Predicate that decides whether to commit an
 * update given `prevState` and `nextValue`. Defaults to `(prev !== next)`.
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
	const {
		defaultValue,
		onChange: onChangeProp,
		shouldUpdate = defaultShouldUpdate,
		value: valueProp,
	} = options;

	const savedOnchangeProp = useCallbackRef(onChangeProp);
	const savedShouldUpdate = useCallbackRef(shouldUpdate);

	const [unControlledState, setUncontrolledState] = useState(defaultValue as TValue);

	const isControlled = valueProp !== undefined;

	const selectedValue = isControlled ? valueProp : unControlledState;

	const setValue: StateSetter<TValue> = useCallbackRef((newValue) => {
		const nextValue = isFunction(newValue) ? newValue(selectedValue) : newValue;

		if (!savedShouldUpdate(selectedValue, nextValue)) return;

		if (!isControlled) {
			setUncontrolledState(nextValue);
		}

		// == Always call onChangeProp even if the value is uncontrolled, just in case the onChangeProp is used to perform side effects without necessarily updating the controlled valueProp
		savedOnchangeProp(nextValue);
	});

	return [selectedValue, setValue] as [value: typeof selectedValue, setValue: typeof setValue];
};
