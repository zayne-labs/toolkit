type BasePromiseOptions = {
	signal?: AbortSignal;
};

export const createPromiseWithResolversPolyfill = <TPromise>(
	options: BasePromiseOptions = {}
): PromiseWithResolvers<TPromise> => {
	const { signal } = options;

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

export const createPromiseWithResolvers = <TPromise>(options: BasePromiseOptions = {}) => {
	const { signal } = options;

	const withResolvers = Promise.withResolvers<TPromise>();

	signal?.addEventListener("abort", () => withResolvers.reject(signal.reason));

	return withResolvers;
};

// export const createPromiseWithDelay = <TPromise>(
// 	options: BasePromiseOptions & { delay?: number } = {}
// ) => {
// 	const { delay, signal } = options;

// 	const withResolvers = createPromiseWithResolvers<TPromise>({ signal });

// 	const reject = (reason: Parameters<PromiseWithResolvers<TPromise>["reject"]>[0]) => {
// 		setTimeout(() => withResolvers.reject(reason), delay);

// 		return withResolvers.promise;
// 	};

// 	const resolve = <TInnerPromise = TPromise>(
// 		value: Parameters<PromiseWithResolvers<TInnerPromise>["resolve"]>[0]
// 	) => {
// 		setTimeout(() => withResolvers.resolve(value as never), delay);

// 		return withResolvers.promise as unknown as Promise<TInnerPromise>;
// 	};

// 	return { promise: withResolvers.promise, reject, resolve };
// };
