import { isNumber, type UnionDiscriminator } from "@zayne-labs/toolkit-type-helpers";

type Delay = UnionDiscriminator<[{ milliseconds: number }, { seconds: number }]>;

const resolveDelayInMs = (delay: number | Delay): number => {
	if (isNumber(delay)) {
		return delay;
	}

	if (isNumber(delay.seconds)) {
		return delay.seconds * 1000;
	}

	return delay.milliseconds ?? 0;
};

export const waitFor = (delay: number | Delay): Promise<void> => {
	const delayInMs = resolveDelayInMs(delay);

	if (delayInMs <= 0) {
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		setTimeout(resolve, delayInMs);
	});
};

export const waitForSync = (delay: number | Delay) => {
	const delayInMs = resolveDelayInMs(delay);

	if (delayInMs <= 0) return;

	const startTime = performance.now();

	for (
		let currentTime = startTime;
		Math.floor(currentTime - startTime) < delayInMs;
		currentTime = performance.now()
	) {
		// Do Nothing in the loop
	}
};
