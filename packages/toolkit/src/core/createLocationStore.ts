import { isBrowser } from "./constants";
import type { EqualityFn, StoreApi } from "./createStore";
import { on } from "./on";

export type LocationState = {
	hash: string;
	pathname: string;
	search: string;
	state: NonNullable<unknown> | null;
};

type LocationStoreOptions = {
	defaultState?: Partial<LocationState>;
	equalityFn?: EqualityFn<LocationState>;
};

/* eslint-disable unicorn/prefer-global-this */
const createLocationStore = (options: LocationStoreOptions = {}) => {
	const { defaultState, equalityFn = Object.is } = options;

	let locationState: LocationState = {
		hash: isBrowser() ? (defaultState?.hash ?? window.location.hash) : "",
		pathname: isBrowser() ? (defaultState?.pathname ?? window.location.pathname) : "",
		search: isBrowser() ? (defaultState?.search ?? window.location.search) : "",
		state: isBrowser()
			? (defaultState?.state ?? (window.history.state as LocationState["state"]))
			: null,
	};

	const initialState = locationState;

	const getState = () => locationState;

	const getInitialState = () => initialState;

	const triggerPopstateEvent = (state?: unknown) => {
		// == This has to be done in order to actually trigger the popState event, which usually only fires in the user clicks on the forward/back button.
		// LINK - https://stackoverflow.com/a/37492075/18813022
		window.dispatchEvent(new PopStateEvent("popstate", { state }));
	};

	const push = (url: string | URL, state: unknown = null) => {
		window.history.pushState(state, "", url);

		triggerPopstateEvent(state);
	};

	const replace = (url: string | URL, state: unknown = null) => {
		window.history.replaceState(state, "", url);

		triggerPopstateEvent(state);
	};

	const setLocationState = (nextLocationState: LocationState) => {
		if (equalityFn(locationState, nextLocationState)) {
			return locationState;
		}

		const previousLocationState = locationState;

		locationState = nextLocationState;

		return previousLocationState;
	};

	type Subscribe = StoreApi<LocationState>["subscribe"];

	const subscribe: Subscribe = (onLocationStoreChange) => {
		const handleLocationStoreChange = () => {
			const previousLocationState = setLocationState({
				hash: window.location.hash,
				pathname: window.location.pathname,
				search: window.location.search,
				state: window.history.state as LocationState["state"],
			});

			onLocationStoreChange(locationState, previousLocationState);
		};

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

export { createLocationStore };
