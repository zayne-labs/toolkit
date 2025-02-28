import { type Destructor, useLifeCycle } from "./useLifeCycle";

const useUnmountEffect = (cleanUpFn: Destructor) => useLifeCycle({ onUnmount: cleanUpFn });

export { useUnmountEffect };
