import { isNumber, type UnionDiscriminator } from "@zayne-labs/toolkit-type-helpers";
import { createPromiseWithResolvers } from "./promise";

type Delay = UnionDiscriminator<[{ milliseconds: number }, { seconds: number }]>;

export const waitFor = (delay: number | Delay) => {
	const { promise, resolve } = createPromiseWithResolvers();

	const delayInMs =
		isNumber(delay) ? delay
			// eslint-disable-next-line unicorn/no-nested-ternary -- ignore for now
		: isNumber(delay.seconds) ? delay.seconds * 1000
		: delay.milliseconds;

	if (delayInMs === undefined || delayInMs === 0) return;

	setTimeout(resolve, delayInMs);

	return promise;
};

export const waitForSync = (delay: number | Delay) => {
	const startTime = performance.now();

	const delayInMs =
		isNumber(delay) ? delay
			// eslint-disable-next-line unicorn/no-nested-ternary -- ignore for now
		: isNumber(delay.seconds) ? delay.seconds * 1000
		: delay.milliseconds;

	if (delayInMs === undefined || delayInMs === 0) return;

	for (
		let currentTime = startTime;
		Math.floor(currentTime - startTime) < delayInMs;
		currentTime = performance.now()
	) {
		// Do Nothing in the loop
	}
};
