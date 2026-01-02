import { setAnimationInterval, type AnimationIntervalOptions } from "@zayne-labs/toolkit-core";
import type { Prettify } from "@zayne-labs/toolkit-type-helpers";
import { useEffect, useMemo } from "react";
import { useCallbackRef } from "./useCallbackRef";

type AnimationOptions = Prettify<
	AnimationIntervalOptions & {
		intervalDuration: number | null;
		onAnimation: () => void;
	}
>;

const useAnimationInterval = (options: AnimationOptions) => {
	const { intervalDuration, onAnimation, once } = options;

	const stableCallback = useCallbackRef(onAnimation);

	const { start, stop } = useMemo(
		() => setAnimationInterval(stableCallback, intervalDuration, { once }),
		[intervalDuration, stableCallback, once]
	);

	useEffect(() => {
		if (intervalDuration === null) return;

		start();

		return stop;
	}, [intervalDuration, start, stop]);

	return { start, stop };
};

export { useAnimationInterval };
