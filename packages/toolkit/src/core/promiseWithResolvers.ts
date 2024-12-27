const PromiseWithResolversPolyfill = <TPromise>(
	signal: AbortSignal | undefined
): PromiseWithResolvers<TPromise> => {
	let reject!: (reason?: unknown) => void;
	// eslint-disable-next-line perfectionist/sort-union-types -- I want TPromise to be first in the union
	let resolve!: (value: TPromise | PromiseLike<TPromise>) => void;

	const promise = new Promise<TPromise>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	signal?.addEventListener("abort", () => reject(signal.reason));

	return { promise, reject, resolve };
};

const PromiseWithResolvers = <TPromise>(options: { signal?: AbortSignal } = {}) => {
	const { signal } = options;

	if (!Object.hasOwn(Promise, "withResolvers")) {
		return PromiseWithResolversPolyfill<TPromise>(signal);
	}

	const withResolvers = Promise.withResolvers<TPromise>();

	signal?.addEventListener("abort", () => withResolvers.reject(signal.reason));

	return withResolvers;
};

export { PromiseWithResolvers };
