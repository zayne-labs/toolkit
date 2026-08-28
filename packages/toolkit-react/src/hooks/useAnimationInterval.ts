import { setAnimationInterval, type AnimationIntervalOptions } from "@zayne-labs/toolkit-core";
import type { Prettify } from "@zayne-labs/toolkit-type-helpers";
import { useEffect, useMemo } from "react";
import { useCallbackRef } from "./useCallbackRef";

type AnimationOptions = Prettify<
	AnimationIntervalOptions & {
		enabled?: boolean;
		intervalDuration: number;
		onAnimation: () => void;
	}
>;

const useAnimationInterval = (options: AnimationOptions) => {
	const { enabled = true, intervalDuration, onAnimation, once } = options;

	const stableCallback = useCallbackRef(onAnimation);

	const controls = useMemo(
		() => setAnimationInterval(stableCallback, intervalDuration, { once }),
		[intervalDuration, stableCallback, once]
	);

	useEffect(() => {
		if (!enabled) return;

		controls.start();

		return () => controls.stop();
	}, [enabled, intervalDuration, controls]);

	return controls;
};

export { useAnimationInterval };
