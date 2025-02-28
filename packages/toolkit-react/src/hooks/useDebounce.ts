import { debounce } from "@zayne-labs/toolkit-core";
import type { CallbackFn } from "@zayne-labs/toolkit-type-helpers";
import { useState } from "react";
import { useUnmountEffect } from "./effects/useUnMountEffect";
import { useCallbackRef } from "./useCallbackRef";
import { useConstant } from "./useConstant";

export const useDebouncedFn = <TParams>(callBackFn: CallbackFn<TParams>, delay: number | undefined) => {
	const latestCallback = useCallbackRef(callBackFn);

	const debouncedFn = useConstant(() => debounce(latestCallback, delay));

	useUnmountEffect(() => {
		debouncedFn.cancel();
		debouncedFn.cancelMaxWait();
	});

	return debouncedFn;
};

export const useDebouncedState = <TValue>(defaultValue: TValue, delay: number | undefined) => {
	const [value, setValue] = useState(defaultValue);

	const setDebouncedValue = useConstant(() => debounce(setValue, delay));

	useUnmountEffect(() => {
		setDebouncedValue.cancel();
		setDebouncedValue.cancelMaxWait();
	});

	return [value, setDebouncedValue, setValue] as const;
};
