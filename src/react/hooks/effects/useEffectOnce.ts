import { useEffect } from "react";
import { useCallbackRef } from "../useCallbackRef";

const useEffectOnce = (callBackFn: React.EffectCallback) => {
	const savedCallback = useCallbackRef(callBackFn);

	// == savedCallback is always stable so no worries about re-execution of this effect
	useEffect(savedCallback, [savedCallback]);
};

export { useEffectOnce };
