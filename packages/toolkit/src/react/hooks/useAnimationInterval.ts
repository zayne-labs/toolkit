import { setAnimationInterval } from "@/core";
import type { AnimationIntervelOptions } from "@/core/setAnimationInterval";
import type { Prettify } from "@/type-helpers";
import { useEffect } from "react";
import { useCallbackRef } from "./useCallbackRef";
import { useConstant } from "./useConstant";

type AnimationOptions = Prettify<
	AnimationIntervelOptions & {
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
