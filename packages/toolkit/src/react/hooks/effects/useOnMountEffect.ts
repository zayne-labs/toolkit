import { useLifeCycle } from "./useLifeCycle";

const useMountEffect = (callBackFn: () => void) => {
	useLifeCycle({ onMount: callBackFn });
};

export { useMountEffect };
