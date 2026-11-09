import { deepCompare, shallowCompare, type CompareFnOptions } from "@zayne-labs/toolkit-core";
import { useState } from "react";

type UseOnChangeOptions<TValue> = {
	/**
	 * Options passed to the shallow or deep compare function
	 */
	compareFnOptions?: CompareFnOptions;
	/**
	 * Custom function to decide if the value changed. Takes priority over `type`.
	 */
	equalityFn?: (previous: TValue, current: TValue) => boolean;
	onValueChange: (currentValue: TValue, previousValue: TValue) => void;
	/**
	 * How to compare the previous and current value
	 * @default "shallow"
	 */
	type?: "deep" | "shallow";
	value: TValue;
};

/**
 * @description Calls `onValueChange` during render when `value` changes.
 * Use it to update state when a prop changes, instead of doing it in an effect.
 */
const useOnChange = <TValue>(options: UseOnChangeOptions<TValue>) => {
	const {
		compareFnOptions,
		equalityFn: customEqualityFn,
		onValueChange,
		type = "shallow",
		value,
	} = options;

	const [previousValue, setPreviousValue] = useState(value);

	const compareFn = type === "shallow" ? shallowCompare : deepCompare;

	const isEqual =
		customEqualityFn ?
			customEqualityFn(previousValue, value)
		:	compareFn(previousValue, value, compareFnOptions);

	if (!isEqual) {
		onValueChange(value, previousValue);
		setPreviousValue(value);
	}
};

export { useOnChange };
