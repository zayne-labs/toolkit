import { shallowCompare } from "@zayne-labs/toolkit-core";
import { useState } from "react";

type UseOnChangeOptions<TValue> = {
	equalityFn?: (previous: TValue, current: TValue) => boolean;
	onValueChange: (currentValue: TValue, previousValue: TValue) => void;
	value: TValue;
};

const useOnChange = <TValue>(options: UseOnChangeOptions<TValue>) => {
	const { equalityFn = shallowCompare, onValueChange, value } = options;

	const [previousValue, setPreviousValue] = useState(value);

	if (equalityFn(previousValue, value)) {
		onValueChange(value, previousValue);
		setPreviousValue(value);
	}
};

export { useOnChange };
