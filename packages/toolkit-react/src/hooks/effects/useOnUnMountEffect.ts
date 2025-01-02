import { type Destructor, useLifeCycle } from "./useLifeCycle";

const useOnUnmountEffect = (cleanUpFn: Destructor) => useLifeCycle({ onUnmount: cleanUpFn });

export { useOnUnmountEffect };
