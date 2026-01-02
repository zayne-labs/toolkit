import { useEffect, useRef } from "react";
import { useCallbackRef } from "../useCallbackRef";

const useAfterMountEffect: typeof useEffect = (callBackFn, deps) => {
	const isFirstMountRef = useRef(true);
	const stableCallback = useCallbackRef(callBackFn);

	useEffect(() => {
		if (isFirstMountRef.current) {
			isFirstMountRef.current = false;
			return;
		}

		stableCallback();
		// eslint-disable-next-line react-hooks/rule-suppression -- Ignore
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Ignore
	}, [stableCallback, ...(deps ?? [])]);
};
export { useAfterMountEffect };
