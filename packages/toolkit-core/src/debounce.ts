import { isArray, isObject, type CallbackFn } from "@zayne-labs/toolkit-type-helpers";

type DebouncedFnParams<TParams> =
	| [params: TParams | TParams[], overrideOptions: { $delay: number }]
	| TParams[];

type DebounceOptions = {
	/**
	 *  The maximum number of milliseconds to wait before invoking `callbackFn` again.
	 */
	maxWait?: number;
};

/**
 * Creates a debounced function that delays invoking `callbackFn` until after `delay` milliseconds have elapsed
 * since the last time the debounced function was invoked. The function has options to handle maximum wait time.
 * It can be configured to override the delay dynamically when called.
 * @param callbackFn - The function to debounce.
 * @param delay - The number of milliseconds to delay.
 * @param options - Optional settings like maxWait
 * @returns the new debounced function.
 */

const debounce = <TParams>(
	callbackFn: CallbackFn<TParams>,
	delay: number | undefined,
	options: DebounceOptions = {}
) => {
	let timeoutId: number | null;
	let maxWaitTimeoutId: number | null;

	const $clearMainTimeout = (): void => void (timeoutId && clearTimeout(timeoutId));

	// Overloads
	/**
	 * @description - The debounced function
	 * @param params - The parameters to pass to the callbackFn
	 */
	function debouncedFn(...params: TParams[]): void;
	function debouncedFn(params: TParams | TParams[], overrideOptions: { $delay: number }): void;

	// Implementation
	function debouncedFn(...params: DebouncedFnParams<TParams>) {
		const overrideOptions = isObject(params[1]) && "$delay" in params[1] ? params[1] : null;

		const resolvedParams = overrideOptions ? params[0] : params;

		$clearMainTimeout();

		timeoutId = setTimeout(() => {
			isArray(resolvedParams) ?
				callbackFn(...(resolvedParams as TParams[]))
			:	callbackFn(resolvedParams);

			timeoutId = null;
		}, overrideOptions?.$delay ?? delay) as never;

		if (!options.maxWait) return;

		// == Only register a new maxWaitTimeout if it's timeoutId is set to null, which implies the previous one has been executed
		if (maxWaitTimeoutId !== null) return;

		maxWaitTimeoutId = setTimeout(() => {
			// == Cancel the main timeout before invoking callbackFn
			$clearMainTimeout();

			isArray(resolvedParams) ?
				callbackFn(...(resolvedParams as TParams[]))
			:	callbackFn(resolvedParams);

			maxWaitTimeoutId = null;
		}, options.maxWait) as never;
	}

	debouncedFn.cancel = $clearMainTimeout;
	// prettier-ignore
	debouncedFn.cancelMaxWait = (): void => void (maxWaitTimeoutId && clearTimeout(maxWaitTimeoutId));

	return debouncedFn;
};

export { debounce };
