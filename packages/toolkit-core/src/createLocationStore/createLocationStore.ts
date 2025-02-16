import { isBrowser } from "../constants";
import type { EqualityFn, StoreApi } from "../createStore";
import { type URLInfo, pushState, replaceState } from "../navigation";
import { on } from "../on";

export type LocationInfo = Omit<URLInfo, "search"> & { search: URLSearchParams };

export type LocationStoreOptions = {
	equalityFn?: EqualityFn<LocationInfo>;
};

/* eslint-disable unicorn/prefer-global-this -- It doesn't need globalThis since it only exists in window */
const createLocationStore = (options: LocationStoreOptions = {}) => {
	// TODO - Apply shallow equality here
	const { equalityFn = Object.is } = options;

	let locationState: LocationInfo = {
		hash: isBrowser() ? window.location.hash : "",
		pathname: isBrowser() ? window.location.pathname : "",
		search: isBrowser() ? new URLSearchParams(window.location.search) : new URLSearchParams(),
		state: isBrowser() ? (window.history.state as LocationInfo["state"]) : null,
	};

	const initialState = locationState;

	const getState = () => locationState;

	const getInitialState = () => initialState;

	const triggerPopstateEvent = (state?: LocationInfo["state"]) => {
		// == This has to be done in order to actually trigger the popState event, otherwise it would only fire when the user clicks on the forward/back button.
		// LINK - https://stackoverflow.com/a/37492075/18813022
		window.dispatchEvent(new PopStateEvent("popstate", { state }));
	};

	const push: typeof pushState = (url, state) => {
		// TODO - Do an equality check here between the url being passed in and the current url to avoid useless re-renders

		pushState(url, state);

		triggerPopstateEvent(state);
	};

	const replace: typeof replaceState = (url, state) => {
		// TODO - Do an equality check here between the url being passed in and the current url to avoid useless re-renders

		replaceState(url, state);

		triggerPopstateEvent(state);
	};

	type Subscribe = StoreApi<LocationInfo>["subscribe"];

	const subscribe: Subscribe = (onLocationStoreChange, subscribeOptions = {}) => {
		const { fireListenerImmediately = false } = subscribeOptions;

		const previousLocationState = getState();

		const handleLocationStoreChange = () => {
			const newLocationState: LocationInfo = {
				hash: window.location.hash,
				pathname: window.location.pathname,
				search: new URLSearchParams(window.location.search),
				state: window.history.state as LocationInfo["state"],
			};

			locationState = newLocationState;

			onLocationStoreChange(newLocationState, previousLocationState);
		};

		if (fireListenerImmediately) {
			handleLocationStoreChange();
		}

		const removePopStateEvent = on("popstate", window, handleLocationStoreChange);

		return removePopStateEvent;
	};

	subscribe.withSelector = (selector, onStoreChange, subscribeOptions = {}) => {
		const { equalityFn: $equalityFn = equalityFn, fireListenerImmediately = false } = subscribeOptions;

		if (fireListenerImmediately) {
			const slice = selector(getState());

			onStoreChange(slice, slice);
		}

		const handleStoreChange: Parameters<Subscribe>[0] = (state, prevState) => {
			const previousSlice = selector(prevState);
			const slice = selector(state);

			if ($equalityFn(slice as never, previousSlice as never)) return;

			onStoreChange(slice, previousSlice);
		};

		return subscribe(handleStoreChange);
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
