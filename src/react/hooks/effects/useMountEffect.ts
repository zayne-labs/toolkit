import { useEffectOnce } from "./useEffectOnce";

const useMountEffect = (callBackFn: () => void) => {
	useEffectOnce(() => {
		callBackFn();
	});
};

export { useMountEffect };
