import { useEffect, useRef } from "react";
import { useCallbackRef } from "../useCallbackRef";

const useEffectOnce = (callBackFn: React.EffectCallback) => {
	const stableCallback = useCallbackRef(callBackFn);

	const effectGuardRef = useRef(false);

	// == savedCallback is always stable so no worries about re-execution of this effect
	useEffect(() => {
		if (effectGuardRef.current) return;

		effectGuardRef.current = true;

		return stableCallback();
	}, [stableCallback]);
};

export { useEffectOnce };
