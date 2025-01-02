import { useEffect } from "react";
import { useCallbackRef } from "../useCallbackRef";

export type Destructor = ReturnType<React.EffectCallback>;

type LifeCycleOptions = {
	onMount?: () => void;
	onUnmount?: Destructor;
};

const useLifeCycle = ({ onMount, onUnmount }: LifeCycleOptions) => {
	const stableOnMount = useCallbackRef(onMount);
	const stableOnUnmount = useCallbackRef(onUnmount);

	useEffect(() => {
		stableOnMount();

		return stableOnUnmount;
		// eslint-disable-next-line react-hooks/exhaustive-deps -- stableOnMount and stableOnUnmount are stable
	}, []);
};

export { useLifeCycle };
