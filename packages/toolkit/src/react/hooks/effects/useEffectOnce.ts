import { useEffect } from "react";
import { useCallbackRef } from "../useCallbackRef";

const useEffectOnce = (callBackFn: React.EffectCallback) => {
	const stableCallback = useCallbackRef(callBackFn);

	// == savedCallback is always stable so no worries about re-execution of this effect
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(stableCallback, []);
};

export { useEffectOnce };
