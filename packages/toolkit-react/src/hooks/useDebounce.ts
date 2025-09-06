import { debounce } from "@zayne-labs/toolkit-core";
import type { CallbackFn } from "@zayne-labs/toolkit-type-helpers";
import { useMemo, useState } from "react";
import { useUnmountEffect } from "./effects/useUnMountEffect";
import { useCallbackRef } from "./useCallbackRef";

export const useDebouncedFn = <TParams>(callBackFn: CallbackFn<TParams>, delay: number | undefined) => {
	const latestCallback = useCallbackRef(callBackFn);

	const debouncedFn = useMemo(() => debounce(latestCallback, delay), [delay, latestCallback]);

	useUnmountEffect(() => {
		debouncedFn.cancel();
		debouncedFn.cancelMaxWait();
	});

	return debouncedFn;
};

export const useDebouncedState = <TValue>(defaultValue: TValue, delay: number | undefined) => {
	const [value, setValue] = useState(defaultValue);

	const setDebouncedValue = useMemo(() => debounce(setValue, delay), [delay]);

	useUnmountEffect(() => {
		setDebouncedValue.cancel();
		setDebouncedValue.cancelMaxWait();
	});

	return [value, setDebouncedValue, setValue] as const;
};
