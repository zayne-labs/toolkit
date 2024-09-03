import { useEffect, useRef } from "react";
import { useCallbackRef } from "../useCallbackRef";

const useAfterMountEffect: typeof useEffect = (callBackFn, deps) => {
	const isFirstMount = useRef(true);
	const savedCallback = useCallbackRef(callBackFn);

	useEffect(() => {
		if (isFirstMount.current) {
			isFirstMount.current = false;
			return;
		}

		savedCallback();
	}, deps);
};
export { useAfterMountEffect };
