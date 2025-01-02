import { PromiseWithResolvers } from "./promiseWithResolvers";

type Delay =
	| {
			milliseconds: number;
			seconds?: never;
	  }
	| {
			milliseconds?: never;
			seconds: number;
	  };

export const waitUntil = (delay: number | Delay) => {
	if (typeof delay === "number" || delay.seconds === 0 || delay.milliseconds === 0) return;

	const { promise, resolve } = PromiseWithResolvers();

	const delayInMs =
		typeof delay === "number"
			? delay
			: // eslint-disable-next-line unicorn/no-nested-ternary -- ignore for now
				typeof delay.seconds === "number"
				? delay.seconds * 1000
				: delay.milliseconds;

	setTimeout(resolve, delayInMs);

	return promise;
};

export const waitUntilSync = (delay: number | Delay) => {
	if (typeof delay === "number" || delay.seconds === 0 || delay.milliseconds === 0) return;

	const startTime = performance.now();

	const delayInMs =
		typeof delay === "number"
			? delay
			: // eslint-disable-next-line unicorn/no-nested-ternary -- ignore for now
				typeof delay.seconds === "number"
				? delay.seconds * 1000
				: delay.milliseconds;

	for (
		let currentTime = startTime;
		Math.floor(currentTime - startTime) < delayInMs;
		currentTime = performance.now()
	) {
		// Do Nothing in the loop
	}
};
