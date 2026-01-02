import { useEffect, useRef } from "react";
import { useCallbackRef } from "../useCallbackRef";

const useEffectOnce = (callBackFn: React.EffectCallback) => {
	const stableCallback = useCallbackRef(callBackFn);

	const effectGuardRef = useRef(false);

	useEffect(() => {
		if (effectGuardRef.current) return;

		effectGuardRef.current = true;

		return stableCallback();
	}, [stableCallback]);
};

export { useEffectOnce };
