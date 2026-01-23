import { isArray, isObject, type AnyFunction, type UnmaskType } from "@zayne-labs/toolkit-type-helpers";

type DebounceOptions = {
	/**
	 *  The maximum number of milliseconds to wait before invoking `callbackFn` again.
	 */
	maxWait?: number;
};

type DebouncedFn<TCallbackFn extends AnyFunction> = UnmaskType<{
	(...parameters: Parameters<TCallbackFn>): void;
	(...parameters: [parameters: Parameters<TCallbackFn>, overrideOptions: { $delay: number }]): void;
	cancel: () => void;
	cancelMaxWait: () => void;
}>;

/**
 * Creates a debounced function that delays invoking `callbackFn` until after `delay` milliseconds have elapsed
 * since the last time the debounced function was invoked. The function has options to handle maximum wait time.
 * It can be configured to override the delay dynamically when called.
 * @param callbackFn - The function to debounce.
 * @param delay - The number of milliseconds to delay.
 * @param options - Optional settings like maxWait
 * @returns the new debounced function.
 */

const debounce = <TCallbackFn extends AnyFunction>(
	callbackFn: TCallbackFn,
	delay: number | undefined,
	options: DebounceOptions = {}
): DebouncedFn<TCallbackFn> => {
	const emptySymbol = Symbol("emptyParam");

	let timeoutId: ReturnType<typeof setTimeout> | typeof emptySymbol = emptySymbol;
	let maxWaitTimeoutId: ReturnType<typeof setTimeout> | typeof emptySymbol = emptySymbol;
	let storedParameters: Parameters<TCallbackFn> | typeof emptySymbol = emptySymbol;

	const clearMainTimeout = () => {
		if (timeoutId === emptySymbol) return;

		clearTimeout(timeoutId);
		timeoutId = emptySymbol;
	};

	const clearMaxWaitTimeout = () => {
		if (maxWaitTimeoutId === emptySymbol) return;

		clearTimeout(maxWaitTimeoutId);
		maxWaitTimeoutId = emptySymbol;
	};

	const clearAll = () => {
		clearMainTimeout();
		clearMaxWaitTimeout();
		storedParameters = emptySymbol;
	};

	const invokeCallback = () => {
		const parameters = storedParameters;

		clearAll();

		if (parameters === emptySymbol) return;

		callbackFn(...parameters);
	};

	const debouncedFn: DebouncedFn<TCallbackFn> = (...parameters) => {
		const hasOverrideOptions = parameters.length === 2 && isArray(parameters[0]);

		const overrideOptions =
			hasOverrideOptions && isObject(parameters[1]) && "$delay" in parameters[1] ? parameters[1] : null;

		const resolvedDelay = overrideOptions?.$delay ?? delay;

		storedParameters = (overrideOptions ? parameters[0] : parameters) as Parameters<TCallbackFn>;

		clearMainTimeout();

		timeoutId = setTimeout(() => invokeCallback(), resolvedDelay);

		if (options.maxWait === undefined) return;

		if (maxWaitTimeoutId !== emptySymbol) return;

		maxWaitTimeoutId = setTimeout(() => invokeCallback(), options.maxWait);
	};

	debouncedFn.cancel = clearAll;

	debouncedFn.cancelMaxWait = clearMaxWaitTimeout;

	return debouncedFn;
};

export { debounce };
