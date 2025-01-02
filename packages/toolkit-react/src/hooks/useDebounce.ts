import { debounce } from "@zayne-labs/toolkit-core";
import type { CallbackFn } from "@zayne-labs/toolkit-type-helpers";
import { useState } from "react";
import { useOnUnmountEffect } from "./effects/useOnUnMountEffect";
import { useCallbackRef } from "./useCallbackRef";
import { useConstant } from "./useConstant";

export const useDebouncedFn = <TParams>(callBackFn: CallbackFn<TParams>, delay: number | undefined) => {
	const latestCallback = useCallbackRef(callBackFn);

	const debouncedFn = useConstant(() => debounce(latestCallback, delay));

	useOnUnmountEffect(() => {
		debouncedFn.cancel();
		debouncedFn.cancelMaxWait();
	});

	return debouncedFn;
};

export const useDebouncedState = <TValue>(defaultValue: TValue, delay: number | undefined) => {
	const [value, setValue] = useState(defaultValue);

	const setDebouncedValue = useConstant(() => debounce(setValue, delay));

	useOnUnmountEffect(() => {
		setDebouncedValue.cancel();
		setDebouncedValue.cancelMaxWait();
	});

	return [value, setDebouncedValue, setValue] as const;
};
