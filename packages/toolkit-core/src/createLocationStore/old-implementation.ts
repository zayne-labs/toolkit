import { isBrowser } from "../constants";
import type { EqualityFn, StoreApi } from "../createStore";
import { type URLInfoObject, formatUrl, pushState, replaceState } from "../navigation";
import { on } from "../on";

export type LocationInfo = URLInfoObject;

export type LocationStoreOptions = {
	equalityFn?: EqualityFn<string | LocationInfo>;
};

/* eslint-disable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */
const createLocationStore = (options: LocationStoreOptions = {}) => {
	// TODO - Apply shallow equality here
	const { equalityFn = Object.is } = options;

	const getSearchParam = () => new URLSearchParams(isBrowser() ? window.location.search : "");

	const initialSearchParam = getSearchParam();

	const initialState = {
		hash: isBrowser() ? window.location.hash : "",
		pathname: isBrowser() ? window.location.pathname : "",
		search: initialSearchParam,
		searchString: initialSearchParam.toString(),
		state: isBrowser() ? (window.history.state as LocationInfo["state"]) : null,
	} satisfies LocationInfo;

	let currentLocationState = initialState;

	const getState = () => currentLocationState;

	const getInitialState = () => initialState;

	/**
	 * @description This has to be done in order to actually trigger the popState event, otherwise it would only fire when the user clicks on the forward/back button.
	 * @see https://stackoverflow.com/a/37492075/18813022
	 */
	const triggerPopstateEvent = (state?: LocationInfo["state"]) => {
		window.dispatchEvent(new PopStateEvent("popstate", { state }));
	};

	type ModifiedPopSateEvent = Omit<PopStateEvent, "state"> & {
		state: {
			currentLocationState: LocationInfo;
			previousLocationState: LocationInfo;
		};
	};

	const setState = (...params: Parameters<typeof pushState>) => {
		const [newURL, $options] = params;

		const previousLocationState = currentLocationState;

		const { urlString: previousUrlString } = formatUrl(previousLocationState);

		const { urlObject: nextLocationState, urlString: nextUrlString } = formatUrl(newURL);

		const isLocationStateEqual =
			equalityFn(nextUrlString, previousUrlString)
			|| equalityFn(nextLocationState ?? {}, previousLocationState);

		if (isLocationStateEqual) return;

		const currentSearchParam = getSearchParam();

		currentLocationState = {
			hash: window.location.hash,
			pathname: window.location.pathname,
			search: currentSearchParam,
			searchString: currentSearchParam.toString(),
			state: (window.history.state as LocationInfo["state"]) ?? $options?.state,
			...nextLocationState,
		} satisfies LocationInfo;

		const state = { currentLocationState, previousLocationState };

		triggerPopstateEvent(state);

		return { nextUrlString, state };
	};

	const push: typeof pushState = (...params) => {
		const { nextUrlString, state } = setState(...params) ?? {};

		if (!nextUrlString) return;

		const pushStateObject = state?.currentLocationState.state;

		window.history.pushState(pushStateObject, "", nextUrlString);
	};

	const replace: typeof replaceState = (...params) => {
		const { nextUrlString, state } = setState(...params) ?? {};

		if (!nextUrlString) return;

		const replaceStateObject = state?.currentLocationState.state;

		window.history.replaceState(replaceStateObject, "", nextUrlString);
	};

	type Subscribe = StoreApi<LocationInfo>["subscribe"];

	const subscribe: Subscribe = (onLocationStoreChange) => {
		const handleLocationStoreChange = (event: ModifiedPopSateEvent) => {
			const currentState = event.state.currentLocationState;

			const previousLocationState = event.state.previousLocationState;

			onLocationStoreChange(currentState, previousLocationState);
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

	const locationStore = {
		getInitialState,
		getState,
		push,
		replace,
		subscribe,
		triggerPopstateEvent,
	};

	return locationStore;
};
/* eslint-enable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */

export { createLocationStore };
