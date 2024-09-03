const PromiseWithResolvers = <TPromise>() => {
	if (Object.hasOwn(Promise, "withResolvers")) {
		return Promise.withResolvers();
	}

	let reject!: (reason?: unknown) => void;
	let resolve!: (value: TPromise) => void;

	const promise = new Promise<TPromise>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, reject, resolve };
};

export { PromiseWithResolvers };
