const PromiseWithResolvers = <TPromise>(options: { signal?: AbortSignal } = {}) => {
	const { signal } = options;

	if (Object.hasOwn(Promise, "withResolvers")) {
		const withResolvers = Promise.withResolvers<TPromise>();

		signal?.addEventListener("abort", () => withResolvers.reject(signal.reason));

		return withResolvers;
	}

	let reject!: (reason?: unknown) => void;
	let resolve!: (value: TPromise) => void;

	const promise = new Promise<TPromise>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	signal?.addEventListener("abort", () => reject(signal.reason));

	return { promise, reject, resolve };
};

export { PromiseWithResolvers };
