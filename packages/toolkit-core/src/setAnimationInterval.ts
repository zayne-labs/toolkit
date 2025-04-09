export type AnimationIntervalOptions = {
	immediate?: boolean;
	once?: boolean;
};

const setAnimationInterval = (
	onAnimation: () => void,
	intervalDuration: number | null,
	options?: AnimationIntervalOptions
) => {
	let startTimeStamp: number | null = null;
	let animationFrameId: number;

	const smoothAnimation = (timeStamp: DOMHighResTimeStamp) => {
		if (!intervalDuration) return;

		startTimeStamp ??= Math.floor(timeStamp);

		const elapsedTime = Math.floor(timeStamp - startTimeStamp);

		if (elapsedTime >= intervalDuration) {
			onAnimation();
			startTimeStamp = null; // == Reset the starting time stamp
		}

		animationFrameId = requestAnimationFrame(smoothAnimation);
	};

	const start = () => {
		if (options?.once && intervalDuration) {
			setTimeout(onAnimation, intervalDuration);

			return;
		}

		animationFrameId = requestAnimationFrame(smoothAnimation);
	};

	if (options?.immediate) {
		start();
	}

	const stop = () => {
		cancelAnimationFrame(animationFrameId);
		startTimeStamp = null;
	};

	return { start, stop };
};

export { setAnimationInterval };
