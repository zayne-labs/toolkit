import { useSyncExternalStore } from "react";

const noop = () => {};

const noopStore = {
	getServerSnapshot: () => true,
	getSnapshot: () => false,
	subscribe: () => noop,
};

/**
 * @description Return a boolean indicating if the JS has been hydrated already.
 * When doing Server-Side Rendering, the result will always be false.
 * When doing Client-Side Rendering, the result will always be false on the
 * first render and true from then on. Even if a new component renders it will
 * always start with true.
 *
 * @see https://github.com/sergiodxa/remix-utils/blob/main/src/react/use-hydrated.ts
 *
 * @see https://github.com/sergiodxa/remix-utils/blob/main/src/react/use-hydrated.ts
 *
 * @example
 * **Example: Disable a button that needs JS to work.**
 * ```tsx
 * const isHydrated = useIsHydrated();
 *
 * return (
 *   <button type="button" disabled={!isHydrated} onClick={doSomethingCustom}>
 *     Click me
 *   </button>
 * );
 * ```
 */
const useIsHydrated = () => {
	const isHydrated = useSyncExternalStore(
		noopStore.subscribe,
		noopStore.getSnapshot,
		noopStore.getServerSnapshot
	);

	return isHydrated;
};

export { useIsHydrated };
