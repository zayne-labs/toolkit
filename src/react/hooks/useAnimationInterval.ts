import { setAnimationInterval } from "@/core";
import { useEffect } from "react";
import { useCallbackRef } from "./useCallbackRef";
import { useConstant } from "./useConstant";

type AnimationOptions = {
	intervalDuration: number | null;
	onAnimation: () => void;
};

const useAnimationInterval = (options: AnimationOptions) => {
	const { intervalDuration, onAnimation } = options;

	const latestCallback = useCallbackRef(onAnimation);

	// prettier-ignore
	const { start, stop } = useConstant(() => setAnimationInterval(latestCallback, intervalDuration));

	useEffect(() => {
		if (intervalDuration === null) return;

		start();

		return stop;
	}, [intervalDuration]);

	return { start, stop };
};

export { useAnimationInterval };
