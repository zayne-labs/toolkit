import { useLifeCycle, type Destructor } from "./useLifeCycle";

const useUnmountEffect = (cleanUpFn: Destructor) => useLifeCycle({ onUnmount: cleanUpFn });

export { useUnmountEffect };
