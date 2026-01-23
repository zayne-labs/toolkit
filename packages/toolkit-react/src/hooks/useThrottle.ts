import { throttleByFrame, throttleByTime, throttleByTimeout } from "@zayne-labs/toolkit-core";
import type { CallbackFn } from "@zayne-labs/toolkit-type-helpers";
import { useMemo } from "react";
import { useUnmountEffect } from "./effects";
import { useCallbackRef } from "./useCallbackRef";
import { useConstant } from "./useConstant";

export const useThrottleByTimeout = <TParams>(callbackFn: CallbackFn<TParams>, delay: number) => {
	const latestCallback = useCallbackRef(callbackFn);

	const throttledCallback = useMemo(
		() => throttleByTimeout(latestCallback, delay),
		[delay, latestCallback]
	);

	useUnmountEffect(() => throttledCallback.cancelTimeout());

	return throttledCallback;
};

export const useThrottleByTimer = <TParams>(callbackFn: CallbackFn<TParams>, delay: number) => {
	const latestCallback = useCallbackRef(callbackFn);

	const throttledCallback = useMemo(() => throttleByTime(latestCallback, delay), [delay, latestCallback]);

	return throttledCallback;
};

export const useThrottleByFrame = <TParams>(callbackFn: CallbackFn<TParams>) => {
	const latestCallback = useCallbackRef(callbackFn);

	const throttledCallback = useConstant(() => throttleByFrame(latestCallback));

	useUnmountEffect(() => throttledCallback.cancelAnimation());

	return throttledCallback;
};
