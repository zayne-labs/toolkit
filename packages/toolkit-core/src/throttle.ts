import type { CallbackFn } from "@zayne-labs/toolkit-type-helpers";

export const throttleBySetTimeout = <TParams>(callbackFn: CallbackFn<TParams>, delay: number) => {
	let timeoutId: number | null = null;

	const throttledCallback = (...params: TParams[]) => {
		if (timeoutId !== null) return;

		timeoutId = setTimeout(() => {
			callbackFn(...params);
			timeoutId = null;
		}, delay) as never;
	};

	throttledCallback.cancelTimeout = () => {
		timeoutId && clearTimeout(timeoutId);
	};

	return throttledCallback;
};

export const throttleByTime = <TParams>(callbackFn: CallbackFn<TParams>, delay: number) => {
	let lastCallTime = 0;

	const throttledCallback = (...params: TParams[]) => {
		const elapsedTime = Date.now() - lastCallTime;

		if (elapsedTime >= delay) {
			callbackFn(...params);
			lastCallTime = Date.now();
		}
	};

	return throttledCallback;
};

export const throttleByFrame = <TParams>(callbackFn: CallbackFn<TParams>) => {
	let animationFrameId: number | null = null;

	const throttledCallback = (...params: TParams[]) => {
		if (animationFrameId !== null) return;

		animationFrameId = requestAnimationFrame(() => {
			callbackFn(...params);
			animationFrameId = null;
		});
	};

	throttledCallback.cancelAnimation = () => {
		animationFrameId && cancelAnimationFrame(animationFrameId);
	};

	return throttledCallback;
};
