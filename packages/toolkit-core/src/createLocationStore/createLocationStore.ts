import { isBrowser } from "../constants";
import { createStore } from "../createStore";
import { createSearchParams, formatUrl } from "../navigation";
import { on } from "../on";
import type { LocationStoreApi, LocationStoreInfo, LocationStoreOptions } from "./types";

const getSearchParam = () => new URLSearchParams(isBrowser() ? globalThis.location.search : "");

const triggerPopstateEvent: LocationStoreApi["triggerPopstateEvent"] = (nextLocationState) => {
	globalThis.dispatchEvent(new PopStateEvent("popstate", { state: nextLocationState }));
};

const createLocationStore = (options: LocationStoreOptions = {}): LocationStoreApi => {
	const {
		defaultValues,
		equalityFn = Object.is,
		logger = console.error,
		shouldNotifySync: globalShouldNotifySync = false,
	} = options;

	const getInitialLocationStoreInfo = () => {
		const initialSearchParam =
			defaultValues?.search ? createSearchParams(defaultValues.search) : getSearchParam();

		return {
			hash: defaultValues?.hash ?? (isBrowser() ? globalThis.location.hash : ""),
			pathname: defaultValues?.pathname ?? (isBrowser() ? globalThis.location.pathname : ""),
			search: initialSearchParam,
			searchString: initialSearchParam.toString(),
			state:
				defaultValues?.state
				?? (isBrowser() ? (globalThis.history.state as LocationStoreInfo["state"]) : undefined),
		} satisfies LocationStoreInfo;
	};

	const internalStore = createStore<LocationStoreInfo>(() => getInitialLocationStoreInfo(), {
		equalityFn,
		shouldNotifySync: globalShouldNotifySync,
	});

	const navigate = (
		action: "push" | "replace" = "push",
		...parameters: Parameters<LocationStoreApi["push"]>
	) => {
		const [url, navOptions = {}] = parameters;

		const { shouldNotifySync = globalShouldNotifySync, state: urlState } = navOptions;

		const { urlObject: nextUrlObject, urlString: nextUrlString } = formatUrl(url);

		const nextLocationState = {
			...nextUrlObject,
			state: urlState !== undefined ? urlState : nextUrlObject.state,
		} satisfies LocationStoreInfo;

		internalStore.setState(nextLocationState, { shouldNotifySync, shouldReplace: true });

		try {
			action === "push" ?
				globalThis.history.pushState(nextLocationState.state, "", nextUrlString)
			:	globalThis.history.replaceState(nextLocationState.state, "", nextUrlString);
		} catch (error) {
			logger(error);
		}
	};

	const push: LocationStoreApi["push"] = (...parameters) => navigate("push", ...parameters);

	const replace: LocationStoreApi["replace"] = (...parameters) => navigate("replace", ...parameters);

	const handleLocationStoreChange = (event: PopStateEvent) => {
		const currentSearchParams = getSearchParam();

		const currentLocationInfo = {
			hash: globalThis.location.hash,
			pathname: globalThis.location.pathname,
			search: currentSearchParams,
			searchString: currentSearchParams.toString(),
			state: globalThis.history.state as LocationStoreInfo["state"],
		} satisfies LocationStoreInfo;

		const nextLocationState = {
			...currentLocationInfo,
			...(event.state as LocationStoreInfo),
		};

		internalStore.setState(nextLocationState, { shouldNotifySync: true, shouldReplace: true });
	};

	let cleanupExternalListeners: (() => void) | null = null;

	const setupExternalListeners = () => {
		const popstateCleanup = on("popstate", globalThis, handleLocationStoreChange);

		cleanupExternalListeners = () => {
			popstateCleanup();
			cleanupExternalListeners = null;
		};
	};

	const hasNoInternalListeners = () => internalStore.getListeners().size === 0;

	const subscribe: LocationStoreApi["subscribe"] = (onLocationStoreChange, subscribeOptions) => {
		if (hasNoInternalListeners()) {
			setupExternalListeners();
		}

		const unsubscribe = internalStore.subscribe(onLocationStoreChange, subscribeOptions);

		return () => {
			unsubscribe();

			if (hasNoInternalListeners()) {
				cleanupExternalListeners?.();
			}
		};
	};
	subscribe.withSelector = internalStore.subscribe.withSelector;

	const api = {
		getInitialState: internalStore.getInitialState,
		getListeners: internalStore.getListeners,
		getState: internalStore.getState,
		push,
		replace,
		subscribe,
		triggerPopstateEvent,
	} satisfies LocationStoreApi;

	return api;
};

export { createLocationStore };
