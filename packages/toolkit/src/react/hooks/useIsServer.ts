import { useSyncExternalStore } from "react";

const noopStore = {
	getServerSnapshot: () => true,
	getSnapshot: () => false,
	// eslint-disable-next-line unicorn/consistent-function-scoping -- It's fine
	subscribe: () => () => {},
};

/**
 * @description Returns whether the component is currently being server side rendered or
 * hydrated on the client. Can be used to delay browser-specific rendering
 * until after hydration.
 */
const useIsServer = () => {
	const isServer = useSyncExternalStore(
		noopStore.subscribe,
		noopStore.getSnapshot,
		noopStore.getServerSnapshot
	);

	return isServer;
};

export { useIsServer };
