import { type AnimationIntervalOptions, setAnimationInterval } from "@zayne-labs/toolkit-core";
import type { Prettify } from "@zayne-labs/toolkit-type-helpers";
import { useEffect } from "react";
import { useCallbackRef } from "./useCallbackRef";
import { useConstant } from "./useConstant";

type AnimationOptions = Prettify<
	AnimationIntervalOptions & {
		intervalDuration: number | null;
		onAnimation: () => void;
	}
>;

const useAnimationInterval = (options: AnimationOptions) => {
	const { intervalDuration, onAnimation, once } = options;

	const latestCallback = useCallbackRef(onAnimation);

	// prettier-ignore
	const { start, stop } = useConstant(() => setAnimationInterval(latestCallback, intervalDuration, { once }));

	useEffect(() => {
		if (intervalDuration === null) return;

		start();

		return stop;
		// eslint-disable-next-line react-hooks/exhaustive-deps -- start and stop are stable
	}, [intervalDuration]);

	return { start, stop };
};

export { useAnimationInterval };
