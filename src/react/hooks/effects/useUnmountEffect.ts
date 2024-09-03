import { useEffectOnce } from "./useEffectOnce";

const useOnUnmountEffect = (cleanUpFn: () => void) => useEffectOnce(() => cleanUpFn);

export { useOnUnmountEffect };
