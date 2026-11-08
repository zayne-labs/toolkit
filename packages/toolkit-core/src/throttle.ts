import type { AnyFunction, UnmaskType } from "@zayne-labs/toolkit-type-helpers";

type ThrottledByTimeoutFn<TCallbackFn extends AnyFunction> = UnmaskType<{
	(...parameters: Parameters<TCallbackFn>): void;
	cancelTimeout: () => void;
}>;

type ThrottledByTimeFn<TCallbackFn extends AnyFunction> = (...parameters: Parameters<TCallbackFn>) => void;

type ThrottledByFrameFn<TCallbackFn extends AnyFunction> = UnmaskType<{
	(...parameters: Parameters<TCallbackFn>): void;
	cancelAnimation: () => void;
}>;

/**
 * @description Invokes `callbackFn` at most once per `delay`, at the end of each window,
 * with the arguments from the latest call in that window.
 */
export const throttleByTimeout = <TCallbackFn extends AnyFunction>(
	callbackFn: TCallbackFn,
	delay: number
): ThrottledByTimeoutFn<TCallbackFn> => {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let latestParams: Parameters<TCallbackFn> | null = null;

	const throttledCallback: ThrottledByTimeoutFn<TCallbackFn> = (...params) => {
		latestParams = params;

		if (timeoutId !== null) return;

		timeoutId = setTimeout(() => {
			const paramsToUse = latestParams as Parameters<TCallbackFn>;

			timeoutId = null;
			latestParams = null;

			callbackFn(...paramsToUse);
		}, delay);
	};

	throttledCallback.cancelTimeout = () => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = null;
		latestParams = null;
	};

	return throttledCallback;
};

/**
 * @description Invokes `callbackFn` immediately, then ignores calls until `delay` has elapsed (leading edge only).
 */
export const throttleByTime = <TCallbackFn extends AnyFunction>(
	callbackFn: TCallbackFn,
	delay: number
): ThrottledByTimeFn<TCallbackFn> => {
	let lastCallTime = 0;

	const throttledCallback: ThrottledByTimeFn<TCallbackFn> = (...params) => {
		const elapsedTime = Date.now() - lastCallTime;

		if (elapsedTime < delay) return;

		callbackFn(...params);
		lastCallTime = Date.now();
	};

	return throttledCallback;
};

/**
 * @description Invokes `callbackFn` at most once per animation frame,
 * with the arguments from the latest call before that frame.
 */
export const throttleByFrame = <TCallbackFn extends AnyFunction>(callbackFn: TCallbackFn) => {
	let animationFrameId: ReturnType<typeof requestAnimationFrame> | null = null;
	let latestParams: Parameters<TCallbackFn> | null = null;

	const throttledCallback: ThrottledByFrameFn<TCallbackFn> = (...params) => {
		latestParams = params;

		if (animationFrameId !== null) return;

		animationFrameId = requestAnimationFrame(() => {
			const paramsToUse = latestParams as Parameters<TCallbackFn>;

			animationFrameId = null;
			latestParams = null;

			callbackFn(...paramsToUse);
		});
	};

	throttledCallback.cancelAnimation = () => {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
		}

		animationFrameId = null;
		latestParams = null;
	};

	return throttledCallback;
};
