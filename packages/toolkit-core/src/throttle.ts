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

export const throttleByTimeout = <TCallbackFn extends AnyFunction>(
	callbackFn: TCallbackFn,
	delay: number
): ThrottledByTimeoutFn<TCallbackFn> => {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const throttledCallback: ThrottledByTimeoutFn<TCallbackFn> = (...params) => {
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

export const throttleByTime = <TCallbackFn extends AnyFunction>(
	callbackFn: TCallbackFn,
	delay: number
): ThrottledByTimeFn<TCallbackFn> => {
	let lastCallTime = 0;

	const throttledCallback: ThrottledByTimeFn<TCallbackFn> = (...params) => {
		const elapsedTime = Date.now() - lastCallTime;

		if (elapsedTime >= delay) {
			callbackFn(...params);
			lastCallTime = Date.now();
		}
	};

	return throttledCallback;
};

export const throttleByFrame = <TCallbackFn extends AnyFunction>(callbackFn: TCallbackFn) => {
	let animationFrameId: ReturnType<typeof requestAnimationFrame> | null = null;

	const throttledCallback: ThrottledByFrameFn<TCallbackFn> = (...params) => {
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
