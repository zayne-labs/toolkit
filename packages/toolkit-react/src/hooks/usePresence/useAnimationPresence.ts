import { on } from "@zayne-labs/toolkit-core";
import { useEffect, useRef, useState } from "react";
import { useCallbackRef } from "../useCallbackRef";
import { useDebouncedState } from "../useDebounce";
import type { UseSpecificPresence } from "./types";

const useAnimationPresence: UseSpecificPresence = (options = {}) => {
	const { defaultValue = true, duration, onExitComplete } = options;

	const [isShown, setIsShown] = useState(defaultValue);

	const [isMounted, setDebouncedIsMounted, setRegularIsMounted] = useDebouncedState(
		defaultValue,
		duration
	);
	const elementRef = useRef<HTMLElement>(null);

	const stableOnExitComplete = useCallbackRef(onExitComplete);

	useEffect(() => {
		!isMounted && stableOnExitComplete();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- stableOnExitComplete is stable
	}, [isMounted]);

	const handleIsMountedWithoutRef = (value: boolean) => {
		if (value) {
			setRegularIsMounted(true);
			return;
		}

		setDebouncedIsMounted(false);
	};

	const handleIsMountedWithRef = (value: boolean) => {
		if (value) {
			setRegularIsMounted(true);
			return;
		}

		on("animationend", elementRef.current, () => {
			setDebouncedIsMounted.cancel();
			setRegularIsMounted(false);
		});
	};

	const toggleVisibility = useCallbackRef(<TValue>(newValue?: TValue) => {
		const handleSetIsMounted = !duration ? handleIsMountedWithRef : handleIsMountedWithoutRef;

		if (typeof newValue === "boolean") {
			setIsShown(newValue);
			handleSetIsMounted(newValue);
			return;
		}

		setIsShown(!isShown);
		handleSetIsMounted(!isShown);
	});

	return {
		isPresent: isMounted,
		isVisible: isShown,
		toggleVisibility,
		...(duration === undefined && { elementRef }),
	} as never;
};

export { useAnimationPresence };
