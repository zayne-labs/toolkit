import { useAnimationInterval, useCallbackRef } from "@/react";
import { useState } from "react";
import { useCarouselStore } from "./carouselStoreContext";

type CarouselOptions = {
	autoSlideInterval?: number;
	hasAutoSlide?: boolean;
	shouldPauseOnHover?: boolean;
};

const useCarouselOptions = (options: CarouselOptions = {}) => {
	const { autoSlideInterval = 5000, hasAutoSlide = false, shouldPauseOnHover = false } = options;

	const { nextSlide } = useCarouselStore((state) => state.actions);

	const [isPaused, setIsPaused] = useState(false);

	const shouldAutoSlide = hasAutoSlide && !isPaused;

	useAnimationInterval({
		intervalDuration: shouldAutoSlide ? autoSlideInterval : null,
		onAnimation: nextSlide,
	});

	const pauseAutoSlide = useCallbackRef(() => shouldPauseOnHover && setIsPaused(true));

	const resumeAutoSlide = useCallbackRef(() => shouldPauseOnHover && setIsPaused(false));

	return { pauseAutoSlide, resumeAutoSlide };
};

export { useCarouselOptions };
