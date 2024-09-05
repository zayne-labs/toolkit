import { useEffectOnce } from "./useEffectOnce";

type Destructor = ReturnType<React.EffectCallback>;

const useOnUnmountEffect = (cleanUpFn: Destructor) => useEffectOnce(() => cleanUpFn);

export { useOnUnmountEffect };
