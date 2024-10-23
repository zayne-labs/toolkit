import { useEffect, useRef } from "react";
import { useCallbackRef } from "../useCallbackRef";

const useAfterMountEffect: typeof useEffect = (callBackFn, deps) => {
	const isFirstMount = useRef(true);
	const stableCallback = useCallbackRef(callBackFn);

	useEffect(() => {
		if (isFirstMount.current) {
			isFirstMount.current = false;
			return;
		}

		stableCallback();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);
};
export { useAfterMountEffect };
