import { useEffect, useRef } from "react";
import { useCallbackRef } from "../useCallbackRef";

const useEffectOnce = (callBackFn: React.EffectCallback) => {
	const stableCallback = useCallbackRef(callBackFn);

	const effectGuard = useRef(false);

	// == savedCallback is always stable so no worries about re-execution of this effect
	useEffect(() => {
		if (effectGuard.current) return;

		effectGuard.current = true;

		return stableCallback();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
};

export { useEffectOnce };
