import { useCallback, useState } from "react";

type InitialState = boolean | (() => boolean);

const useToggle = (initialValue: InitialState = false) => {
	const [value, setValue] = useState(initialValue);

	const toggleValue = useCallback(<TValue>(newValue?: TValue) => {
		if (typeof newValue === "boolean") {
			setValue(newValue);
			return;
		}

		setValue((prev) => !prev);
	}, []);

	return [value, toggleValue] as [value: typeof value, toggleValue: typeof toggleValue];
};

export { useToggle };
