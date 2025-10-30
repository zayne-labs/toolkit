import { isBrowser } from "../constants";
import type { EqualityFn, StoreApi } from "../createStore";
import { formatUrl, type PartialURLInfo, type URLInfoObject } from "../navigation";
import { on } from "../on";

export type LocationInfo = URLInfoObject;

export type LocationStoreOptions = {
	equalityFn?: EqualityFn<string | LocationInfo>;
};

type NavigationOptions = {
	state?: PartialURLInfo["state"];
};

export type LocationStoreApi = Omit<StoreApi<LocationInfo>, "resetState" | "setState"> & {
	push: (url: string | PartialURLInfo, options?: NavigationOptions) => void;
	replace: LocationStoreApi["push"];
	triggerPopstateEvent: (nextLocationState?: LocationInfo["state"]) => void;
};

/* eslint-disable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */
const createLocationStore = (options: LocationStoreOptions = {}): LocationStoreApi => {
	// TODO - Apply shallow equality here
	const { equalityFn = Object.is } = options;

	const getSearchParam = () => new URLSearchParams(isBrowser() ? globalThis.location.search : "");

	const initialSearchParam = getSearchParam();

	const initialState = {
		hash: isBrowser() ? globalThis.location.hash : "",
		pathname: isBrowser() ? globalThis.location.pathname : "",
		search: initialSearchParam,
		searchString: initialSearchParam.toString(),
		state: isBrowser() ? (globalThis.history.state as LocationInfo["state"]) : null,
	} satisfies LocationInfo;

	let currentLocationState: LocationInfo = initialState;

	const getState = () => currentLocationState;

	const getInitialState = () => initialState;

	/**
	 * @description This has to be done in order to actually trigger the popState event, otherwise it would only fire when the user clicks on the forward/back button.
	 * @see https://stackoverflow.com/a/37492075/18813022
	 */
	const triggerPopstateEvent: LocationStoreApi["triggerPopstateEvent"] = (nextLocationState) => {
		globalThis.dispatchEvent(new PopStateEvent("popstate", { state: nextLocationState }));
	};

	const setState = (newURL: string | PartialURLInfo, navigationOptions?: NavigationOptions) => {
		const { urlString: currentString } = formatUrl(currentLocationState);

		const { urlObject: nextUrlObject, urlString: nextUrlString } = formatUrl(newURL);

		const isLocationStateEqual =
			nextUrlString === currentString || equalityFn(nextUrlObject ?? {}, currentLocationState);

		if (isLocationStateEqual) return;

		const { state } = navigationOptions ?? {};

		const nextLocationState = {
			...nextUrlObject,
			...(Boolean(state) && { state }),
		};

		triggerPopstateEvent(nextLocationState);

		return { historyState: nextLocationState.state, nextUrlString };
	};

	const push: LocationStoreApi["push"] = (newURL, navigationOptions) => {
		const { historyState, nextUrlString } = setState(newURL, navigationOptions) ?? {};

		if (!nextUrlString) return;

		globalThis.history.pushState(historyState, "", nextUrlString);
	};

	const replace: LocationStoreApi["replace"] = (newURL, navigationOptions) => {
		const { historyState, nextUrlString } = setState(newURL, navigationOptions) ?? {};

		if (!nextUrlString) return;

		globalThis.history.replaceState(historyState, "", nextUrlString);
	};

	const getCurrentLocationObject = () => {
		const currentSearchParams = getSearchParam();

		return {
			hash: globalThis.location.hash,
			pathname: globalThis.location.pathname,
			search: currentSearchParams,
			searchString: currentSearchParams.toString(),
			state: globalThis.history.state as LocationInfo["state"],
		};
	};

	const subscribe: LocationStoreApi["subscribe"] = (onLocationStoreChange) => {
		type ModifiedPopSateEvent = Omit<PopStateEvent, "state"> & { state?: LocationInfo };

		const handleLocationStoreChange = (event: ModifiedPopSateEvent) => {
			const previousLocationState = currentLocationState;

			currentLocationState = {
				...getCurrentLocationObject(),
				...event.state,
			};

			onLocationStoreChange(currentLocationState, previousLocationState);
		};

		const cleanup = on("popstate", window, handleLocationStoreChange);

		return cleanup;
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: sliceEqualityFn = equalityFn, fireListenerImmediately = false } =
			subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(getState());

			onStoreChange(slice, slice);
		}

		const unsubscribe = subscribe((state, prevState) => {
			const previousSlice = selector(prevState);
			const slice = selector(state);

			if (sliceEqualityFn(slice as never, previousSlice as never)) return;

			onStoreChange(slice, previousSlice);
		});

		return unsubscribe;
	};

	const api = {
		getInitialState,
		getState,
		push,
		replace,
		subscribe,
		triggerPopstateEvent,
	} satisfies LocationStoreApi;

	return api;
};
/* eslint-enable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */

export { createLocationStore };
