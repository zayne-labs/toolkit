import { useEffect, useState } from "react";
import { useCallbackRef } from "../useCallbackRef";

export function useAsyncEffect(
	effect: () => Promise<ReturnType<React.EffectCallback>>,
	deps?: React.DependencyList
) {
	const stableEffectCallback = useCallbackRef(effect);
	const [destroy, setDestroy] = useState<ReturnType<React.EffectCallback>>();

	useEffect(() => {
		const effectResult = stableEffectCallback();

		async function execute() {
			setDestroy(await effectResult);
		}

		void execute();

		return () => void destroy?.();
		// eslint-disable-next-line react-hooks/rule-suppression -- Ignore
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Ignore
	}, [destroy, stableEffectCallback, ...(deps ?? [])]);
}
