import { throttleByFrame, throttleBySetTimeout, throttleByTime } from "@zayne-labs/toolkit-core";
import type { CallbackFn } from "@zayne-labs/toolkit-type-helpers";
import { useUnmountEffect } from "./effects";
import { useCallbackRef } from "./useCallbackRef";
import { useConstant } from "./useConstant";

export const useThrottleBySetTimeout = <TParams>(callbackFn: CallbackFn<TParams>, delay: number) => {
	const latestCallback = useCallbackRef(callbackFn);

	const throttledCallback = useConstant(() => throttleBySetTimeout(latestCallback, delay));

	useUnmountEffect(() => throttledCallback.cancelTimeout());

	return throttledCallback;
};

export const useThrottleByTimer = <TParams>(callbackFn: CallbackFn<TParams>, delay: number) => {
	const latestCallback = useCallbackRef(callbackFn);

	const throttledCallback = useConstant(() => throttleByTime(latestCallback, delay));

	return throttledCallback;
};

export const useThrottleByFrame = <TParams>(callbackFn: CallbackFn<TParams>) => {
	const latestCallback = useCallbackRef(callbackFn);

	const throttledCallback = useConstant(() => throttleByFrame(latestCallback));

	useUnmountEffect(() => throttledCallback.cancelAnimation());

	return throttledCallback;
};
