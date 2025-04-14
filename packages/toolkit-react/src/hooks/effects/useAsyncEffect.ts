import { useEffect, useState } from "react";
import { useCallbackRef } from "../useCallbackRef";

export function useAsyncEffect(
	effect: () => Promise<ReturnType<React.EffectCallback>>,
	deps?: React.DependencyList
) {
	const stableEffectCallback = useCallbackRef(effect);
	const [destroy, setDestroy] = useState<ReturnType<React.EffectCallback>>();

	useEffect(() => {
		const e = stableEffectCallback();

		async function execute() {
			setDestroy(await e);
		}

		void execute();

		return () => void destroy?.();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- stableEffectCallback is stable
	}, deps);
}
